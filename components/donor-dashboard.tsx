"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { QuickRequestModal } from "@/components/quick-request-modal"
import {
  Droplets,
  Calendar as CalendarIcon,
  MapPin,
  Bell,
  Clock,
  Heart,
  User,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  LogOut,
  Settings,
  Edit,
} from "lucide-react"
import { auth, db } from "@/app/firebase/config"
import { signOut } from "firebase/auth"
import { doc, updateDoc, collection, query, where, orderBy, getDocs, serverTimestamp, Timestamp } from "firebase/firestore"
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

interface DonationRecord {
  id: string
  date: string
  location: string
  status: string
  bloodGroup: string
  quantity: string
}

interface DonorDashboardProps {
  user: UserData
}

export function DonorDashboard({ user }: DonorDashboardProps) {
  const router = useRouter()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [donationHistory, setDonationHistory] = useState<DonationRecord[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [isUpdatingDonation, setIsUpdatingDonation] = useState(false)
  const [isLastDonationDialogOpen, setIsLastDonationDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [daysAgo, setDaysAgo] = useState<string>("")
  const [neverDonated, setNeverDonated] = useState<boolean>(false)
  const [lastDonationLocal, setLastDonationLocal] = useState<Date | null>(null)
  const [showQuickRequest, setShowQuickRequest] = useState(false)
  const [nearbyRequests, setNearbyRequests] = useState<any[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(true)

  // Helper to parse lastDonation from user (supports Firestore Timestamp or ISO string)
  const parseUserLastDonation = (): Date | null => {
    const raw = (user as any)?.lastDonation
    if (!raw) return null
    if (typeof raw === "string") {
      const d = new Date(raw)
      return isNaN(d.getTime()) ? null : d
    }
    if (raw && typeof raw.toDate === "function") {
      try {
        const d = raw.toDate()
        return d instanceof Date && !isNaN(d.getTime()) ? d : null
      } catch {
        return null
      }
    }
    return null
  }

  useEffect(() => {
    setLastDonationLocal(parseUserLastDonation())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Calculate days since last donation and eligibility from local state
  const lastDonationDate = lastDonationLocal
  const today = new Date()
  const daysSinceLastDonation = lastDonationDate 
    ? Math.floor((today.getTime() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24))
    : null
  
  // Eligibility calculation: 56 days required between donations
  const daysUntilEligible = lastDonationDate && daysSinceLastDonation !== null
    ? Math.max(0, 56 - daysSinceLastDonation)
    : 0 // If never donated, eligible now
  
  const isEligible = daysUntilEligible === 0
  const eligibilityProgress = lastDonationDate && daysSinceLastDonation !== null
    ? Math.min(100, (daysSinceLastDonation / 56) * 100)
    : 100 // If never donated, 100% eligible

  // Initialize dialog fields when opened
  useEffect(() => {
    if (isLastDonationDialogOpen) {
      const current = lastDonationLocal
      if (current) {
        setNeverDonated(false)
        setSelectedDate(current)
        const diff = Math.max(0, Math.floor((today.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)))
        setDaysAgo(String(diff))
      } else {
        setNeverDonated(true)
        setSelectedDate(null)
        setDaysAgo("")
      }
    }
  }, [isLastDonationDialogOpen, lastDonationLocal])

  // Fetch donation history from Firestore
  useEffect(() => {
    const fetchDonationHistory = async () => {
      try {
        const donationsRef = collection(db, "donations")
        const q = query(
          donationsRef,
          where("donorId", "==", user.uid),
          orderBy("date", "desc")
        )
        const querySnapshot = await getDocs(q)
        
        const history: DonationRecord[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          history.push({
            id: doc.id,
            date: data.date,
            location: data.location,
            status: data.status,
            bloodGroup: data.bloodGroup,
            quantity: data.quantity
          })
        })
        
        setDonationHistory(history)
      } catch (error: any) {
        // Detect missing index error and surface helpful UI instead of failing silently
        const msg: string = error?.message || ""
        const matches = msg.match(/https:\/\/console\.firebase\.google\.com\/[^"]+/)
        const indexUrl = matches?.[0]
        console.error("Error fetching donation history:", error)
        setDonationHistory([])
        ;(window as any).__donationIndexUrl = indexUrl || null
      } finally {
        setIsLoadingHistory(false)
      }
    }

    if (user?.uid) {
      fetchDonationHistory()
    }
  }, [user?.uid])

  // Fetch nearby blood requests from Firestore
  useEffect(() => {
    const fetchNearbyRequests = async () => {
      try {
        const requestsRef = collection(db, "requests")
        const q = query(
          requestsRef,
          where("status", "==", "active"),
          orderBy("createdAt", "desc")
        )
        const querySnapshot = await getDocs(q)
        
        const requests: any[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          requests.push({
            id: doc.id,
            ...data
          })
        })
        
        setNearbyRequests(requests)
      } catch (error) {
        console.error("Error fetching nearby requests:", error)
        setNearbyRequests([])
      } finally {
        setIsLoadingRequests(false)
      }
    }

    fetchNearbyRequests()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/auth/login')
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }
 
  const handleSaveLastDonation = async () => {
    setIsUpdatingDonation(true)
    try {
      // Determine the new date
      let newDate: Date | null = null
      if (neverDonated) {
        newDate = null
      } else if (selectedDate) {
        // Prevent future dates
        newDate = selectedDate > today ? today : selectedDate
      } else if (daysAgo !== "") {
        const n = Number(daysAgo)
        if (!Number.isNaN(n) && n >= 0) {
          newDate = new Date(today.getTime() - (n * 24 * 60 * 60 * 1000))
        }
      }

      const userRef = doc(db, "users", user.uid)
      if (newDate) {
        await updateDoc(userRef, {
          lastDonation: Timestamp.fromDate(newDate),
          updatedAt: serverTimestamp(),
        })
        setLastDonationLocal(newDate)
      } else {
        await updateDoc(userRef, {
          lastDonation: null,
          updatedAt: serverTimestamp(),
        })
        setLastDonationLocal(null)
      }

      setIsLastDonationDialogOpen(false)
    } catch (error) {
      console.error("Error updating last donation:", error)
    } finally {
      setIsUpdatingDonation(false)
    }
  }

  const getLastDonationText = () => {
    if (!lastDonationLocal) {
      return "Never donated"
    }
    
    if (daysSinceLastDonation === 0) {
      return "Today"
    } else if (daysSinceLastDonation === 1) {
      return "Yesterday"
    } else {
      return `${daysSinceLastDonation} days ago`
    }
  }

  const getEligibilityText = () => {
    if (!lastDonationLocal) {
      return "Eligible now!"
    }
    
    if (isEligible) {
      return "Eligible now!"
    } else {
      return `${daysUntilEligible} days remaining`
    }
  }

  const handleMarkAsCompleted = async (requestId: string) => {
    try {
      const requestRef = doc(db, "requests", requestId)
      await updateDoc(requestRef, {
        status: "completed",
        completedAt: serverTimestamp()
      })
      
      // Remove from local state
      setNearbyRequests(prev => prev.filter(req => req.id !== requestId))
      
      // Show success message
      alert("Request marked as completed successfully!")
    } catch (error) {
      console.error("Error marking request as completed:", error)
      alert("Failed to mark request as completed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Donor Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user?.fullName}</p>
            </div>
            
            {/* Prominent Request Blood Button - Centered */}
            <div className="flex-1 flex justify-center">
              <Button 
                size="lg" 
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                onClick={() => setShowQuickRequest(true)}
              >
                <AlertTriangle className="h-5 w-5 mr-2" />
                Request Blood
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="default" className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>
              
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
        {/* Top Bar with Blood Group, Last Donation, and Eligibility */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left Side - Blood Group and Last Donation */}
          <div className="grid grid-cols-2 gap-4">
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
                  <CalendarIcon className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Donation</p>
                    <Dialog open={isLastDonationDialogOpen} onOpenChange={setIsLastDonationDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="h-auto p-0 text-left font-semibold hover:bg-transparent">
                          {getLastDonationText()}
                          <Edit className="ml-2 h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Last Donation</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-sm font-medium">Never donated</p>
                              <p className="text-xs text-muted-foreground">If selected, you are eligible now</p>
                            </div>
                            <Switch checked={neverDonated} onCheckedChange={(v) => { setNeverDonated(v); if (v) { setSelectedDate(null); setDaysAgo("") } }} />
                          </div>

                          <div className={`grid gap-4 ${neverDonated ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Pick an exact date</p>
                              <Calendar
                                mode="single"
                                selected={selectedDate ?? undefined}
                                onSelect={(d) => setSelectedDate(d ?? null)}
                                disabled={(date) => date > today}
                              />
                            </div>

                            <div className="space-y-2">
                              <p className="text-sm font-medium">Or enter days ago</p>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min={0}
                                  placeholder="e.g., 56"
                                  value={daysAgo}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    setDaysAgo(val)
                                    const n = Number(val)
                                    if (!Number.isNaN(n) && n >= 0) {
                                      const d = new Date(today.getTime() - (n * 24 * 60 * 60 * 1000))
                                      setSelectedDate(d)
                                    }
                                  }}
                                  className="w-32"
                                />
                                <span className="text-sm text-muted-foreground">days ago</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setIsLastDonationDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveLastDonation} disabled={isUpdatingDonation}>
                              {isUpdatingDonation ? 'Saving...' : 'Save'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Donation Eligibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Donation Eligibility
              </CardTitle>
              <CardDescription>You can donate blood every 56 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={eligibilityProgress} className="w-full" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {lastDonationLocal ? `Last donation: ${lastDonationDate?.toLocaleDateString()}` : "No previous donations"}
                  </span>
                  <span className={isEligible ? "text-green-600 font-medium" : ""}>
                    {getEligibilityText()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Nearby Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Nearby Requests ({nearbyRequests.length})
              </CardTitle>
              <CardDescription>Active blood requests</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRequests ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading requests...</p>
                </div>
              ) : nearbyRequests.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {nearbyRequests.slice(0, 5).map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                            {request.bloodGroup}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{request.patientName || 'Emergency Case'}</p>
                            <p className="text-xs text-muted-foreground">{request.quantity || 1} units needed</p>
                          </div>
                        </div>
                        <Badge variant={request.urgency === 'Critical' ? 'destructive' : 'secondary'} className="text-xs">
                          {request.urgency}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate max-w-32">{request.location || 'Location not specified'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {request.contactPhone && (
                            <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => window.open(`tel:${request.contactPhone}`, '_self')}>
                              Call
                            </Button>
                          )}
                          {/* Mark as Completed button - only show for request creator */}
                          {request.uid === user.uid && (
                            <Button 
                              size="sm" 
                              variant="default" 
                              className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700"
                              onClick={() => handleMarkAsCompleted(request.id)}
                            >
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {nearbyRequests.length > 5 && (
                    <div className="text-center pt-2">
                      <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                        View All Requests
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active blood requests at the moment</p>
                  <p className="text-sm">New requests will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Donation History */}
          <Card>
            <CardHeader>
              <CardTitle>Donation History</CardTitle>
              <CardDescription>Your past blood donations</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading donation history...</p>
                </div>
              ) : donationHistory.length > 0 ? (
                <div className="space-y-4">
                  {donationHistory.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Droplets className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{donation.location}</p>
                          <p className="text-sm text-muted-foreground">{donation.date}</p>
                          <p className="text-xs text-muted-foreground">
                            {donation.bloodGroup} • {donation.quantity}
                          </p>
                        </div>
                      </div>
                      <Badge variant="default">{donation.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No donation history yet</p>
                  <p className="text-sm">Your donations will appear here</p>
                  {(window as any).__donationIndexUrl && (
                    <p className="text-xs mt-2">
                      Admin: this query requires an index. Create it here: <a className="underline" target="_blank" rel="noreferrer noopener" href={(window as any).__donationIndexUrl as string}>Open Firestore Index</a>
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Request Modal */}
      <QuickRequestModal open={showQuickRequest} onOpenChange={setShowQuickRequest} />
    </div>
  )
}
