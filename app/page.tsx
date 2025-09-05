"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Droplets, AlertTriangle, Users, Phone, Mail, Navigation, HelpCircle, Info } from "lucide-react"
import { useApp } from "@/components/providers"
import { QuickRegisterModal } from "@/components/quick-register-modal"
import { QuickRequestModal } from "@/components/quick-request-modal"
import Link from "next/link"
import { BloodGroupDetailsModal } from "@/components/bloo-group-details-modal"
import { Dialog } from "@/components/ui/dialog"
import LocationFilter from "@/components/LocationFilter"
import { db } from "@/app/firebase/config"
import { collection, query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp, getDocs } from "firebase/firestore"

export default function HomePage() {
  const { currentIncident, user, setCurrentIncident } = useApp()
  const [showQuickRegister, setShowQuickRegister] = useState(false)
  const [showQuickRequest, setShowQuickRequest] = useState(false)
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<any>(null)
  const [showBloodCompatibility, setShowBloodCompatibility] = useState(false)
  const [isDonorsCollapsed, setIsDonorsCollapsed] = useState(false)
  const [isRequestsCollapsed, setIsRequestsCollapsed] = useState(false)
  const [showLiveAlert, setShowLiveAlert] = useState(true)
  const [isBannerMerged, setIsBannerMerged] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [selectedDonorGroup, setSelectedDonorGroup] = useState<string | null>(null)
  const [activeDonor, setActiveDonor] = useState<any>(null)
  const [nearbyRequests, setNearbyRequests] = useState<any[]>([])
  const [donors, setDonors] = useState<any[]>([])
  const [locationFilters, setLocationFilters] = useState({
    division: '',
    district: '',
    subDistrict: ''
  })
  const [stats, setStats] = useState({
    activeDonors: 0,
    livesSaved: 0,
    activeRequests: 0
  })

  // Location detection on page load
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({
            lat: latitude,
            lng: longitude,
          })
          
          // Store location in localStorage for later use
          localStorage.setItem('userLocation', JSON.stringify({
            lat: latitude,
            lng: longitude,
            timestamp: Date.now()
          }))
          
          // Load nearby requests based on location (subscription already active)
          loadNearbyRequests(latitude, longitude)
        },
        (error) => {
          setLocationError("Location access denied or unavailable.")
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    } else {
      setLocationError("Geolocation is not supported by this browser.")
    }
  }, [])

  // Live subscriptions: stats, donors, requests
  useEffect(() => {
    // Restore banner
    const merged = typeof window !== 'undefined' ? localStorage.getItem('bannerMerged') : null
    if (merged === '1') setIsBannerMerged(true)

    const unsubRequests = onSnapshot(
      query(collection(db, 'requests'), orderBy('createdAt', 'desc'), limit(12)),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setNearbyRequests(items as any[])
        setStats((s) => ({ ...s, activeRequests: items.filter((r: any) => r.status === 'active').length }))
      },
      (error) => {
        console.error('Error listening to requests:', error)
        // Don't break the app, just log the error
      }
    )

    const unsubDonors = onSnapshot(
      query(collection(db, 'users'), where('type', '==', 'quick')),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setDonors(items as any[])
        // Count includes quick users plus eligible logged-in users
        const eligibleLoggedInUser = user && user.role === 'donor' && isUserEligibleToDonate(user) ? 1 : 0;
        setStats((s) => ({ ...s, activeDonors: items.length + eligibleLoggedInUser }))
      },
      (error) => {
        console.error('Error listening to donors:', error)
        // Don't break the app, just log the error
      }
    )

    const unsubLives = onSnapshot(
      query(collection(db, 'requests'), where('status', '==', 'fulfilled')),
      (snap) => setStats((s) => ({ ...s, livesSaved: snap.size })),
      (error) => {
        console.error('Error listening to fulfilled requests:', error)
        // Don't break the app, just log the error
      }
    )

    return () => {
      unsubRequests()
      unsubDonors()
      unsubLives()
    }
  }, [])

  const loadNearbyRequests = async (lat: number, lng: number) => {
    try {
      // Query Firestore for nearby requests based on user's location
      const requestsRef = collection(db, 'requests')
      let q;
      
      // If user has location filters, filter by district
      if (locationFilters.district) {
        q = query(
          requestsRef,
          where('status', '==', 'active'),
          where('district', '==', locationFilters.district),
          orderBy('createdAt', 'desc'),
          limit(20)
        )
      } else {
        // Default query without district filter
        q = query(
          requestsRef,
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc'),
          limit(20)
        )
      }
      
      const querySnapshot = await getDocs(q)
      const requests = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }))
      
      setNearbyRequests(requests)
    } catch (error) {
      console.error("Error loading nearby requests:", error)
      // Fallback to empty array if query fails
      setNearbyRequests([])
    }
  }

  const loadStatistics = async () => {}

  // Check if a user is eligible to donate (56 days since last donation)
  const isUserEligibleToDonate = (user: any) => {
    if (!user || user.role !== 'donor') return false;
    
    const lastDonation = user.lastDonation;
    if (!lastDonation) return true; // Never donated, eligible
    
    let lastDonationDate: Date;
    if (typeof lastDonation === 'string') {
      lastDonationDate = new Date(lastDonation);
    } else if (lastDonation && typeof lastDonation.toDate === 'function') {
      lastDonationDate = lastDonation.toDate();
    } else {
      return true; // Invalid date, assume eligible
    }
    
    if (isNaN(lastDonationDate.getTime())) return true;
    
    const daysSinceLastDonation = Math.floor((Date.now() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceLastDonation >= 56;
  };

  const handleLocationFilterChange = (filters: any) => {
    setLocationFilters(filters);
    // Reload nearby requests when location filters change
    if (userLocation) {
      loadNearbyRequests(userLocation.lat, userLocation.lng);
    }
  };

  const mergeBanner = () => {
    setIsBannerMerged(true)
    if (typeof window !== 'undefined') localStorage.setItem('bannerMerged', '1')
  }

  const unmergeBanner = () => {
    setIsBannerMerged(false)
    if (typeof window !== 'undefined') localStorage.setItem('bannerMerged', '0')
  }

  const inspirationalQuote = "Every drop of kindness can become a lifeline for someone."

  return (
    <div className="min-h-screen bg-background">
      {/* Emergency/Inspirational Header */}
      {currentIncident ? (
        isBannerMerged ? (
          <div className="w-full px-4 emergency-gradient">
            <div className="max-w-6xl mx-auto flex items-center justify-between text-white">
              <div className="flex items-center gap-2 py-1">
                <Droplets className="h-4 w-4 opacity-90" />
                <span className="text-xs sm:text-sm italic opacity-95 truncate">
                  {inspirationalQuote}
                </span>
              </div>
              <button
                aria-label="Expand incident banner"
                onClick={unmergeBanner}
                className="text-white/90 hover:text-white text-lg leading-none px-2 py-1"
                title="Show incident details"
              >
                ▾
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full py-4 px-4 emergency-gradient">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <Link href="/incidents" className="flex items-center space-x-3 flex-1 cursor-pointer transition-opacity hover:opacity-90">
                <AlertTriangle className="h-6 w-6 text-white animate-pulse" />
                <div>
                  <p className="text-white font-semibold text-lg">{currentIncident}</p>
                  <p className="text-red-100 text-sm">Urgent blood donations needed</p>
                </div>
              </Link>
              <div className="flex items-center space-x-3">
                <Badge variant="destructive" className="animate-pulse">EMERGENCY</Badge>
                <Button variant="outline" size="sm" onClick={mergeBanner} className="text-white border-white hover:bg-white hover:text-red-600">Merge</Button>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="w-full py-4 px-4 bg-muted">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Droplets className="h-6 w-6 text-primary" />
              <p className="text-foreground font-medium">{inspirationalQuote}</p>
            </div>
            <Badge variant="secondary" className="animate-pulse">
              DONATE TODAY
            </Badge>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Main Action Buttons */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">BloodHub</h1>
          <p className="text-xl text-muted-foreground mb-8">Connecting donors with recipients in critical moments</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              variant="outline"
              className="border-red-500 text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg bg-transparent hover:shadow-lg transition-shadow duration-200"
              onClick={() => setShowQuickRegister(true)}
            >
              <Droplets className="mr-2 h-5 w-5" />
              Quick Register as Donor
            </Button>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              onClick={() => setShowQuickRequest(true)}
            >
              <AlertTriangle className="mr-2 h-5 w-5" />
              Quick Blood Request
            </Button>
          </div>
          
          {/* Blood Compatibility Button */}
          <div className="mt-6">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground border-2 border-muted hover:border-primary"
              onClick={() => setShowBloodCompatibility(true)}
            >
              <Info className="mr-2 h-4 w-4" />
              Blood Compatibility Chart
            </Button>
          </div>
        </div>

        {/* Auth Options */}
        {/*{!user && (
          <div className="flex justify-center gap-4 mb-12">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground border-2 border-red-300">
                Login to Account
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground border-2 border-red-300">
                Create Account
              </Button>
            </Link>
          </div>
        )}*/}

        {/* Urgent Blood Requests */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground flex items-center">
              <MapPin className="mr-2 h-6 w-6 text-primary" />
              Blood Donors near you 
            </h2>
          </div>

          {/* Live Alerts Banner (only if logged in) */}
          {user && showLiveAlert && (
            <div className="mb-4 flex items-center gap-2 bg-yellow-100 border border-yellow-300 text-yellow-900 px-4 py-2 rounded shadow animate-fade-in cursor-pointer" onClick={() => setShowLiveAlert(false)}>
              <span className="text-xl mr-2">🔔</span>
              <span>Someone 2.1km away needs <span className="font-bold text-red-700">B+</span> blood now</span>
              <button className="ml-auto text-yellow-700 hover:text-yellow-900 font-bold" aria-label="Dismiss" onClick={e => {e.stopPropagation(); setShowLiveAlert(false)}}>×</button>
            </div>
          )}

          {/* Available Donors Section */}
          <div className="mb-8">
            <Card className="overflow-hidden">
              <CardHeader className="pb-2 cursor-pointer" onClick={() => setIsDonorsCollapsed(!isDonorsCollapsed)}>
                <CardTitle className="text-base font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Available Donors
                  </div>
                  <button className="text-muted-foreground hover:text-foreground">
                    {isDonorsCollapsed ? '▶' : '▼'}
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Location Filter */}
                <div className="mb-6">
                  <LocationFilter 
                    title="Filter by Location" 
                    onFilterChange={handleLocationFilterChange}
                    initialFilters={null}
                    className="donors-location-filter"
                  />
                </div>
                
                {/* Blood Group Selector */}
                <div className="flex items-center py-2 px-1 scrollbar-hide">
                  <div className="flex gap-2 overflow-x-auto">
                    {["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"].map((group) => (
                      <button
                        key={group}
                        onClick={() => setSelectedDonorGroup(group)}
                        className={`px-5 py-2 rounded-full border-2 font-bold text-lg transition-all duration-150 shadow-sm
                          ${selectedDonorGroup === group
                            ? "bg-primary text-primary-foreground border-primary scale-110 shadow-lg"
                            : "bg-background text-primary border-primary/40 hover:bg-primary/10 hover:scale-105"}
                        `}
                        style={{ minWidth: 64 }}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Donor List (from Firestore quick users + eligible logged-in users) */}
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {donors
                    .filter(donor => !selectedDonorGroup || donor.bloodGroup === selectedDonorGroup)
                    .filter(donor => !user || donor.id !== user.id) // Filter out current user from quick users
                    .filter(donor => {
                      // Apply location filters
                      if (!locationFilters.division && !locationFilters.district && !locationFilters.subDistrict) {
                        return true; // No location filter applied
                      }
                      
                      const donorLocation = donor.location || '';
                      const locationParts = donorLocation.split(', ');
                      const donorSubDistrict = locationParts[0] || '';
                      const donorDistrict = locationParts[1] || '';
                      const donorDivision = locationParts[2] || '';
                      
                      // Check division filter
                      if (locationFilters.division && !donorDivision.toLowerCase().includes(locationFilters.division.toLowerCase())) {
                        return false;
                      }
                      
                      // Check district filter
                      if (locationFilters.district && !donorDistrict.toLowerCase().includes(locationFilters.district.toLowerCase())) {
                        return false;
                      }
                      
                      // Check sub-district filter
                      if (locationFilters.subDistrict && !donorSubDistrict.toLowerCase().includes(locationFilters.subDistrict.toLowerCase())) {
                        return false;
                      }
                      
                      return true;
                    })
                    .concat(
                      // Add logged-in user if they are eligible to donate
                      user && user.role === 'donor' && isUserEligibleToDonate(user) 
                        ? [{
                            id: user.id,
                            name: user.name,
                            bloodGroup: user.bloodGroup,
                            phone: user.phone,
                            location: user.location?.address || 'Location not set',
                            isVerified: true,
                            type: 'registered'
                          }]
                        : []
                    )
                    .map((donor, idx) => (
                      <button key={idx} className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50 shadow hover:shadow-md transition-shadow text-left w-full" onClick={() => setActiveDonor(donor)}>
                        <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-xl">
                          {donor.bloodGroup}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg text-foreground flex items-center gap-2">
                            {donor.name}
                            {donor.type === 'registered' && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">You</span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{donor.location}</div>
                        </div>
                      </button>
                    ))}
                  {donors
                    .filter(d => !selectedDonorGroup || d.bloodGroup === selectedDonorGroup)
                    .concat(
                      user && user.role === 'donor' && isUserEligibleToDonate(user) 
                        ? [{
                            id: user.id,
                            name: user.name,
                            bloodGroup: user.bloodGroup,
                            phone: user.phone,
                            location: user.location?.address || 'Location not set',
                            isVerified: true,
                            type: 'registered'
                          }]
                        : []
                    )
                    .filter(d => !selectedDonorGroup || d.bloodGroup === selectedDonorGroup)
                    .length === 0 && (
                    <div className="col-span-2 text-center text-muted-foreground py-8">No donors found for this blood group.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Donor Details Modal */}
          <Dialog open={!!activeDonor} onOpenChange={open => !open && setActiveDonor(null)}>
            {activeDonor && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white dark:bg-background rounded-lg shadow-xl max-w-md w-full p-6 relative">
                  <button className="absolute top-2 right-2 text-xl text-muted-foreground hover:text-foreground" onClick={() => setActiveDonor(null)}>&times;</button>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-2xl">
                      {activeDonor.bloodGroup || activeDonor.group}
                    </div>
                    <div>
                      <div className="font-bold text-xl text-foreground">{activeDonor.name}</div>
                      {activeDonor.distance && (
                        <div className="text-sm text-muted-foreground">{activeDonor.distance} away</div>
                      )}
                    </div>
                  </div>
                  {activeDonor.bloodGroup && (
                    <div className="mb-2"><span className="font-semibold">Blood Group:</span> {activeDonor.bloodGroup}</div>
                  )}
                  {activeDonor.phone && (
                    <div className="mb-2"><span className="font-semibold">Phone:</span> <a href={`tel:${activeDonor.phone}`} className="text-primary underline">{activeDonor.phone}</a></div>
                  )}
                  {activeDonor.coordinates && activeDonor.coordinates.lat && activeDonor.coordinates.lng ? (
                    <div className="mb-2">
                      <span className="font-semibold">Location:</span>{" "}
                      <a
                        href={`https://www.google.com/maps?q=${encodeURIComponent(activeDonor.coordinates.lat)},${encodeURIComponent(activeDonor.coordinates.lng)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        Open in Google Maps
                      </a>
                    </div>
                  ) : (
                    activeDonor.location && (
                      <div className="mb-2">
                        <span className="font-semibold">Location:</span> {activeDonor.location}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </Dialog>

          {/* Urgent Requests Near You should appear under donors and above details */}
          <div className="mb-6 mt-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-foreground flex items-center">
                <MapPin className="mr-2 h-6 w-6 text-primary" />
                Urgent Requests Near You ({nearbyRequests.length})
              </h2>
            </div>
            
            {/* Location Filter for Requests */}
            <div className="mb-4">
              <LocationFilter 
                title="Filter Requests by Location" 
                onFilterChange={handleLocationFilterChange}
                initialFilters={null}
                className="requests-location-filter"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {nearbyRequests.map((request: any) => (
              <Card key={request.id || request.bloodGroup} className="border-l-4 border-l-primary hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2 font-extrabold text-xl shadow-md">
                        {request.bloodGroup}
                      </div>
                      <span className="font-semibold">{request.quantity} units needed</span>
                    </CardTitle>
                    <Badge
                      variant={request.urgency === "Critical" ? "destructive" : "secondary"}
                      className="animate-pulse"
                    >
                      {request.urgency}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      1 patient needs help
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {request.createdAt ? 'Just now' : ''}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {request.location}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button size="sm" className="w-full" onClick={() => setSelectedBloodGroup(request)}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{stats.activeDonors.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Active Donors</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{stats.livesSaved.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Lives Saved</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{stats.activeRequests.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Active Requests</p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Info className="h-6 w-6 text-primary" />
            Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Functionality */}
            <Card className="p-6">
              <CardContent>
                <h3 className="text-xl font-semibold mb-4 text-primary">Functionality</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>• <span className="font-medium text-foreground">Quick Donor Registration:</span> Register as a blood donor instantly without creating an account</p>
                  <p>• <span className="font-medium text-foreground">Emergency Blood Requests:</span> Submit urgent blood requests with location and blood group details</p>
                  <p>• <span className="font-medium text-foreground">Find Nearby Donors:</span> Browse available donors in your area filtered by blood group and location</p>
                  <p>• <span className="font-medium text-foreground">View Blood Requests:</span> See active blood requests near you with urgency levels</p>
                  <p>• <span className="font-medium text-foreground">Location-Based Matching:</span> Automatic location detection to connect nearby donors and recipients</p>
                  <p>• <span className="font-medium text-foreground">Real-Time Updates:</span> Live statistics showing active donors, requests, and lives saved</p>
                  <p>• <span className="font-medium text-foreground">Blood Group Information:</span> Learn about blood compatibility and donation requirements</p>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming */}
            <Card className="p-6">
              <CardContent>
                <h3 className="text-xl font-semibold mb-4 text-primary">Upcoming</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>• <span className="font-medium text-foreground">User Authentication:</span> Create accounts with login and signup functionality</p>
                  <p>• <span className="font-medium text-foreground">Personal Dashboard:</span> Manage your donations, requests, and profile from a centralized dashboard</p>
                  <p>• <span className="font-medium text-foreground">Profile Management:</span> Edit personal information, donation history, and preferences</p>
                  <p>• <span className="font-medium text-foreground">Donation History:</span> Track your donation timeline and eligibility status</p>
                  <p>• <span className="font-medium text-foreground">Advanced Notifications:</span> Push notifications for nearby emergency requests</p>
                  <p>• <span className="font-medium text-foreground">Hospital Integration:</span> Direct hospital partnerships for verified blood requests</p>
                  <p>• <span className="font-medium text-foreground">Donor Verification:</span> Medical verification system for donor authenticity</p>
                  <p>• <span className="font-medium text-foreground">Mobile App:</span> Native mobile application for iOS and Android</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Location Status */}
        {userLocation && (
          <div className="text-center text-sm text-muted-foreground mb-8">
            <MapPin className="h-4 w-4 inline mr-2" />
            Location detected: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
          </div>
        )}
        {locationError && (
          <div className="text-center text-sm text-destructive mb-8">
            <MapPin className="h-4 w-4 inline mr-2" />
            {locationError}
          </div>
        )}
      </div>

      <QuickRegisterModal open={showQuickRegister} onOpenChange={setShowQuickRegister} />
      <QuickRequestModal open={showQuickRequest} onOpenChange={setShowQuickRequest} />
      <BloodGroupDetailsModal
        bloodGroupData={selectedBloodGroup}
        open={!!selectedBloodGroup}
        onOpenChange={(open) => !open && setSelectedBloodGroup(null)}
      />
      
      {/* Blood Compatibility Modal */}
      <Dialog open={showBloodCompatibility} onOpenChange={setShowBloodCompatibility}>
        {showBloodCompatibility && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white dark:bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Blood Compatibility Chart</h2>
                  <button 
                    className="text-2xl text-muted-foreground hover:text-foreground" 
                    onClick={() => setShowBloodCompatibility(false)}
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Donation Compatibility Table */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Who Can Donate to Whom</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-muted">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border border-muted p-3 text-left font-semibold">Donor Blood Type</th>
                            <th className="border border-muted p-3 text-left font-semibold">Can Donate To</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-muted p-3 font-bold text-primary">O-</td>
                            <td className="border border-muted p-3">O-, O+, A-, A+, B-, B+, AB-, AB+ (Universal Donor)</td>
                          </tr>
                          <tr className="bg-muted/50">
                            <td className="border border-muted p-3 font-bold text-primary">O+</td>
                            <td className="border border-muted p-3">O+, A+, B+, AB+</td>
                          </tr>
                          <tr>
                            <td className="border border-muted p-3 font-bold text-primary">A-</td>
                            <td className="border border-muted p-3">A-, A+, AB-, AB+</td>
                          </tr>
                          <tr className="bg-muted/50">
                            <td className="border border-muted p-3 font-bold text-primary">A+</td>
                            <td className="border border-muted p-3">A+, AB+</td>
                          </tr>
                          <tr>
                            <td className="border border-muted p-3 font-bold text-primary">B-</td>
                            <td className="border border-muted p-3">B-, B+, AB-, AB+</td>
                          </tr>
                          <tr className="bg-muted/50">
                            <td className="border border-muted p-3 font-bold text-primary">B+</td>
                            <td className="border border-muted p-3">B+, AB+</td>
                          </tr>
                          <tr>
                            <td className="border border-muted p-3 font-bold text-primary">AB-</td>
                            <td className="border border-muted p-3">AB-, AB+</td>
                          </tr>
                          <tr className="bg-muted/50">
                            <td className="border border-muted p-3 font-bold text-primary">AB+</td>
                            <td className="border border-muted p-3">AB+ only (Universal Recipient)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Receiving Compatibility Table */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Who Can Receive from Whom</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-muted">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border border-muted p-3 text-left font-semibold">Recipient Blood Type</th>
                            <th className="border border-muted p-3 text-left font-semibold">Can Receive From</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-muted p-3 font-bold text-primary">O-</td>
                            <td className="border border-muted p-3">O- only</td>
                          </tr>
                          <tr className="bg-muted/50">
                            <td className="border border-muted p-3 font-bold text-primary">O+</td>
                            <td className="border border-muted p-3">O-, O+</td>
                          </tr>
                          <tr>
                            <td className="border border-muted p-3 font-bold text-primary">A-</td>
                            <td className="border border-muted p-3">O-, A-</td>
                          </tr>
                          <tr className="bg-muted/50">
                            <td className="border border-muted p-3 font-bold text-primary">A+</td>
                            <td className="border border-muted p-3">O-, O+, A-, A+</td>
                          </tr>
                          <tr>
                            <td className="border border-muted p-3 font-bold text-primary">B-</td>
                            <td className="border border-muted p-3">O-, B-</td>
                          </tr>
                          <tr className="bg-muted/50">
                            <td className="border border-muted p-3 font-bold text-primary">B+</td>
                            <td className="border border-muted p-3">O-, O+, B-, B+</td>
                          </tr>
                          <tr>
                            <td className="border border-muted p-3 font-bold text-primary">AB-</td>
                            <td className="border border-muted p-3">O-, A-, B-, AB-</td>
                          </tr>
                          <tr className="bg-muted/50">
                            <td className="border border-muted p-3 font-bold text-primary">AB+</td>
                            <td className="border border-muted p-3">O-, O+, A-, A+, B-, B+, AB-, AB+ (Universal Recipient)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Key Information */}
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Key Information</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• <span className="font-medium text-foreground">O- (Universal Donor):</span> Can donate to all blood types, but can only receive from O-</p>
                      <p>• <span className="font-medium text-foreground">AB+ (Universal Recipient):</span> Can receive from all blood types, but can only donate to AB+</p>
                      <p>• <span className="font-medium text-foreground">Rh Factor:</span> Negative (-) blood can be given to both positive (+) and negative (-) recipients of the same ABO group</p>
                      <p>• <span className="font-medium text-foreground">Emergency Situations:</span> O- blood is often used in emergencies when the recipient's blood type is unknown</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
