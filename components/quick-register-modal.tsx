"use client"

import type React from "react"

import { useState, useEffect } from "react"
import "./quick-register-modal.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, MapPin, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { db } from "@/app/firebase/config"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import LocationSelector from "./LocationSelector"

interface QuickRegisterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickRegisterModal({ open, onOpenChange }: QuickRegisterModalProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    bloodGroup: "",
    phone: "",
    whatsappNumber: "",
    useSameNumber: true,
    location: "",
  })
  const [selectedLocation, setSelectedLocation] = useState<{
    division: string;
    district: string;
    subDistrict: string;
  } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  const handleLocationChange = (location: any) => {
    setSelectedLocation(location);
    if (location?.subDistrict) {
      setFormData(prev => ({ ...prev, location: `${location.subDistrict}, ${location.district}, ${location.division}` }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const deviceId = (() => {
        if (typeof window === 'undefined') return undefined as unknown as string
        const existing = localStorage.getItem('deviceId')
        if (existing) return existing
        const id = `dev_${Math.random().toString(36).slice(2)}${Date.now()}`
        localStorage.setItem('deviceId', id)
        return id
      })()
      // Create quick user data
      const quickUserData = {
        name: formData.name,
        bloodGroup: formData.bloodGroup,
        phone: formData.phone,
        whatsappNumber: formData.useSameNumber ? formData.phone : formData.whatsappNumber,
        location: formData.location,
        coordinates: null,
        registeredAt: serverTimestamp(),
        type: "quick",
        visibility: 'public',
        deviceId,
      }
      
      // Store in Firestore under users (public quick user)
      const docRef = await addDoc(collection(db, "users"), quickUserData)

      // Store also in localStorage for session continuity
      localStorage.setItem('quickUser', JSON.stringify(quickUserData))
      localStorage.setItem('quickUserId', docRef.id)
      
      // Close modal and redirect
      onOpenChange(false)
      router.push('/quickuser')
      
    } catch (error) {
      console.error("Quick registration error:", error)
      setLocationError("Registration failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="quick-register-modal sm:max-w-2xl w-full max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-primary">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Quick Donor Registration
          </DialogTitle>
          <DialogDescription>
            Register quickly to help in emergency situations. This registration will be archived within 15 days.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <Label htmlFor="bloodGroup">Blood Group</Label>
            <Select
              value={formData.bloodGroup}
              onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select blood group" />
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
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value, ...(formData.useSameNumber ? { whatsappNumber: e.target.value } : {}) })}
              placeholder="+880 1XXX-XXXXXX"
              required
            />
          </div>

          <div>
            <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  id="useSameNumber"
                  type="checkbox"
                  checked={formData.useSameNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, useSameNumber: e.target.checked, whatsappNumber: e.target.checked ? prev.phone : prev.whatsappNumber }))}
                />
                <Label htmlFor="useSameNumber" className="text-sm">Same as phone number</Label>
              </div>
              {!formData.useSameNumber && (
                <Input
                  id="whatsappNumber"
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  placeholder="+880 1XXX-XXXXXX"
                  required
                />
              )}
              {formData.useSameNumber && (
                <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                  WhatsApp: {formData.phone || "Not set"}
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="location">Current Location</Label>
            <div className="w-full overflow-hidden">
              <LocationSelector
                title="Your Location"
                onLocationChange={handleLocationChange}
                required={true}
                className="quick-register-location w-full"
              />
            </div>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground flex items-start">
              <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-yellow-500" />
              This is a quick registration without OTP verification. Your record will be marked as unverified and
              archived within 15 days.
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register Now"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
