"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Users,
} from "lucide-react"
import { useApp } from "@/components/providers"

export function RecipientDashboard() {
  const { user } = useApp()
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestForm, setRequestForm] = useState({
    bloodGroup: "",
    quantity: "",
    urgency: "",
    location: "",
    notes: "",
    incidentTag: "",
  })

  const myRequests = [
    {
      id: 1,
      bloodGroup: "A+",
      quantity: "2 units",
      urgency: "Critical",
      location: "Dhaka Medical College",
      status: "Active",
      responses: 3,
      timePosted: "2 hours ago",
      incidentTag: "#JetCrash",
    },
    {
      id: 2,
      bloodGroup: "O-",
      quantity: "1 unit",
      urgency: "Urgent",
      location: "Square Hospital",
      status: "Fulfilled",
      responses: 1,
      timePosted: "1 day ago",
      incidentTag: null,
    },
  ]

  const availableDonors = [
    {
      id: 1,
      name: "John Doe",
      bloodGroup: "A+",
      distance: "1.2 km",
      lastDonation: "3 months ago",
      isVerified: true,
      phone: "+880 1234-567890",
    },
    {
      id: 2,
      name: "Jane Smith",
      bloodGroup: "A+",
      distance: "2.1 km",
      lastDonation: "4 months ago",
      isVerified: false,
      phone: "+880 1234-567891",
    },
  ]

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting request:", requestForm)
    setShowRequestForm(false)
    // Reset form
    setRequestForm({
      bloodGroup: "",
      quantity: "",
      urgency: "",
      location: "",
      notes: "",
      incidentTag: "",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Recipient Dashboard</h1>
              <p className="text-muted-foreground">Manage your blood requests</p>
            </div>
            <Button onClick={() => setShowRequestForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Request Form */}
        {showRequestForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Post Blood Request</CardTitle>
              <CardDescription>Fill out the details for your blood request</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Select
                      value={requestForm.bloodGroup}
                      onValueChange={(value) => setRequestForm({ ...requestForm, bloodGroup: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Select
                      value={requestForm.quantity}
                      onValueChange={(value) => setRequestForm({ ...requestForm, quantity: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select quantity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Unit</SelectItem>
                        <SelectItem value="2">2 Units</SelectItem>
                        <SelectItem value="3">3 Units</SelectItem>
                        <SelectItem value="4">4 Units</SelectItem>
                        <SelectItem value="5+">5+ Units</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="urgency">Urgency</Label>
                    <Select
                      value={requestForm.urgency}
                      onValueChange={(value) => setRequestForm({ ...requestForm, urgency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Critical">Critical</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Hospital/Location</Label>
                  <Input
                    id="location"
                    value={requestForm.location}
                    onChange={(e) => setRequestForm({ ...requestForm, location: e.target.value })}
                    placeholder="Enter hospital name or address"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="incidentTag">Incident Tag (Optional)</Label>
                  <Input
                    id="incidentTag"
                    value={requestForm.incidentTag}
                    onChange={(e) => setRequestForm({ ...requestForm, incidentTag: e.target.value })}
                    placeholder="e.g., #JetCrash, #Accident"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={requestForm.notes}
                    onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                    placeholder="Any additional information..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowRequestForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Post Request</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Requests */}
          <Card>
            <CardHeader>
              <CardTitle>My Requests</CardTitle>
              <CardDescription>Track your blood requests and responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {request.bloodGroup}
                        </div>
                        <span className="font-medium">{request.quantity}</span>
                        {request.incidentTag && (
                          <Badge variant="outline" className="text-xs">
                            {request.incidentTag}
                          </Badge>
                        )}
                      </div>
                      <Badge variant={request.status === "Active" ? "default" : "secondary"}>{request.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {request.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {request.timePosted}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {request.responses} responses
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        View Details
                      </Button>
                      {request.status === "Active" && (
                        <Button size="sm" className="flex-1">
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Donors */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Search className="mr-2 h-5 w-5" />
                    Available Donors
                  </CardTitle>
                  <CardDescription>Donors in your area</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableDonors.map((donor) => (
                  <div key={donor.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {donor.bloodGroup}
                        </div>
                        <div>
                          <p className="font-medium">{donor.name}</p>
                          <p className="text-sm text-muted-foreground">{donor.distance}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {donor.isVerified ? (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Unverified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">Last donation: {donor.lastDonation}</div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
