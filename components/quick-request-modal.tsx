"use client"

import type React from "react"

import { useState, useEffect } from "react"
import "./quick-request-modal.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, MapPin, Clock, Loader2 } from "lucide-react"
import { db } from "@/app/firebase/config"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import LocationSelector from "./LocationSelector"
import { HospitalSelector } from "./HospitalSelector"

interface QuickRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickRequestModal({ open, onOpenChange }: QuickRequestModalProps) {
  const [formData, setFormData] = useState({
    patientName: "",
    bloodGroup: "",
    quantity: "",
    urgency: "",
    location: "",
    hospital: "",
    hospitalAddress: "",
    contactPhone: "",
    notes: "",
  })
  const [selectedLocation, setSelectedLocation] = useState<{
    division: string;
    district: string;
    subDistrict: string;
  } | null>(null)
  const [selectedHospital, setSelectedHospital] = useState<{
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
  } | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  const urgencyLevels = ["Critical", "Urgent", "Moderate"]

  const handleLocationChange = (location: any) => {
    setSelectedLocation(location);
    if (location?.subDistrict) {
      setFormData(prev => ({ ...prev, location: `${location.subDistrict}, ${location.district}, ${location.division}` }));
    }
  };

  const handleHospitalSelect = (hospital: any) => {
    setSelectedHospital(hospital);
    setFormData(prev => ({
      ...prev,
      hospital: hospital.name,
      hospitalAddress: hospital.address,
      location: hospital.address
    }));
    // Update user location to hospital coordinates for better request targeting
    setUserLocation(hospital.coordinates);
  };

  const getCurrentLocation = () => {
    setIsLocating(true)
    setLocationError(null)
    
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
          
          // Reverse geocoding to get address (simplified)
          const address = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
          setFormData(prev => ({ ...prev, location: address }))
          setIsLocating(false)
        },
        (error) => {
          console.error("Location error:", error)
          setLocationError("Location access denied or unavailable.")
          setIsLocating(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    } else {
      setLocationError("Geolocation is not supported by this browser.")
      setIsLocating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Create blood request data
      const bloodRequestData = {
        patientName: formData.patientName,
        bloodGroup: formData.bloodGroup,
        quantity: parseInt(formData.quantity),
        urgency: formData.urgency,
        location: formData.location,
        hospital: formData.hospital,
        hospitalAddress: formData.hospitalAddress,
        coordinates: selectedHospital?.coordinates || userLocation,
        contactPhone: formData.contactPhone,
        notes: formData.notes,
        status: "active",
        createdAt: serverTimestamp(),
        type: "quick"
      }
      
      // Store in Firestore
      await addDoc(collection(db, "requests"), bloodRequestData)
      
      // Close modal and show success
      onOpenChange(false)
      
      // You could show a toast notification here
      alert("Blood request submitted successfully! Nearby donors will be notified.")
      
    } catch (error) {
      console.error("Quick request error:", error)
      setLocationError("Request submission failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="quick-request-modal sm:max-w-2xl w-full max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-primary">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Quick Blood Request
          </DialogTitle>
          <DialogDescription>
            Submit an urgent blood request. This will be visible to nearby donors immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div>
            <Label htmlFor="patientName">Patient Name</Label>
            <Input
              id="patientName"
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              placeholder="Enter patient name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select
                value={formData.bloodGroup}
                onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((group) => (
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
                value={formData.quantity}
                onValueChange={(value) => setFormData({ ...formData, quantity: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Unit</SelectItem>
                  <SelectItem value="2">2 Units</SelectItem>
                  <SelectItem value="3">3 Units</SelectItem>
                  <SelectItem value="4">4 Units</SelectItem>
                  <SelectItem value="5">5+ Units</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="urgency">Urgency Level</Label>
            <Select value={formData.urgency} onValueChange={(value) => setFormData({ ...formData, urgency: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                {urgencyLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {level}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="hospital">Select Hospital</Label>
            <div className="w-full overflow-hidden">
              <HospitalSelector
                onHospitalSelect={handleHospitalSelect}
                selectedHospital={selectedHospital}
                className="quick-request-hospital w-full"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Area/Location (Optional)</Label>
            <div className="w-full overflow-hidden">
              <LocationSelector
                title="General Area"
                onLocationChange={handleLocationChange}
                required={false}
                className="quick-request-location w-full"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This helps donors find you if hospital selection above is not specific enough.
            </p>
          </div>

          <div>
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <Input
              id="contactPhone"
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder="+880 1XXX-XXXXXX"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
