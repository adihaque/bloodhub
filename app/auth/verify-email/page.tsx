"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle, RefreshCw } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { auth, db } from "@/app/firebase/config"
import { sendEmailVerification, onAuthStateChanged } from "firebase/auth"
import { getFunctions, httpsCallable } from "firebase/functions"
import { getFriendlyErrorMessage, logSecurityEvent } from "@/lib/security"

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60) // 1 minute cooldown
  const [user, setUser] = useState<any>(null)
  const [verificationAttempts, setVerificationAttempts] = useState(0)
  const [autoPolling, setAutoPolling] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const functions = getFunctions()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        // Check if email is verified
        if (user.emailVerified) {
          console.log("User email verified, redirecting to dashboard")
          
          // Log successful verification
          logSecurityEvent('email_verification_success', {
            uid: user.uid,
            email: user.email
          }, user.uid)
          
          router.push('/dashboard')
        }
      } else {
        console.log("No user found, redirecting to login")
        router.push('/auth/login')
      }
    })
    return unsubscribe
  }, [router])

  // Persistent cooldown using localStorage
  useEffect(() => {
    if (user) {
      const cooldownKey = `emailResend_${user.uid}`
      const stored = localStorage.getItem(cooldownKey)
      if (stored) {
        try {
          const { lastSent } = JSON.parse(stored)
          const timeSince = Math.floor((Date.now() - lastSent) / 1000)
          if (timeSince < 60) {
            setTimeLeft(60 - timeSince)
            setCanResend(false)
          } else {
            setCanResend(true)
          }
        } catch (error) {
          console.error("Error parsing stored cooldown:", error)
          // Reset if corrupted
          localStorage.removeItem(cooldownKey)
          setCanResend(true)
        }
      } else {
        setCanResend(true)
      }
    }
  }, [user])

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setCanResend(true)
    }
  }, [timeLeft, canResend])

  // Auto-polling for verification status with exponential backoff
  useEffect(() => {
    if (user && !user.emailVerified && !autoPolling) {
      setAutoPolling(true)
      let attemptCount = 0
      let pollInterval: NodeJS.Timeout
      
      const startPolling = () => {
        pollInterval = setInterval(async () => {
          attemptCount++
          setVerificationAttempts(attemptCount)
          
          try {
            await user.reload()
            if (user.emailVerified) {
              clearInterval(pollInterval)
              setAutoPolling(false)
              
              // Log successful verification via polling
              logSecurityEvent('email_verification_success', {
                uid: user.uid,
                email: user.email,
                method: 'auto_polling',
                attempts: attemptCount
              }, user.uid)
              
              router.push('/dashboard')
              return
            }
            
            // Stop polling after 15 attempts (about 2 minutes)
            if (attemptCount >= 15) {
              clearInterval(pollInterval)
              setAutoPolling(false)
              console.log("Auto-polling stopped after maximum attempts")
            }
                  } catch (error: any) {
          console.error("Auto-polling error:", error)
          clearInterval(pollInterval)
          setAutoPolling(false)
          
          // Log polling error
          logSecurityEvent('verification_polling_error', {
            error: error?.code || error?.message,
            uid: user.uid,
            attempts: attemptCount
          }, user.uid)
        }
        }, 8000) // Poll every 8 seconds
      }
      
      startPolling()

      return () => {
        if (pollInterval) {
          clearInterval(pollInterval)
        }
      }
    }
  }, [user, autoPolling, router])

  const handleResend = async () => {
    if (!user || !canResend) return
    
    setIsLoading(true)
    setErrorMessage("")
    
    try {
      console.log("Resending email verification to:", user.email)
      
      // Try Cloud Function first (rate-limited, server-side)
      try {
        const sendVerificationEmail = httpsCallable(functions, 'sendVerificationEmail')
        const result = await sendVerificationEmail({})
        console.log("Cloud Function result:", result)
        
        // Log successful Cloud Function call
        logSecurityEvent('verification_email_sent_cloud_function', {
          uid: user.uid,
          email: user.email,
          method: 'cloud_function'
        }, user.uid)
        
        // Store cooldown in localStorage
        const cooldownKey = `emailResend_${user.uid}`
        localStorage.setItem(cooldownKey, JSON.stringify({ lastSent: Date.now() }))
        
        setTimeLeft(60)
        setCanResend(false)
        setErrorMessage("Verification email sent successfully!")
        
      } catch (cloudFunctionError: any) {
        console.log("Cloud Function failed, falling back to client-side:", cloudFunctionError)
        
        // Fallback to client-side sending
        await sendEmailVerification(user)
        console.log("Email verification resent successfully via client-side")
        
        // Log fallback usage
        logSecurityEvent('verification_email_sent_fallback', {
          uid: user.uid,
          email: user.email,
          method: 'client_side',
          cloud_function_error: (cloudFunctionError as any)?.code || (cloudFunctionError as any)?.message
        }, user.uid)
        
        // Store cooldown in localStorage
        const cooldownKey = `emailResend_${user.uid}`
        localStorage.setItem(cooldownKey, JSON.stringify({ lastSent: Date.now() }))
        
        setTimeLeft(60)
        setCanResend(false)
        setErrorMessage("Verification email sent successfully!")
      }
      
    } catch (error: any) {
      console.error("Failed to resend email:", error)
      
      // Log resend failure
      logSecurityEvent('verification_email_resend_failure', {
        error: error?.code || error?.message,
        uid: user.uid,
        email: user.email
      }, user.uid)
      
      // Use friendly error messages
      const friendlyMessage = getFriendlyErrorMessage(error)
      setErrorMessage(friendlyMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckVerification = async () => {
    if (!user) return
    
    setIsLoading(true)
    setVerificationAttempts(prev => prev + 1)
    setErrorMessage("")
    
    try {
      // Reload user to check email verification status
      await user.reload()
      if (user.emailVerified) {
        console.log("Email verified successfully, redirecting to dashboard")
        
        // Log successful manual verification check
        logSecurityEvent('email_verification_success', {
          uid: user.uid,
          email: user.email,
          method: 'manual_check'
        }, user.uid)
        
        router.push('/dashboard')
      } else {
        console.log("Email not verified yet")
        setErrorMessage("Email not verified yet. Please check your inbox and click the verification link.")
      }
    } catch (error: any) {
      console.error("Failed to check verification:", error)
      
      // Log verification check failure
      logSecurityEvent('verification_check_failure', {
        error: error?.code || error?.message,
        uid: user.uid,
        email: user.email
      }, user.uid)
      
      // Use friendly error messages
      const friendlyMessage = getFriendlyErrorMessage(error)
      setErrorMessage(friendlyMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to
            <br />
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{errorMessage}</p>
            </div>
          )}
          
          {/* Instructions */}
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              1. Check your email inbox (and spam folder)
            </p>
            <p className="text-sm text-muted-foreground">
              2. Click the verification link in the email
            </p>
            <p className="text-sm text-muted-foreground">
              3. Come back here and click "I've Verified My Email"
            </p>
            
            {/* Auto-polling status */}
            {autoPolling && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  🔄 Automatically checking verification status...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Attempts: {verificationAttempts}/15
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleCheckVerification} 
              className="w-full" 
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isLoading ? "Checking..." : "I've Verified My Email"}
            </Button>

            <Button
              variant="outline"
              onClick={handleResend}
              disabled={!canResend || isLoading}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isLoading ? "Sending..." : `Resend Email ${!canResend ? `(${timeLeft}s)` : ""}`}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Didn't receive the email?</p>
            <p>Check your spam folder or try resending</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 