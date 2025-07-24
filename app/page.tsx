"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Droplets, AlertTriangle, Users } from "lucide-react"
import { useApp } from "@/components/providers"
import { QuickRegisterModal } from "@/components/quick-register-modal"
import { QuickRequestModal } from "@/components/quick-request-modal"
import Link from "next/link"
import { BloodGroupDetailsModal } from "@/components/bloo-group-details-modal"
import { Dialog } from "@/components/ui/dialog"

export default function HomePage() {
  const { currentIncident, user } = useApp()
  const [showQuickRegister, setShowQuickRegister] = useState(false)
  const [showQuickRequest, setShowQuickRequest] = useState(false)
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<any>(null)
  const [showLiveAlert, setShowLiveAlert] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [selectedDonorGroup, setSelectedDonorGroup] = useState<string | null>(null)
  const [activeDonor, setActiveDonor] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          setLocationError("Location access denied or unavailable.")
        }
      )
    } else {
      setLocationError("Geolocation is not supported by this browser.")
    }
  }, [])

  // Grouped blood requests by blood type
  const bloodGroupRequests = [
    {
      bloodGroup: "O-",
      totalUnits: 5,
      urgency: "Critical",
      requestCount: 3,
      timePosted: "8 mins ago",
      patients: [
        {
          id: 1,
          cause: "Emergency Surgery",
          age: "45 years old",
          gender: "Male",
          unitsNeeded: 2,
          hospital: "Dhaka Medical College Hospital",
          hospitalAddress: "Dhaka Medical College Hospital, Ramna, Dhaka 1000",
          distance: "1.2 km",
          contactPerson: "Dr. Rahman",
          contactPhone: "+880 1711-123456",
          timePosted: "15 mins ago",
          coordinates: { lat: 23.7261, lng: 90.3961 },
        },
        {
          id: 2,
          cause: "Jet Crash Victim",
          age: "35 years old",
          gender: "Male",
          unitsNeeded: 3,
          hospital: "Diabari Emergency Center",
          hospitalAddress: "Diabari Emergency Medical Center, Uttara, Dhaka",
          distance: "0.8 km",
          contactPerson: "Dr. Ahmed",
          contactPhone: "+880 1713-345678",
          timePosted: "8 mins ago",
          coordinates: { lat: 23.8759, lng: 90.3795 },
        },
      ],
    },
    {
      bloodGroup: "A+",
      totalUnits: 4,
      urgency: "Urgent",
      requestCount: 2,
      timePosted: "12 mins ago",
      patients: [
        {
          id: 3,
          cause: "Road Accident",
          age: "28 years old",
          gender: "Female",
          unitsNeeded: 1,
          hospital: "Square Hospital Ltd",
          hospitalAddress: "Square Hospital Ltd, West Panthapath, Dhaka 1205",
          distance: "2.8 km",
          contactPerson: "Dr. Fatima",
          contactPhone: "+880 1712-234567",
          timePosted: "32 mins ago",
          coordinates: { lat: 23.7516, lng: 90.374 },
        },
        {
          id: 4,
          cause: "Surgery Complications",
          age: "52 years old",
          gender: "Male",
          unitsNeeded: 3,
          hospital: "United Hospital",
          hospitalAddress: "United Hospital, Gulshan, Dhaka 1212",
          distance: "3.5 km",
          contactPerson: "Dr. Khan",
          contactPhone: "+880 1714-456789",
          timePosted: "12 mins ago",
          coordinates: { lat: 23.7806, lng: 90.4193 },
        },
      ],
    },
    {
      bloodGroup: "B+",
      totalUnits: 6,
      urgency: "Critical",
      requestCount: 2,
      timePosted: "5 mins ago",
      patients: [
        {
          id: 5,
          cause: "Jet Crash Victim",
          age: "29 years old",
          gender: "Female",
          unitsNeeded: 2,
          hospital: "Diabari Emergency Center",
          hospitalAddress: "Diabari Emergency Medical Center, Uttara, Dhaka",
          distance: "0.8 km",
          contactPerson: "Dr. Ahmed",
          contactPhone: "+880 1713-345678",
          timePosted: "5 mins ago",
          coordinates: { lat: 23.8759, lng: 90.3795 },
        },
        {
          id: 6,
          cause: "Internal Bleeding",
          age: "41 years old",
          gender: "Male",
          unitsNeeded: 4,
          hospital: "Apollo Hospital",
          hospitalAddress: "Apollo Hospital, Bashundhara, Dhaka 1229",
          distance: "4.2 km",
          contactPerson: "Dr. Hasan",
          contactPhone: "+880 1715-567890",
          timePosted: "18 mins ago",
          coordinates: { lat: 23.8041, lng: 90.4152 },
        },
      ],
    },
  ]

  // Dummy hospital data for map pins
  const hospitals = [
    {
      name: "Dhaka Medical College Hospital",
      lat: 23.7261,
      lng: 90.3961,
      unitsNeeded: 2,
      bloodGroup: "B+",
    },
    {
      name: "Diabari Emergency Center",
      lat: 23.8759,
      lng: 90.3795,
      unitsNeeded: 3,
      bloodGroup: "O-",
    },
    {
      name: "Square Hospital Ltd",
      lat: 23.7516,
      lng: 90.374,
      unitsNeeded: 1,
      bloodGroup: "A+",
    },
    {
      name: "United Hospital",
      lat: 23.7806,
      lng: 90.4193,
      unitsNeeded: 3,
      bloodGroup: "A+",
    },
    {
      name: "Apollo Hospital",
      lat: 23.8041,
      lng: 90.4152,
      unitsNeeded: 4,
      bloodGroup: "B+",
    },
  ]

  const inspirationalQuote = "Every drop counts. Your donation can save up to three lives."

  return (
    <div className="min-h-screen bg-background">
      {/* Emergency/Inspirational Header */}
      {currentIncident ? (
        <Link href="/incident" className="block w-full">
          <div className="w-full py-4 px-4 emergency-gradient cursor-pointer transition-opacity hover:opacity-90">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-white animate-pulse" />
                <div>
                  <p className="text-white font-semibold text-lg">{currentIncident}</p>
                  <p className="text-red-100 text-sm">Urgent blood donations needed</p>
                </div>
              </div>
              <Badge variant="destructive" className="animate-pulse">
                EMERGENCY
              </Badge>
            </div>
          </div>
        </Link>
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
          <h1 className="text-4xl font-bold mb-4 text-foreground">BloodLink</h1>
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
        </div>

        {/* Auth Options */}
        {!user && (
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
        )}

        {/* Urgent Blood Requests */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground flex items-center">
              <MapPin className="mr-2 h-6 w-6 text-primary" />
              Urgent Requests Near You ({bloodGroupRequests.length})
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
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Available Donors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Blood Group Selector and View All */}
                <div className="relative flex items-center py-2 px-1 scrollbar-hide">
                  <div className="flex gap-2 overflow-x-auto pr-32">
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 whitespace-nowrap"
                    onClick={() => setSelectedDonorGroup(null)}
                  >
                    View All
                  </Button>
                </div>
                {/* Donor List (dummy data for now) */}
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {[
                    { name: "Rafiq Ahmed", group: "O-", distance: "1.2 km", lastDonated: "2 months ago", phone: "+880 1711-123456", email: "rafiq@email.com", age: 32, gender: "Male" },
                    { name: "Sadia Rahman", group: "A+", distance: "2.8 km", lastDonated: "1 month ago", phone: "+880 1712-234567", email: "sadia@email.com", age: 27, gender: "Female" },
                    { name: "Imran Hossain", group: "B+", distance: "0.8 km", lastDonated: "3 weeks ago", phone: "+880 1713-345678", email: "imran@email.com", age: 29, gender: "Male" },
                    { name: "Nusrat Jahan", group: "AB+", distance: "3.5 km", lastDonated: "1 week ago", phone: "+880 1714-456789", email: "nusrat@email.com", age: 24, gender: "Female" },
                    { name: "Tanvir Islam", group: "O+", distance: "2.1 km", lastDonated: "2 months ago", phone: "+880 1715-567890", email: "tanvir@email.com", age: 35, gender: "Male" },
                    { name: "Farhana Akter", group: "A-", distance: "1.7 km", lastDonated: "5 weeks ago", phone: "+880 1716-678901", email: "farhana@email.com", age: 31, gender: "Female" },
                  ]
                    .filter(donor => !selectedDonorGroup || donor.group === selectedDonorGroup)
                    .map((donor, idx) => (
                      <button key={idx} className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50 shadow hover:shadow-md transition-shadow text-left w-full" onClick={() => setActiveDonor(donor)}>
                        <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-xl">
                          {donor.group}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg text-foreground">{donor.name}</div>
                          <div className="text-sm text-muted-foreground">{donor.distance} away • Last donated: {donor.lastDonated}</div>
                        </div>
                      </button>
                    ))}
                  {([
                    { name: "Rafiq Ahmed", group: "O-", distance: "1.2 km", lastDonated: "2 months ago" },
                    { name: "Sadia Rahman", group: "A+", distance: "2.8 km", lastDonated: "1 month ago" },
                    { name: "Imran Hossain", group: "B+", distance: "0.8 km", lastDonated: "3 weeks ago" },
                    { name: "Nusrat Jahan", group: "AB+", distance: "3.5 km", lastDonated: "1 week ago" },
                    { name: "Tanvir Islam", group: "O+", distance: "2.1 km", lastDonated: "2 months ago" },
                    { name: "Farhana Akter", group: "A-", distance: "1.7 km", lastDonated: "5 weeks ago" },
                  ]
                    .filter(donor => !selectedDonorGroup || donor.group === selectedDonorGroup)
                  ).length === 0 && (
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
                      {activeDonor.group}
                    </div>
                    <div>
                      <div className="font-bold text-xl text-foreground">{activeDonor.name}</div>
                      <div className="text-sm text-muted-foreground">{activeDonor.distance} away</div>
                    </div>
                  </div>
                  <div className="mb-2"><span className="font-semibold">Last Donated:</span> {activeDonor.lastDonated}</div>
                  <div className="mb-2"><span className="font-semibold">Age:</span> {activeDonor.age}</div>
                  <div className="mb-2"><span className="font-semibold">Gender:</span> {activeDonor.gender}</div>
                  <div className="mb-2"><span className="font-semibold">Phone:</span> <a href={`tel:${activeDonor.phone}`} className="text-primary underline">{activeDonor.phone}</a></div>
                  <div className="mb-2"><span className="font-semibold">Email:</span> <a href={`mailto:${activeDonor.email}`} className="text-primary underline">{activeDonor.email}</a></div>
                </div>
              </div>
            )}
          </Dialog>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bloodGroupRequests.map((request) => (
              <Card key={request.bloodGroup} className="border-l-4 border-l-primary hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2 font-extrabold text-xl shadow-md">
                        {request.bloodGroup}
                      </div>
                      <span className="font-semibold">{request.totalUnits} units needed</span>
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
                      {request.requestCount} patients need help
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      Most recent: {request.timePosted}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      Multiple locations nearby
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">1,247</div>
              <p className="text-sm text-muted-foreground">Active Donors</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">89</div>
              <p className="text-sm text-muted-foreground">Lives Saved</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">23</div>
              <p className="text-sm text-muted-foreground">Active Requests</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <QuickRegisterModal open={showQuickRegister} onOpenChange={setShowQuickRegister} />
      <QuickRequestModal open={showQuickRequest} onOpenChange={setShowQuickRequest} />
      <BloodGroupDetailsModal
        bloodGroupData={selectedBloodGroup}
        open={!!selectedBloodGroup}
        onOpenChange={(open) => !open && setSelectedBloodGroup(null)}
      />
    </div>
  )
}
