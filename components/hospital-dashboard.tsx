"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  AlertTriangle,
  Users,
  Activity,
  Building2,
  CheckCircle,
} from "lucide-react"
import { useApp } from "@/components/providers"

export function HospitalDashboard() {
  const { user } = useApp()
  const [showIncidentForm, setShowIncidentForm] = useState(false)
  const [incidentForm, setIncidentForm] = useState({
    title: "",
    location: "",
    description: "",
    estimatedCasualties: "",
    bloodNeeds: "",
    tag: "",
  })

  const activeRequests = [
    {
      id: 1,
      bloodGroup: "O-",
      quantity: "5 units",
      urgency: "Critical",
      patient: "Emergency Surgery",
      ward: "ICU-3",
      timePosted: "30 mins ago",
      responses: 2,
      status: "Active",
    },
    {
      id: 2,
      bloodGroup: "A+",
      quantity: "3 units",
      urgency: "Urgent",
      patient: "Accident Victim",
      ward: "Emergency",
      timePosted: "1 hour ago",
      responses: 4,
      status: "Pending",
    },
  ]

  const incidentRequests = [
    {
      id: 1,
      title: "Jet Crash Emergency",
      tag: "#JetCrash",
      location: "Diabari, Uttara",
      casualties: 15,
      bloodNeeded: "All types, priority O-",
      status: "Active",
      timeCreated: "2 hours ago",
    },
  ]

  const donorResponses = [
    {
      id: 1,
      donorName: "John Doe",
      bloodGroup: "O-",
      phone: "+880 1234-567890",
      distance: "1.2 km",
      isVerified: true,
      status: "Confirmed",
      eta: "15 mins",
    },
    {
      id: 2,
      donorName: "Jane Smith",
      bloodGroup: "A+",
      phone: "+880 1234-567891",
      distance: "2.1 km",
      isVerified: false,
      status: "Pending",
      eta: "25 mins",
    },
  ]

  const handleSubmitIncident = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting incident:", incidentForm)
    setShowIncidentForm(false)
    setIncidentForm({
      title: "",
      location: "",
      description: "",
      estimatedCasualties: "",
      bloodNeeds: "",
      tag: "",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Hospital Dashboard</h1>
              <p className="text-muted-foreground flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                {user?.name || "Medical Center"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowIncidentForm(true)}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Report Incident
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Incident Form */}
        {showIncidentForm && (
          <Card className="mb-8 border-l-4 border-l-destructive">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Report Mass Casualty Incident
              </CardTitle>
              <CardDescription>Create an emergency incident report for mass casualty events</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitIncident} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Incident Title</Label>
                    <Input
                      id="title"
                      value={incidentForm.title}
                      onChange={(e) => setIncidentForm({ ...incidentForm, title: e.target.value })}
                      placeholder="e.g., Highway Accident, Building Collapse"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={incidentForm.location}
                      onChange={(e) => setIncidentForm({ ...incidentForm, location: e.target.value })}
                      placeholder="Incident location"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="casualties">Estimated Casualties</Label>
                    <Input
                      id="casualties"
                      type="number"
                      value={incidentForm.estimatedCasualties}
                      onChange={(e) => setIncidentForm({ ...incidentForm, estimatedCasualties: e.target.value })}
                      placeholder="Number of casualties"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tag">Incident Tag</Label>
                    <Input
                      id="tag"
                      value={incidentForm.tag}
                      onChange={(e) => setIncidentForm({ ...incidentForm, tag: e.target.value })}
                      placeholder="e.g., #JetCrash, #Accident"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bloodNeeds">Blood Requirements</Label>
                  <Input
                    id="bloodNeeds"
                    value={incidentForm.bloodNeeds}
                    onChange={(e) => setIncidentForm({ ...incidentForm, bloodNeeds: e.target.value })}
                    placeholder="e.g., All types, priority O- and AB+"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={incidentForm.description}
                    onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                    placeholder="Detailed description of the incident..."
                    rows={3}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowIncidentForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="destructive">
                    Create Emergency Alert
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Active Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">28</p>
                  <p className="text-sm text-muted-foreground">Donor Responses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-sm text-muted-foreground">Active Incidents</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="requests">Blood Requests</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="donors">Donor Responses</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Active Blood Requests</CardTitle>
                <CardDescription>Manage your hospital's blood requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                            {request.bloodGroup}
                          </div>
                          <div>
                            <p className="font-medium">{request.quantity}</p>
                            <p className="text-sm text-muted-foreground">{request.patient}</p>
                          </div>
                        </div>
                        <Badge variant={request.urgency === "Critical" ? "destructive" : "default"}>
                          {request.urgency}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                        <div>Ward: {request.ward}</div>
                        <div>Posted: {request.timePosted}</div>
                        <div>Responses: {request.responses}</div>
                        <div>Status: {request.status}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Responses
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit Request
                        </Button>
                        <Button size="sm">Mark Complete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
                  Emergency Incidents
                </CardTitle>
                <CardDescription>Mass casualty incidents requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incidentRequests.map((incident) => (
                    <div key={incident.id} className="border-l-4 border-l-destructive rounded-lg p-4 bg-destructive/5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{incident.title}</h3>
                          <Badge variant="destructive" className="mt-1">
                            {incident.tag}
                          </Badge>
                        </div>
                        <Badge variant="outline">{incident.status}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {incident.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          {incident.casualties} casualties
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {incident.timeCreated}
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground">
                          <strong>Blood Needed:</strong> {incident.bloodNeeded}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive">
                          Broadcast Alert
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          Update Status
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donors">
            <Card>
              <CardHeader>
                <CardTitle>Donor Responses</CardTitle>
                <CardDescription>Manage donor responses to your requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {donorResponses.map((donor) => (
                    <div key={donor.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                            {donor.bloodGroup}
                          </div>
                          <div>
                            <p className="font-medium">{donor.donorName}</p>
                            <p className="text-sm text-muted-foreground">{donor.distance}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {donor.isVerified ? (
                            <Badge variant="default">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Unverified
                            </Badge>
                          )}
                          <Badge variant={donor.status === "Confirmed" ? "default" : "secondary"}>{donor.status}</Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        ETA: {donor.eta} • Phone: {donor.phone}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline">
                          Reverify Location
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Blood Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"].map((type) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="font-medium">{type}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-muted rounded-full">
                            <div className="h-2 bg-primary rounded-full" style={{ width: `${Math.random() * 100}%` }} />
                          </div>
                          <span className="text-sm text-muted-foreground">{Math.floor(Math.random() * 50)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Average Response Time</span>
                      <span className="font-medium">18 minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fastest Response</span>
                      <span className="font-medium">5 minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Requests This Month</span>
                      <span className="font-medium">156</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
