"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, MapPin, Clock, Users, Phone, CheckCircle, X, Siren, Activity } from "lucide-react"
import { useApp } from "@/components/providers"

export default function IncidentModePage() {
  const { currentIncident, user } = useApp()
  const [donorCount, setDonorCount] = useState(0)
  const [responseTime, setResponseTime] = useState(0)
  const [isAccepted, setIsAccepted] = useState(false)

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setDonorCount((prev) => prev + Math.floor(Math.random() * 3))
      setResponseTime((prev) => prev + 1)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const incidentData = {
    title: "Milestone Jet Crash Emergency",
    location: "Diabari, Uttara",
    tag: "#JetCrash",
    casualties: 15,
    timeStarted: "2 hours ago",
    bloodNeeded: [
      { type: "O-", needed: 8, available: 3 },
      { type: "A+", needed: 5, available: 4 },
      { type: "B+", needed: 4, available: 2 },
      { type: "AB-", needed: 3, available: 1 },
    ],
    nearbyDonors: 47,
    respondedDonors: 12,
    confirmedDonors: 8,
  }

  const liveUpdates = [
    { time: "2 mins ago", message: "New donor confirmed: John D. (O-) - ETA 15 mins", type: "success" },
    { time: "5 mins ago", message: "Emergency broadcast sent to 150 nearby donors", type: "info" },
    { time: "8 mins ago", message: "Critical blood shortage alert: O- type needed urgently", type: "warning" },
    { time: "12 mins ago", message: "Incident mode activated for Jet Crash emergency", type: "error" },
  ]

  const handleAcceptDonation = () => {
    setIsAccepted(true)
    // Simulate acceptance logic
  }

  const handleCancelDonation = () => {
    setIsAccepted(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Emergency Header */}
      <div className="emergency-gradient text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Siren className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">EMERGENCY MODE ACTIVE</h1>
                <p className="text-red-100">{incidentData.title}</p>
              </div>
            </div>
            <Badge variant="destructive" className="animate-pulse text-lg px-4 py-2">
              CRITICAL
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Incident Overview */}
        <Card className="mb-8 border-l-4 border-l-destructive">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <AlertTriangle className="mr-2 h-6 w-6 text-destructive" />
                  {incidentData.title}
                </CardTitle>
                <CardDescription className="flex items-center mt-2">
                  <MapPin className="mr-2 h-4 w-4" />
                  {incidentData.location} • Started {incidentData.timeStarted}
                </CardDescription>
              </div>
              <Badge variant="destructive" className="text-lg px-4 py-2">
                {incidentData.tag}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-destructive">{incidentData.casualties}</div>
                <p className="text-sm text-muted-foreground">Casualties</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{incidentData.nearbyDonors}</div>
                <p className="text-sm text-muted-foreground">Nearby Donors</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{incidentData.respondedDonors}</div>
                <p className="text-sm text-muted-foreground">Responded</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{incidentData.confirmedDonors}</div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Blood Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Blood Requirements
              </CardTitle>
              <CardDescription>Real-time blood availability vs. requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {incidentData.bloodNeeded.map((blood) => {
                  const percentage = (blood.available / blood.needed) * 100
                  const isShortage = percentage < 50

                  return (
                    <div key={blood.type}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                            {blood.type}
                          </div>
                          <span className="font-medium">
                            {blood.available} / {blood.needed} units
                          </span>
                        </div>
                        {isShortage && (
                          <Badge variant="destructive" className="animate-pulse">
                            SHORTAGE
                          </Badge>
                        )}
                      </div>
                      <Progress value={percentage} className={`w-full ${isShortage ? "bg-red-100" : ""}`} />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Donor Action Panel */}
          {user?.role === "donor" && (
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Emergency Response
                </CardTitle>
                <CardDescription>Your immediate action can save lives</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-medium mb-2">Your Blood Type: {user.bloodGroup}</p>
                    <p className="text-sm text-muted-foreground">
                      {incidentData.bloodNeeded.find((b) => b.type === user.bloodGroup)
                        ? `URGENTLY NEEDED - ${incidentData.bloodNeeded.find((b) => b.type === user.bloodGroup)?.needed} units required`
                        : "Your blood type is not currently in critical demand for this incident"}
                    </p>
                  </div>

                  {!isAccepted ? (
                    <div className="space-y-3">
                      <Button className="w-full" size="lg" onClick={handleAcceptDonation}>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Accept Emergency Donation
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent" onClick={handleCancelDonation}>
                        <X className="mr-2 h-5 w-5" />
                        Cannot Donate
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          <span className="font-medium text-green-800">Donation Accepted!</span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          Please proceed to {incidentData.location} immediately
                        </p>
                      </div>
                      <Button variant="outline" className="w-full bg-transparent">
                        <Phone className="mr-2 h-4 w-4" />
                        Call Emergency Coordinator
                      </Button>
                      <Button variant="destructive" className="w-full" onClick={handleCancelDonation}>
                        Cancel Donation
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Live Updates */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Live Updates
              </CardTitle>
              <CardDescription>Real-time incident updates and donor responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {liveUpdates.map((update, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        update.type === "success"
                          ? "bg-green-500"
                          : update.type === "warning"
                            ? "bg-yellow-500"
                            : update.type === "error"
                              ? "bg-red-500"
                              : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm">{update.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{update.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contact */}
        <Card className="mt-8 bg-destructive/5 border-destructive/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Emergency Hotline</h3>
                <p className="text-muted-foreground">24/7 emergency coordination center</p>
              </div>
              <Button size="lg" variant="destructive">
                <Phone className="mr-2 h-5 w-5" />
                Call 999
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
