"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
  LogOut,
  Settings,
  Edit,
  User,
} from "lucide-react"
import { auth, db } from "@/app/firebase/config"
import { signOut } from "firebase/auth"
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { useRouter } from "next/navigation"

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

interface BloodRequest {
  id: string
  bloodGroup: string
  quantity: string
  urgency: string
  patient: string
  ward: string
  status: string
  responses: number
  createdAt: any
}

interface IncidentRequest {
  id: string
  title: string
  tag: string
  location: string
  casualties: number
  bloodNeeded: string
  status: string
  createdAt: any
}

interface DonorResponse {
  id: string
  donorName: string
  bloodGroup: string
  phone: string
  distance: string
  isVerified: boolean
  status: string
  eta: string
}

interface HospitalDashboardProps {
  user: UserData
}

export function HospitalDashboard({ user }: HospitalDashboardProps) {
  const router = useRouter()
  const [showIncidentForm, setShowIncidentForm] = useState(false)
  const [activeRequests, setActiveRequests] = useState<BloodRequest[]>([])
  const [incidentRequests, setIncidentRequests] = useState<IncidentRequest[]>([])
  const [donorResponses, setDonorResponses] = useState<DonorResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [incidentForm, setIncidentForm] = useState({
    title: "",
    location: "",
    description: "",
    estimatedCasualties: "",
    bloodNeeds: "",
    tag: "",
  })

  // Fetch hospital data from Firestore
  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        // Fetch active blood requests
        const requestsRef = collection(db, "bloodRequests")
        const requestsQuery = query(
          requestsRef,
          where("status", "in", ["Active", "Pending"]),
          orderBy("createdAt", "desc")
        )
        const requestsSnapshot = await getDocs(requestsQuery)
        
        const requests: BloodRequest[] = []
        requestsSnapshot.forEach((doc) => {
          const data = doc.data()
          requests.push({
            id: doc.id,
            bloodGroup: data.bloodGroup,
            quantity: data.quantity,
            urgency: data.urgency,
            patient: data.patient || "Unknown",
            ward: data.ward || "General",
            status: data.status,
            responses: data.responses || 0,
            createdAt: data.createdAt
          })
        })
        setActiveRequests(requests)

        // Fetch incident requests
        const incidentsRef = collection(db, "incidents")
        const incidentsQuery = query(
          incidentsRef,
          where("status", "==", "Active"),
          orderBy("createdAt", "desc")
        )
        const incidentsSnapshot = await getDocs(incidentsQuery)
        
        const incidents: IncidentRequest[] = []
        incidentsSnapshot.forEach((doc) => {
          const data = doc.data()
          incidents.push({
            id: doc.id,
            title: data.title,
            tag: data.tag,
            location: data.location,
            casualties: data.casualties || 0,
            bloodNeeded: data.bloodNeeded,
            status: data.status,
            createdAt: data.createdAt
          })
        })
        setIncidentRequests(incidents)

        // For now, donor responses are empty - will be populated when donors respond
        setDonorResponses([])
        
      } catch (error) {
        console.error("Error fetching hospital data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.uid) {
      fetchHospitalData()
    }
  }, [user?.uid])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/auth/login')
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleSubmitIncident = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Add incident to Firestore
      const incidentData = {
        ...incidentForm,
        hospitalId: user.uid,
        hospitalName: user.fullName,
        status: "Active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await addDoc(collection(db, "incidents"), incidentData)
      
      // Reset form and close modal
      setIncidentForm({
        title: "",
        location: "",
        description: "",
        estimatedCasualties: "",
        bloodNeeds: "",
        tag: "",
      })
      setShowIncidentForm(false)
      
      // Refresh incidents list
      window.location.reload()
      
    } catch (error) {
      console.error("Error submitting incident:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Hospital Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user?.fullName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => router.push('/blood-request')}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Request Blood
              </Button>
              <Badge variant="default" className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
              
              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push('/profile/edit')}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile/appearance')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Appearance
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Create Incident */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Create Emergency Incident
            </CardTitle>
            <CardDescription>Declare emergency incidents and coordinate blood donations</CardDescription>
          </CardHeader>
          <CardContent>
            {showIncidentForm ? (
              <form onSubmit={handleSubmitIncident} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Incident Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Jet Crash, Building Collapse"
                      value={incidentForm.title}
                      onChange={(e) => setIncidentForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tag">Incident Tag</Label>
                    <Input
                      id="tag"
                      placeholder="e.g., #JetCrash, #BuildingCollapse"
                      value={incidentForm.tag}
                      onChange={(e) => setIncidentForm(prev => ({ ...prev, tag: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Diabari, Uttara"
                      value={incidentForm.location}
                      onChange={(e) => setIncidentForm(prev => ({ ...prev, location: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedCasualties">Estimated Casualties</Label>
                    <Input
                      id="estimatedCasualties"
                      type="number"
                      placeholder="Number of casualties"
                      value={incidentForm.estimatedCasualties}
                      onChange={(e) => setIncidentForm(prev => ({ ...prev, estimatedCasualties: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bloodNeeds">Blood Requirements</Label>
                  <Input
                    id="bloodNeeds"
                    placeholder="e.g., All types, priority O-"
                    value={incidentForm.bloodNeeds}
                    onChange={(e) => setIncidentForm(prev => ({ ...prev, bloodNeeds: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of the incident..."
                    value={incidentForm.description}
                    onChange={(e) => setIncidentForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Declare Emergency</Button>
                  <Button type="button" variant="outline" onClick={() => setShowIncidentForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button onClick={() => setShowIncidentForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Emergency Incident
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests">Active Requests</TabsTrigger>
            <TabsTrigger value="incidents">Emergency Incidents</TabsTrigger>
            <TabsTrigger value="responses">Donor Responses</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Active Blood Requests
                </CardTitle>
                <CardDescription>Current blood requests in your hospital</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading requests...</p>
                  </div>
                ) : activeRequests.length > 0 ? (
                  <div className="space-y-4">
                    {activeRequests.map((request) => (
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
                          <div>Patient: {request.patient}</div>
                          <div>Ward: {request.ward}</div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {request.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {request.responses} donor{request.responses !== 1 ? 's' : ''} responded
                            </span>
                          </div>
                          <Badge variant={request.status === "Active" ? "default" : "secondary"}>
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active blood requests</p>
                    <p className="text-sm">Blood requests will appear here when created</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Emergency Incidents
                </CardTitle>
                <CardDescription>Active emergency incidents and their blood requirements</CardDescription>
              </CardHeader>
              <CardContent>
                {incidentRequests.length > 0 ? (
                  <div className="space-y-4">
                    {incidentRequests.map((incident) => (
                      <div key={incident.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="destructive">{incident.tag}</Badge>
                            <span className="font-medium">{incident.title}</span>
                          </div>
                          <Badge variant="default">{incident.status}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {incident.location}
                          </div>
                          <div>Casualties: {incident.casualties}</div>
                          <div>Blood Needed: {incident.bloodNeeded}</div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {incident.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active emergency incidents</p>
                    <p className="text-sm">Emergency incidents will appear here when declared</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="responses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Donor Responses
                </CardTitle>
                <CardDescription>Donors responding to your blood requests</CardDescription>
              </CardHeader>
              <CardContent>
                {donorResponses.length > 0 ? (
                  <div className="space-y-4">
                    {donorResponses.map((response) => (
                      <div key={response.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                              {response.bloodGroup}
                            </div>
                            <span className="font-medium">{response.donorName}</span>
                          </div>
                          <Badge variant={response.status === "Confirmed" ? "default" : "secondary"}>
                            {response.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {response.phone}
                          </div>
                          <div>Distance: {response.distance}</div>
                          <div>ETA: {response.eta}</div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" className="flex-1">
                            <Phone className="h-3 w-3 mr-1" />
                            Call
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Message
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No donor responses yet</p>
                    <p className="text-sm">Donor responses will appear here when donors respond to your requests</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
