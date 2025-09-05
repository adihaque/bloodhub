"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { auth } from "@/app/firebase/config"
import { onAuthStateChanged } from "firebase/auth"

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/verify-email"
]

// Routes that require email verification
const verifiedRoutes = [
  "/dashboard",
  "/incident"
]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true)
        setIsEmailVerified(user.emailVerified)
        
        // If user is not email verified and trying to access protected routes
        if (!user.emailVerified && verifiedRoutes.some(route => pathname.startsWith(route))) {
          console.log("User not verified, redirecting to verify-email")
          router.push(`/auth/verify-email?email=${encodeURIComponent(user.email || "")}`)
          return
        }
        
        // If user is verified and on auth pages, redirect to dashboard
        if (user.emailVerified && pathname.startsWith("/auth/")) {
          console.log("User verified, redirecting to dashboard")
          router.push("/dashboard")
          return
        }
      } else {
        setIsAuthenticated(false)
        setIsEmailVerified(false)
        
        // If trying to access protected routes without auth
        if (verifiedRoutes.some(route => pathname.startsWith(route))) {
          console.log("User not authenticated, redirecting to login")
          router.push("/auth/login")
          return
        }
      }
      
      setIsLoading(false)
    })

    return unsubscribe
  }, [router, pathname])

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Allow access to public routes
  if (PUBLIC_ROUTES.some((route: string) => pathname.startsWith(route))) {
    return <>{children}</>
  }

  // Require authentication for protected routes
  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  // Require email verification for verified routes
  if (!isEmailVerified && verifiedRoutes.some(route => pathname.startsWith(route))) {
    return null // Will redirect to verify-email
  }

  return <>{children}</>
} 