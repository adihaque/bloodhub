"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, MapPin, Clock } from "lucide-react"

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
    contactPhone: "",
    notes: "",
  })

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  const urgencyLevels = ["Critical", "Urgent", "Moderate"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle quick request
    console.log("Quick request:", formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-primary">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Quick Blood Request
          </DialogTitle>
          <DialogDescription>
            Submit an urgent blood request. This will be visible to nearby donors immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                  <SelectItem value="5+">5+ Units</SelectItem>
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
            <Label htmlFor="location">Hospital/Location</Label>
            <div className="flex gap-2">
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Hospital name or address"
                required
              />
              <Button type="button" variant="outline" size="icon">
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
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
            <Button type="submit" className="flex-1">
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
