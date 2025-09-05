"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Droplets, Mail, Lock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { auth, db } from "@/app/firebase/config"
import { useSignInWithEmailAndPassword, useSignInWithGoogle } from "react-firebase-hooks/auth"
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { getFriendlyErrorMessage, logSecurityEvent, normalizeEmail } from "@/lib/security"

export default function LoginPage() {
  const router = useRouter()
  
  const [signInWithEmailAndPassword, user, loading, error] = useSignInWithEmailAndPassword(auth)
  const [signInWithGoogle, googleUser, googleLoading, googleError] = useSignInWithGoogle(auth)
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  
  // Handle successful login redirects
  useEffect(() => {
    if (user && !loading) {
      console.log("Login successful, user:", user)
      
      // Log successful login
      logSecurityEvent('login_success', {
        uid: user.user.uid,
        email: user.user.email,
        method: 'email'
      }, user.user.uid)
      
      if (user.user.emailVerified) {
        // Check if user has Firestore profile before redirecting to dashboard
        checkUserProfileAndRedirect(user.user.uid, "/dashboard")
      } else {
        // User is not verified - show message and offer to resend verification
        setFormErrors({
          general: "Please verify your email address before signing in. Check your inbox or click 'Resend Verification' below."
        })
        // Don't redirect - let user see the error message
      }
    }
  }, [user, loading, router])
  
  // Handle Google login redirects
  useEffect(() => {
    if (googleUser && !googleLoading) {
      console.log("Google login successful, user:", googleUser)
      
      // Log successful Google login
      logSecurityEvent('login_success', {
        uid: googleUser.user.uid,
        email: googleUser.user.email,
        method: 'google'
      }, googleUser.user.uid)
      
      if (googleUser.user.emailVerified) {
        // Check if Google user has Firestore profile before redirecting
        checkUserProfileAndRedirect(googleUser.user.uid, "/dashboard")
      } else {
        // Google user is not verified - redirect to verification page
        router.push(`/auth/verify-email?email=${encodeURIComponent(googleUser.user.email || "")}`)
      }
    }
  }, [googleUser, googleLoading, router])

  // Helper function to check user profile and redirect accordingly
  const checkUserProfileAndRedirect = async (uid: string, defaultRedirect: string) => {
    try {
      const docSnap = await getDoc(doc(db, "users", uid))
      if (!docSnap.exists()) {
        console.log("User profile not found in Firestore")
        // Check if this is a Google user (they need to complete profile)
        // Regular signup users should have their profile saved, so redirect to dashboard
        const user = auth.currentUser
        console.log("User without profile, redirecting to signup")
        router.push("/auth/signup")
      } else {
        const userData = docSnap.data()
        // Check if profile is incomplete (missing required fields)
        if (!userData.bloodGroup || !userData.whatsappNumber) {
          console.log("User profile incomplete, redirecting to signup")
          router.push("/auth/signup")
        } else {
          console.log("User profile found and complete, redirecting to dashboard")
          router.push(defaultRedirect)
        }
      }
    } catch (err) {
      console.error("Error checking user profile:", err)
      // If we can't check the profile, redirect to dashboard as fallback
      router.push(defaultRedirect)
    }
  }

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {}
    
    if (!email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address"
    }
    
    if (!password) {
      errors.password = "Password is required"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    // Normalize email input using security utility
    const normalizedEmail = normalizeEmail(email)
    
    try {
      // Log login attempt
      logSecurityEvent('login_attempt', {
        email: normalizedEmail,
        hasValidData: true
      })
      
      await signInWithEmailAndPassword(normalizedEmail, password)
      // Redirect is handled by useEffect when user changes
    } catch (error: any) {
      console.error("Login error raw:", error)
      
      // Log failed login attempt
      logSecurityEvent('login_failure', {
        error: error?.code || error?.message,
        email: normalizedEmail
      })
      
      // Use friendly error messages from security utility
      const friendlyMessage = getFriendlyErrorMessage(error)
      
      setFormErrors({
        general: friendlyMessage
      })
    }
  }

  const handleGoogleLogin = async () => {
    try {
      // Log Google login attempt
      logSecurityEvent('login_attempt', {
        method: 'google',
        hasValidData: true
      })
      
      await signInWithGoogle()
      // Redirect is handled by useEffect when googleUser changes
    } catch (error: any) {
      console.error("Google login error:", error)
      
      // Log failed Google login
      logSecurityEvent('login_failure', {
        error: error?.code || error?.message,
        method: 'google'
      })
      
      setFormErrors({
        general: getFriendlyErrorMessage(error) || "Google login failed. Please try again."
      })
    }
  }

  const handleResendVerification = async () => {
    if (!user?.user) return
    
    try {
      await sendEmailVerification(user.user)
      
      // Log verification email sent
      logSecurityEvent('verification_email_sent', {
        uid: user.user.uid,
        email: user.user.email
      }, user.user.uid)
      
      setFormErrors({
        general: "Verification email sent! Please check your inbox."
      })
    } catch (error: any) {
      console.error("Failed to send verification email:", error)
      
      // Log verification email failure
      logSecurityEvent('verification_email_failure', {
        error: error?.code || error?.message,
        uid: user.user.uid
      }, user.user.uid)
      
      setFormErrors({
        general: getFriendlyErrorMessage(error) || "Failed to send verification email. Please try again."
      })
    }
  }

  const handleCheckVerification = async () => {
    if (!user?.user) return
    
    try {
      await user.user.reload()
      if (user.user.emailVerified) {
        setFormErrors({
          general: "Email verified! Redirecting to dashboard..."
        })
        
        // Log successful verification
        logSecurityEvent('email_verification_success', {
          uid: user.user.uid,
          email: user.user.email
        }, user.user.uid)
        
        setTimeout(() => router.push("/dashboard"), 1500)
      } else {
        setFormErrors({
          general: "Email not verified yet. Please check your inbox and click the verification link."
        })
      }
    } catch (error: any) {
      console.error("Failed to check verification status:", error)
      
      // Log verification check failure
      logSecurityEvent('verification_check_failure', {
        error: error?.code || error?.message,
        uid: user.user.uid
      }, user.user.uid)
      
      setFormErrors({
        general: getFriendlyErrorMessage(error) || "Failed to check verification status. Please try again."
      })
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Droplets className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your BloodLink account</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error Alert */}
          {(error || googleError || formErrors.general) && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {formErrors.general || 
                 (error?.message || error?.code) || 
                 (googleError?.message || googleError?.code) || 
                 "An error occurred"}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (formErrors.email) {
                      setFormErrors(prev => ({ ...prev, email: undefined }))
                    }
                  }}
                  className={`pl-10 ${formErrors.email ? "border-destructive" : ""}`}
                  required
                />
              </div>
              {formErrors.email && (
                <p className="text-sm text-destructive mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (formErrors.password) {
                      setFormErrors(prev => ({ ...prev, password: undefined }))
                    }
                  }}
                  className={`pl-10 ${formErrors.password ? "border-destructive" : ""}`}
                  required
                />
              </div>
              {formErrors.password && (
                <p className="text-sm text-destructive mt-1">{formErrors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Resend Verification Button - Only show when user is not verified */}
          {user && !user.user.emailVerified && (
            <div className="mt-4 text-center space-y-2">
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleResendVerification}
                disabled={loading}
              >
                📧 Resend Verification Email
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleCheckVerification}
                disabled={loading}
              >
                🔄 Check Verification Status
              </Button>
            </div>
          )}

          <div className="mt-6 text-center space-y-2">
            <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
              Forgot your password?
            </Link>
            <div className="text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/auth/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
