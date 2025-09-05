"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Droplets, AlertTriangle, Users, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { db } from "@/app/firebase/config"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"

interface QuickUser {
  id: string
  name: string
  bloodGroup: string
  phone: string
  location: string
  coordinates?: { lat: number; lng: number }
  registeredAt: Date
}

export default function QuickUserPage() {
  const router = useRouter()
  const [quickUser, setQuickUser] = useState<QuickUser | null>(null)
  const [nearbyRequests, setNearbyRequests] = useState<any[]>([])

  useEffect(() => {
    // Get quick user data from localStorage
    const storedUser = localStorage.getItem('quickUser')
    if (storedUser) {
      setQuickUser(JSON.parse(storedUser))
    } else {
      // Redirect to home if no quick user data
      router.push('/')
    }
  }, [router])

  useEffect(() => {
    // Load nearby blood requests
    loadNearbyRequests()
  }, [])

  const loadNearbyRequests = async () => {
    try {
      // Fetch active blood requests from Firestore
      const requestsRef = collection(db, "requests")
      const q = query(
        requestsRef,
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(10)
      )
      
      const querySnapshot = await getDocs(q)
      const requests = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
        const timeAgo = getTimeAgo(createdAt)
        
        return {
          id: doc.id,
          patientName: data.patientName || "Anonymous Patient",
          bloodGroup: data.bloodGroup,
          units: data.quantity || 1,
          urgency: data.urgency || "Moderate",
          hospital: data.location || "Hospital Location",
          distance: "Calculating...", // Would calculate based on user location
          timePosted: timeAgo
        }
      })
      
      setNearbyRequests(requests)
    } catch (error) {
      console.error("Error loading nearby requests:", error)
      setNearbyRequests([])
    }
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} days ago`
  }

  const handleLogout = () => {
    localStorage.removeItem('quickUser')
    router.push('/')
  }

  if (!quickUser) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Quick User Dashboard</h1>
              <p className="text-primary-foreground/80">Temporary access - Data will be archived in 15 days</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* User Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-6 w-6 text-primary" />
              Welcome, {quickUser.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {quickUser.bloodGroup}
                </div>
                <div>
                  <p className="font-semibold">Blood Group</p>
                  <p className="text-sm text-muted-foreground">{quickUser.bloodGroup}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Phone</p>
                  <p className="text-sm text-muted-foreground">{quickUser.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Location</p>
                  <p className="text-sm text-muted-foreground">{quickUser.location}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nearby Requests */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-primary" />
            Nearby Blood Requests
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {nearbyRequests.map((request) => (
              <Card key={request.id} className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {request.bloodGroup}
                      </div>
                      {request.units} units needed
                    </CardTitle>
                    <Badge variant={request.urgency === "Critical" ? "destructive" : "secondary"}>
                      {request.urgency}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">{request.patientName}</p>
                    <p className="text-muted-foreground">{request.hospital}</p>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {request.distance} away
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {request.timePosted}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button size="sm" className="w-full">
                      Contact Hospital
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="text-center p-6">
            <CardContent>
              <Droplets className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ready to Donate?</h3>
              <p className="text-muted-foreground mb-4">
                If you're available to donate blood, let nearby hospitals know.
              </p>
              <Button className="w-full">I'm Available</Button>
            </CardContent>
          </Card>
          <Card className="text-center p-6">
            <CardContent>
              <AlertTriangle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Create Full Account</h3>
              <p className="text-muted-foreground mb-4">
                Convert to a permanent account for better features and tracking.
              </p>
              <Link href="/auth/signup">
                <Button className="w-full">Sign Up</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-muted-foreground">
          <p className="text-sm">
            This is a temporary account. Your data will be automatically archived in 15 days.
          </p>
          <p className="text-sm mt-2">
            For permanent access, please create a full account.
          </p>
        </div>
      </div>
    </div>
  )
}


