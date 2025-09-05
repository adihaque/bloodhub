"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Droplets, User, Heart, Mail, Eye, EyeOff, AlertCircle, Phone, MapPin, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { auth, db } from "@/app/firebase/config"
import { useCreateUserWithEmailAndPassword, useSignInWithGoogle } from "react-firebase-hooks/auth"
import { updateProfile } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { sendEmailVerification } from "firebase/auth"
import { 
  createSecureUserData, 
  getFriendlyErrorMessage, 
  logSecurityEvent 
} from "@/lib/security"
import LocationSelector from "@/components/LocationSelector"

interface FormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  bloodGroup: string
  phoneNumber: string
  whatsappNumber: string
  useSameNumber: boolean
  agreeTerms: boolean
  location: string
  coordinates?: { lat: number; lng: number }
}

interface FormErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
  bloodGroup?: string
  phoneNumber?: string
  whatsappNumber?: string
  useSameNumber?: string
  agreeTerms?: string
  location?: string
  coordinates?: string
  general?: string
}

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export default function SignupPage() {
  const router = useRouter()
  
  const [createUserWithEmailAndPassword, user, loading, error] = useCreateUserWithEmailAndPassword(auth)
  const [signInWithGoogle, googleUser, googleLoading, googleError] = useSignInWithGoogle(auth)
  
  // Handle Google user state changes
  useEffect(() => {
    if (googleUser && 'user' in googleUser && googleUser.user) {
      // Google signup successful, redirect to dashboard
      router.push('/dashboard')
    }
  }, [googleUser, router])
  
  // Handle regular user state changes - redirect to dashboard
  useEffect(() => {
    if (user && !loading) {
      console.log("Regular signup successful, user:", user)
      // Regular signup users have already provided all required info
      // They will be redirected to email verification in handleSubmit
    }
  }, [user, loading])
  
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    bloodGroup: "",
    phoneNumber: "",
    whatsappNumber: "",
    useSameNumber: true,
    agreeTerms: false,
    location: "",
  })
  
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitToken, setSubmitToken] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<{
    division: string;
    district: string;
    subDistrict: string;
  } | null>(null)

  const handleLocationChange = (location: any) => {
    setSelectedLocation(location);
    if (location?.subDistrict) {
      setFormData(prev => ({ 
        ...prev, 
        location: `${location.subDistrict}, ${location.district}, ${location.division}` 
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {}
    
    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required"
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }
    
    if (!formData.password) {
      errors.password = "Password is required"
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }
    
    if (!formData.bloodGroup) {
      errors.bloodGroup = "Blood group is required"
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required"
    }
    
    // If useSameNumber is true, WhatsApp number should be the same as phone number
    if (formData.useSameNumber) {
      if (!formData.phoneNumber.trim()) {
        errors.whatsappNumber = "Phone number is required to use as WhatsApp number"
      } else {
        // Set WhatsApp number to phone number when using same number
        setFormData(prev => ({ ...prev, whatsappNumber: prev.phoneNumber }))
      }
    } else if (!formData.whatsappNumber.trim()) {
      errors.whatsappNumber = "WhatsApp number is required"
    }
    
    if (!formData.location.trim()) {
      errors.location = "Location is required"
    }
    
    if (!formData.agreeTerms) {
      errors.agreeTerms = "You must agree to the terms and conditions"
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
    
    try {
      // Use security utilities to sanitize and validate input
      const secureUserData = createSecureUserData({
        fullName: formData.fullName,
        email: formData.email,
        bloodGroup: formData.bloodGroup,
        phoneNumber: formData.phoneNumber,
        whatsappNumber: formData.whatsappNumber,
      })
      
      // Add location data and ensure all fields are included
      const userDataWithLocation = {
        fullName: secureUserData.fullName,
        email: secureUserData.email,
        bloodGroup: formData.bloodGroup,
        phoneNumber: secureUserData.phoneNumber,
        whatsappNumber: secureUserData.whatsappNumber,
        location: formData.location,
        coordinates: formData.coordinates,
        locationDetails: selectedLocation,
        role: "donor" // Default role
      }
      
      console.log("Creating user with complete data:", userDataWithLocation)
      
      // Log security event
      logSecurityEvent('signup_attempt', {
        email: secureUserData.email,
        hasValidData: true
      })
      
      const userCredential = await createUserWithEmailAndPassword(secureUserData.email, formData.password)
      
      if (userCredential?.user) {
        // Update user profile with sanitized display name
        await updateProfile(userCredential.user, {
          displayName: secureUserData.fullName,
        })
        
        // Save sanitized user data to Firestore
        const userData = {
          ...userDataWithLocation,
          createdAt: serverTimestamp(),
        }
        
        try {
          await setDoc(doc(db, "users", userCredential.user.uid), userData)
          console.log("User data saved to Firestore successfully:", userData)
          
          // Log successful signup
          logSecurityEvent('signup_success', {
            uid: userCredential.user.uid,
            email: secureUserData.email
          }, userCredential.user.uid)
          
        } catch (firestoreError: any) {
          console.error("Failed to save user data to Firestore:", firestoreError)
          logSecurityEvent('signup_firestore_error', {
            error: firestoreError.message,
            uid: userCredential.user.uid
          }, userCredential.user.uid)
          
          // Continue with email verification even if Firestore fails
        }
        
        // Send email verification
        try {
          await sendEmailVerification(userCredential.user);
          console.log("Email verification sent successfully");
          
          // Sign out the user immediately after signup
          await auth.signOut()
          console.log("User signed out after signup - must verify email to login")
          
          // Redirect to email verification page
          router.push(`/auth/verify-email?email=${encodeURIComponent(secureUserData.email)}`);
        } catch (emailError: any) {
          console.error("Failed to send email verification:", emailError);
          logSecurityEvent('signup_email_error', {
            error: emailError.message,
            uid: userCredential.user.uid
          }, userCredential.user.uid)
          
          // Still redirect but show error
          setFormErrors({
            general: "Account created but email verification failed. Please check your email manually."
          });
          router.push(`/auth/verify-email?email=${encodeURIComponent(secureUserData.email)}`);
        }
      }
    } catch (error: any) {
      console.error("Signup error raw:", error)
      
      // Log security event for failed signup
      logSecurityEvent('signup_failure', {
        error: error?.code || error?.message,
        email: formData.email
      })
      
      // Use friendly error messages
      const friendlyMessage = getFriendlyErrorMessage(error)
      
      setFormErrors({
        general: friendlyMessage
      })
    } finally {
      setIsSubmitting(false)
      setSubmitToken(null)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle()
      // Redirect is handled by useEffect when googleUser changes
    } catch (error: any) {
      console.error("Google signup error:", error)
      logSecurityEvent('google_signup_failure', {
        error: error?.message || 'Unknown error'
      })
      
      setFormErrors({
        general: getFriendlyErrorMessage(error)
      })
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    let processedValue = value
    
    // Auto-format phone numbers
    if ((field === "phoneNumber" || field === "whatsappNumber") && typeof value === "string") {
      let phone = value.replace(/\D/g, '') // Remove non-digits
      if (phone.startsWith('880')) {
        phone = phone.substring(3) // Remove 880 if already there
      }
      if (phone.startsWith('0')) {
        phone = phone.substring(1) // Remove leading 0
      }
      if (phone.length > 0) {
        processedValue = `+880${phone}` as any
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }))
    
    // If phone number changes and useSameNumber is true, update WhatsApp number
    if (field === "phoneNumber" && formData.useSameNumber) {
      setFormData(prev => ({ ...prev, whatsappNumber: processedValue as string }))
    }
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const isLoading = loading || googleLoading || isSubmitting

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Droplets className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Join BloodLink</CardTitle>
          <CardDescription>Create your account to save lives</CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Error Alert */}
          {(error || googleError || formErrors.general) && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {formErrors.general || 
                 getFriendlyErrorMessage(error) || 
                 getFriendlyErrorMessage(googleError) || 
                 "An error occurred"}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className={`pl-10 ${formErrors.fullName ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
              </div>
              {formErrors.fullName && (
                <p className="text-sm text-destructive mt-1">{formErrors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`pl-10 ${formErrors.email ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
              </div>
              {formErrors.email && (
                <p className="text-sm text-destructive mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* Blood Group */}
            <div>
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select 
                value={formData.bloodGroup} 
                onValueChange={(value) => handleInputChange("bloodGroup", value)}
                disabled={isLoading}
              >
                <SelectTrigger className={formErrors.bloodGroup ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      <div className="flex items-center">
                        <span className="mr-2">{group}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.bloodGroup && (
                <p className="text-sm text-destructive mt-1">{formErrors.bloodGroup}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  className={`pl-10 ${formErrors.phoneNumber ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
              </div>
              {formErrors.phoneNumber && (
                <p className="text-sm text-destructive mt-1">{formErrors.phoneNumber}</p>
              )}
            </div>

            {/* WhatsApp Number */}
            <div>
              <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="useSameNumber"
                    checked={formData.useSameNumber}
                    onCheckedChange={(checked) => {
                      handleInputChange("useSameNumber", checked as boolean)
                      if (checked) {
                        setFormData(prev => ({ ...prev, whatsappNumber: prev.phoneNumber }))
                      }
                    }}
                    disabled={isLoading}
                  />
                  <Label htmlFor="useSameNumber" className="text-sm">
                    Same as phone number
                  </Label>
                </div>
                
                {!formData.useSameNumber && (
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="whatsappNumber"
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={formData.whatsappNumber}
                      onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                      className={`pl-10 ${formErrors.whatsappNumber ? "border-destructive" : ""}`}
                      disabled={isLoading}
                    />
                  </div>
                )}
                
                {formData.useSameNumber && (
                  <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                    WhatsApp number will be the same as your phone number: {formData.phoneNumber || "Not set"}
                  </div>
                )}
              </div>
              {formErrors.whatsappNumber && (
                <p className="text-sm text-destructive mt-1">{formErrors.whatsappNumber}</p>
              )}
            </div>
           
            <div>
              <LocationSelector
                onLocationChange={handleLocationChange}
                required={true}
                showAutoDetect={false}
                className="signup-location"
              />
              {formErrors.location && (
                <p className="text-sm text-destructive mt-1">{formErrors.location}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`pr-10 ${formErrors.password ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-sm text-destructive mt-1">{formErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={`pr-10 ${formErrors.confirmPassword ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">{formErrors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeTerms", checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="agreeTerms" className="text-sm">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              {formErrors.agreeTerms && (
                <p className="text-sm text-destructive">{formErrors.agreeTerms}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !formData.agreeTerms}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
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

          {/* Google Signup Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignup}
            disabled={isLoading}
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

          {/* Login Link */}
          <div className="mt-6 text-center">
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
