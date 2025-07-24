"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, MapPin } from "lucide-react"

interface QuickRegisterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickRegisterModal({ open, onOpenChange }: QuickRegisterModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    bloodGroup: "",
    phone: "",
    location: "",
  })

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle quick registration
    console.log("Quick registration:", formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-primary">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Quick Donor Registration
          </DialogTitle>
          <DialogDescription>
            Register quickly to help in emergency situations. This registration will be archived within 15 days.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+880 1XXX-XXXXXX"
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Current Location</Label>
            <div className="flex gap-2">
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter your location"
                required
              />
              <Button type="button" variant="outline" size="icon">
                <MapPin className="h-4 w-4" />
              </Button>
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
            <Button type="submit" className="flex-1">
              Register Now
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
