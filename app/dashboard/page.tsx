"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/app/firebase/config"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { DonorDashboard } from "@/components/donor-dashboard"
import { RecipientDashboard } from "@/components/recipient-dashboard"
import { HospitalDashboard } from "@/components/hospital-dashboard"

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

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser)
        
        // Check if user has verified email
        if (!firebaseUser.emailVerified) {
          router.push(`/auth/verify-email?email=${encodeURIComponent(firebaseUser.email || "")}`)
          return
        }

        try {
          // Fetch user data from Firestore
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
        }
      } else {
        setUser(null)
      }
      
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Determine dashboard type based on user role
  switch (user.role) {
    case "recipient":
      return <RecipientDashboard user={user} />
    case "hospital":
      return <HospitalDashboard user={user} />
    case "donor":
    default:
      return <DonorDashboard user={user} />
  }
}
