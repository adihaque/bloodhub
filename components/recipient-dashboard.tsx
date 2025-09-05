"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
  location: string
  status: string
  notes: string
  incidentTag?: string
  createdAt: any
  responses: number
}

interface RecipientDashboardProps {
  user: UserData
}

export function RecipientDashboard({ user }: RecipientDashboardProps) {
  const router = useRouter()
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [myRequests, setMyRequests] = useState<BloodRequest[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(true)
  const [requestForm, setRequestForm] = useState({
    bloodGroup: "",
    quantity: "",
    urgency: "",
    location: "",
    notes: "",
    incidentTag: "",
  })

  // Fetch user's blood requests from Firestore
  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        const requestsRef = collection(db, "bloodRequests")
        const q = query(
          requestsRef,
          where("recipientId", "==", user.uid),
          orderBy("createdAt", "desc")
        )
        const querySnapshot = await getDocs(q)
        
        const requests: BloodRequest[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          requests.push({
            id: doc.id,
            bloodGroup: data.bloodGroup,
            quantity: data.quantity,
            urgency: data.urgency,
            location: data.location,
            status: data.status,
            notes: data.notes,
            incidentTag: data.incidentTag,
            createdAt: data.createdAt,
            responses: data.responses || 0
          })
        })
        
        setMyRequests(requests)
      } catch (error) {
        console.error("Error fetching blood requests:", error)
      } finally {
        setIsLoadingRequests(false)
      }
    }

    if (user?.uid) {
      fetchMyRequests()
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

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Add blood request to Firestore
      const requestData = {
        ...requestForm,
        recipientId: user.uid,
        recipientName: user.fullName,
        recipientPhone: user.whatsappNumber,
        status: "Active",
        responses: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await addDoc(collection(db, "bloodRequests"), requestData)
      
      // Reset form and close modal
      setRequestForm({
        bloodGroup: "",
        quantity: "",
        urgency: "",
        location: "",
        notes: "",
        incidentTag: "",
      })
      setShowRequestForm(false)
      
      // Refresh requests list
      window.location.reload()
      
    } catch (error) {
      console.error("Error submitting blood request:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Recipient Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user?.fullName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => setShowRequestForm(true)}>
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
        {/* Create Blood Request */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Create Blood Request
            </CardTitle>
            <CardDescription>Request blood from donors in your area</CardDescription>
          </CardHeader>
          <CardContent>
            {showRequestForm ? (
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bloodGroup">Blood Group Required</Label>
                    <Select value={requestForm.bloodGroup} onValueChange={(value) => setRequestForm(prev => ({ ...prev, bloodGroup: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity Required</Label>
                    <Select value={requestForm.quantity} onValueChange={(value) => setRequestForm(prev => ({ ...prev, quantity: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select quantity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 unit">1 unit</SelectItem>
                        <SelectItem value="2 units">2 units</SelectItem>
                        <SelectItem value="3 units">3 units</SelectItem>
                        <SelectItem value="4+ units">4+ units</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select value={requestForm.urgency} onValueChange={(value) => setRequestForm(prev => ({ ...prev, urgency: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Hospital or location"
                      value={requestForm.location}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, location: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information about your request..."
                    value={requestForm.notes}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="incidentTag">Incident Tag (Optional)</Label>
                  <Input
                    id="incidentTag"
                    placeholder="e.g., #JetCrash, #Accident"
                    value={requestForm.incidentTag}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, incidentTag: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Submit Request</Button>
                  <Button type="button" variant="outline" onClick={() => setShowRequestForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button onClick={() => setShowRequestForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Request
              </Button>
            )}
          </CardContent>
        </Card>

        {/* My Blood Requests */}
        <Card>
          <CardHeader>
            <CardTitle>My Blood Requests</CardTitle>
            <CardDescription>Track your blood donation requests</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRequests ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your requests...</p>
              </div>
            ) : myRequests.length > 0 ? (
              <div className="space-y-4">
                {myRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {request.bloodGroup}
                        </div>
                        <span className="font-medium">{request.quantity}</span>
                      </div>
                      <Badge variant={request.urgency === "Critical" ? "destructive" : request.urgency === "Urgent" ? "secondary" : "default"}>
                        {request.urgency}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {request.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {request.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                      </div>
                      {request.incidentTag && (
                        <div className="flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {request.incidentTag}
                        </div>
                      )}
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
                <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No blood requests yet</p>
                <p className="text-sm">Create your first blood request above</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
