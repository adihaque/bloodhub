"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  Droplets,
  Calendar,
  MapPin,
  Bell,
  Clock,
  Heart,
  Upload,
  User,
  Phone,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { useApp } from "@/components/providers"

export function DonorDashboard() {
  const { user } = useApp()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  // Calculate days since last donation and eligibility
  const lastDonationDate = new Date(user?.lastDonation || "2024-01-15")
  const today = new Date()
  const daysSinceLastDonation = Math.floor((today.getTime() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysUntilEligible = Math.max(0, 90 - daysSinceLastDonation)
  const isEligible = daysUntilEligible === 0
  const eligibilityProgress = Math.min(100, (daysSinceLastDonation / 90) * 100)

  const nearbyRequests = [
    {
      id: 1,
      bloodGroup: "O+",
      quantity: "2 units",
      location: "Dhaka Medical College",
      distance: "1.2 km",
      urgency: "Critical",
      timePosted: "15 mins ago",
      patient: "Emergency Surgery",
    },
    {
      id: 2,
      bloodGroup: "O+",
      quantity: "1 unit",
      location: "Square Hospital",
      distance: "2.8 km",
      urgency: "Urgent",
      timePosted: "32 mins ago",
      patient: "Accident Victim",
    },
  ]

  const donationHistory = [
    { date: "2024-01-15", location: "Red Crescent", status: "Completed" },
    { date: "2023-10-10", location: "Dhaka Medical", status: "Completed" },
    { date: "2023-07-05", location: "Square Hospital", status: "Completed" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Donor Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={user?.isVerified ? "default" : "secondary"} className="flex items-center">
                {user?.isVerified ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                {user?.isVerified ? "Verified" : "Unverified"}
              </Badge>
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {user?.bloodGroup}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <p className="font-semibold">{user?.bloodGroup}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Donation</p>
                  <p className="font-semibold">{daysSinceLastDonation} days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Next Eligible</p>
                  <p className="font-semibold">{isEligible ? "Now" : `${daysUntilEligible} days`}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Health Status</p>
                  <Badge variant={user?.healthStatus === "good" ? "default" : "secondary"}>
                    {user?.healthStatus || "Good"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Eligibility Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Donation Eligibility
            </CardTitle>
            <CardDescription>You can donate blood every 90 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={eligibilityProgress} className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Last donation: {lastDonationDate.toLocaleDateString()}</span>
                <span>{isEligible ? "Eligible now!" : `${daysUntilEligible} days remaining`}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Help save lives in your area</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" size="lg" disabled={!isEligible}>
                <Droplets className="mr-2 h-5 w-5" />
                Accept Blood Request
              </Button>
              <Button variant="outline" className="w-full bg-transparent" size="lg" disabled={!isEligible}>
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Appointment
              </Button>
              <Button variant="outline" className="w-full bg-transparent" size="lg">
                <Upload className="mr-2 h-5 w-5" />
                Upload Health Report
              </Button>
              <Button variant="outline" className="w-full bg-transparent" size="lg">
                <User className="mr-2 h-5 w-5" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Nearby Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Nearby Requests
              </CardTitle>
              <CardDescription>Blood requests in your area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nearbyRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {request.bloodGroup}
                        </div>
                        <span className="font-medium">{request.quantity}</span>
                      </div>
                      <Badge variant={request.urgency === "Critical" ? "destructive" : "secondary"}>
                        {request.urgency}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {request.location} • {request.distance}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {request.timePosted}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1" disabled={!isEligible}>
                        <Phone className="h-3 w-3 mr-1" />
                        Contact
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Donation History */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Donation History</CardTitle>
            <CardDescription>Your past blood donations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {donationHistory.map((donation, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Droplets className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{donation.location}</p>
                      <p className="text-sm text-muted-foreground">{donation.date}</p>
                    </div>
                  </div>
                  <Badge variant="default">{donation.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
