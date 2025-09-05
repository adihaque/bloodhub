"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Phone, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/app/firebase/config"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { createSecureUserData, logSecurityEvent } from "@/lib/security"

interface UserData {
  uid: string
  fullName: string
  email: string
  bloodGroup: string
  whatsappNumber: string
  createdAt: any
  lastDonation?: string
  role?: "donor" | "recipient" | "hospital"
}

export default function EditProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitToken, setSubmitToken] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  
  const [formData, setFormData] = useState({
    fullName: "",
    whatsappNumber: ""
  })

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Check if user has verified email
        if (!firebaseUser.emailVerified) {
          router.push(`/auth/verify-email?email=${encodeURIComponent(firebaseUser.email || "")}`)
          return
        }

        // Fetch user data from Firestore
        const fetchUserData = async () => {
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
            
            if (userDoc.exists()) {
              const userData = userDoc.data() as UserData
              
              setUser({
                uid: firebaseUser.uid,
                fullName: userData.fullName || firebaseUser.displayName || "User",
                email: userData.email || firebaseUser.email || "",
                bloodGroup: userData.bloodGroup || "Not specified",
                whatsappNumber: userData.whatsappNumber || "Not provided",
                createdAt: userData.createdAt,
                lastDonation: userData.lastDonation,
                role: userData.role || "donor"
              })
              
              // Pre-fill form with current data
              setFormData({
                fullName: userData.fullName || firebaseUser.displayName || "User",
                whatsappNumber: userData.whatsappNumber || ""
              })
            } else {
              // Create user with Firebase data as fallback
              setUser({
                uid: firebaseUser.uid,
                fullName: firebaseUser.displayName || "User",
                email: firebaseUser.email || "",
                bloodGroup: "Not specified",
                whatsappNumber: "Not provided",
                createdAt: new Date(),
                role: "donor"
              })
              
              // Pre-fill form with Firebase data
              setFormData({
                fullName: firebaseUser.displayName || "User",
                whatsappNumber: ""
              })
            }
          } catch (error) {
            console.error("Error fetching user data:", error)
            // Create user with Firebase data as fallback
            setUser({
              uid: firebaseUser.uid,
              fullName: firebaseUser.displayName || "User",
              email: firebaseUser.email || "",
              bloodGroup: "Not specified",
              whatsappNumber: "Not provided",
              createdAt: new Date(),
              role: "donor"
            })
            
            // Pre-fill form with Firebase data
            setFormData({
              fullName: firebaseUser.displayName || "User",
              whatsappNumber: ""
            })
          }
        }
        
        fetchUserData()
      } else {
        router.push('/auth/login')
      }
    })

    return () => unsubscribe()
  }, [router])

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {}
    
    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required"
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters"
    } else if (formData.fullName.trim().length > 100) {
      errors.fullName = "Full name must be less than 100 characters"
    }
    
    if (!formData.whatsappNumber.trim()) {
      errors.whatsappNumber = "WhatsApp number is required"
    } else if (!/^\+880[0-9]{10}$/.test(formData.whatsappNumber.replace(/\s|-/g, ''))) {
      errors.whatsappNumber = "Please enter a valid Bangladeshi phone number (e.g., +8801XXXXXXXXX)"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Prevent double-submit with token-based protection
    if (isSubmitting || submitToken) {
      return
    }

    const token = Math.random().toString(36).substring(7)
    setSubmitToken(token)
    setIsSubmitting(true)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      // Use security utilities to sanitize and validate input
      const secureUserData = createSecureUserData({
        fullName: formData.fullName,
        email: user!.email,
        bloodGroup: user!.bloodGroup,
        whatsappNumber: formData.whatsappNumber,
      })

      console.log("Updating profile with sanitized data:", {
        fullName: secureUserData.fullName,
        phone: secureUserData.whatsappNumber
      })

      // Log profile update attempt
      logSecurityEvent('profile_update_attempt', {
        uid: user!.uid,
        email: user!.email,
        hasValidData: true
      }, user!.uid)

      // Update user document in Firestore
      const userRef = doc(db, "users", user!.uid)
      await updateDoc(userRef, {
        fullName: secureUserData.fullName,
        whatsappNumber: secureUserData.whatsappNumber,
        updatedAt: serverTimestamp()
      })

      console.log("Profile updated successfully")

      // Log successful profile update
      logSecurityEvent('profile_update_success', {
        uid: user!.uid,
        email: user!.email
      }, user!.uid)

      setSuccessMessage("Profile updated successfully!")
      
      // Update local state
      setUser(prev => prev ? {
        ...prev,
        fullName: secureUserData.fullName,
        whatsappNumber: secureUserData.whatsappNumber
      } : null)

    } catch (error: any) {
      console.error("Profile update error:", error)
      
      // Log profile update failure
      logSecurityEvent('profile_update_failure', {
        error: error?.code || error?.message,
        uid: user!.uid,
        email: user!.email
      }, user!.uid)

      setErrorMessage("Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false)
      setSubmitToken(null)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
              <p className="text-muted-foreground">Update your personal information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal details. Some fields cannot be changed for security reasons.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Success Message */}
            {successMessage && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {errorMessage && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email (Read-only) */}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="pl-10 bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed for security reasons
                </p>
              </div>

              {/* Blood Group (Read-only) */}
              <div>
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="bloodGroup"
                    value={user.bloodGroup}
                    disabled
                    className="pl-10 bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Blood group cannot be changed after registration
                </p>
              </div>

              {/* Full Name (Editable) */}
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, fullName: e.target.value }))
                      if (formErrors.fullName) {
                        setFormErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors.fullName
                          return newErrors
                        })
                      }
                    }}
                    className={`pl-10 ${formErrors.fullName ? "border-destructive" : ""}`}
                    required
                  />
                </div>
                {formErrors.fullName && (
                  <p className="text-sm text-destructive mt-1">{formErrors.fullName}</p>
                )}
              </div>

              {/* WhatsApp Number (Editable) */}
              <div>
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="whatsappNumber"
                    type="tel"
                    placeholder="+8801XXXXXXXXX"
                    value={formData.whatsappNumber}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))
                      if (formErrors.whatsappNumber) {
                        setFormErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors.whatsappNumber
                          return newErrors
                        })
                      }
                    }}
                    className={`pl-10 ${formErrors.whatsappNumber ? "border-destructive" : ""}`}
                    required
                  />
                </div>
                {formErrors.whatsappNumber && (
                  <p className="text-sm text-destructive mt-1">{formErrors.whatsappNumber}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Format: +880 followed by 10 digits (e.g., +8801XXXXXXXXX)
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Updating Profile..." : "Update Profile"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
