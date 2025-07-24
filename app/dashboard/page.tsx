"use client"

import { useEffect, useState } from "react"
import { useApp } from "@/components/providers"
import { DonorDashboard } from "@/components/donor-dashboard"
import { RecipientDashboard } from "@/components/recipient-dashboard"
import { HospitalDashboard } from "@/components/hospital-dashboard"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { user, setUser } = useApp()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate user authentication check
    setTimeout(() => {
      // Mock user data - in real app, this would come from authentication
      setUser({
        id: "1",
        name: "John Doe",
        phone: "+880 1234-567890",
        bloodGroup: "O+",
        role: "donor", // Change this to test different dashboards
        location: {
          lat: 23.8103,
          lng: 90.4125,
          address: "Dhaka, Bangladesh",
        },
        isVerified: true,
        lastDonation: "2024-01-15",
        healthStatus: "good",
      })
      setIsLoading(false)
    }, 1000)
  }, [setUser])

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
    router.push("/auth/login")
    return null
  }

  switch (user.role) {
    case "donor":
      return <DonorDashboard />
    case "recipient":
      return <RecipientDashboard />
    case "hospital":
      return <HospitalDashboard />
    default:
      return <DonorDashboard />
  }
}
