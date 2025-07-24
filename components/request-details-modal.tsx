"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Clock, Users, Phone, Navigation, User, Calendar, AlertTriangle, Building2 } from 'lucide-react'

interface RequestDetailsModalProps {
  request: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestDetailsModal({ request, open, onOpenChange }: RequestDetailsModalProps) {
  if (!request) return null

  const handleShowDirections = () => {
    const { lat, lng } = request.coordinates
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
    window.open(googleMapsUrl, '_blank')
  }

  const handleContact = () => {
    window.open(`tel:${request.contactPhone}`, '_self')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-primary">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 font-bold">
              {request.bloodGroup}
            </div>
            Blood Request Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Urgency Badge */}
          <div className="flex justify-center">
            <Badge
              variant={request.urgency === "Critical" ? "destructive" : "secondary"}
              className="animate-pulse text-lg px-4 py-2"
            >
              {request.urgency} - {request.quantity}
            </Badge>
          </div>

          <Separator />

          {/* Patient Information */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center">
              <User className="h-4 w-4 mr-2" />
              Patient Information
            </h3>
            <div className="bg-muted p-3 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient:</span>
                <span className="font-medium">{request.patient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age:</span>
                <span>{request.patientAge}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gender:</span>
                <span>{request.patientGender}</span>
              </div>
              <div className="mt-2">
                <span className="text-muted-foreground">Reason:</span>
                <p className="text-sm mt-1">{request.reason}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Hospital Information */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              Hospital Information
            </h3>
            <div className="bg-muted p-3 rounded-lg space-y-2">
              <div>
                <span className="text-muted-foreground">Hospital:</span>
                <p className="font-medium">{request.location}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Address:</span>
                <p className="text-sm">{request.hospitalAddress}</p>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance:</span>
                <span>{request.distance}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Contact Information
            </h3>
            <div className="bg-muted p-3 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contact Person:</span>
                <span className="font-medium">{request.contactPerson}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span>{request.contactPhone}</span>
              </div>
              <div className="flex items-center text-muted-foreground text-sm">
                <Clock className="h-3 w-3 mr-1" />
                Posted {request.timePosted}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleContact} className="flex-1">
              <Phone className="h-4 w-4 mr-2" />
              Contact Hospital
            </Button>
            <Button onClick={handleShowDirections} variant="outline" className="flex-1 bg-transparent">
              <Navigation className="h-4 w-4 mr-2" />
              Show Directions
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}