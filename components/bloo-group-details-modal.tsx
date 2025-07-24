"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Phone, Navigation, User, Building2, AlertTriangle } from "lucide-react"

interface BloodGroupDetailsModalProps {
  bloodGroupData: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BloodGroupDetailsModal({ bloodGroupData, open, onOpenChange }: BloodGroupDetailsModalProps) {
  if (!bloodGroupData) return null

  const handleShowDirections = (coordinates: { lat: number; lng: number }) => {
    const { lat, lng } = coordinates
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
    window.open(googleMapsUrl, "_blank")
  }

  const handleContact = (phone: string) => {
    window.open(`tel:${phone}`, "_self")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-primary">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 font-bold">
              {bloodGroupData.bloodGroup}
            </div>
            {bloodGroupData.bloodGroup} Blood Requests ({bloodGroupData.totalUnits} units needed)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="flex justify-center">
            <Badge
              variant={bloodGroupData.urgency === "Critical" ? "destructive" : "secondary"}
              className="animate-pulse text-lg px-4 py-2"
            >
              {bloodGroupData.urgency} - {bloodGroupData.requestCount} patients
            </Badge>
          </div>

          <Separator />

          {/* Patient Cards */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Patients Needing {bloodGroupData.bloodGroup} Blood:</h3>

            {bloodGroupData.patients.map((patient: any) => (
              <Card key={patient.id} className="border-l-4 border-l-primary">
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {/* Patient Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-lg">{patient.cause}</span>
                      </div>
                      <Badge variant="outline">{patient.unitsNeeded} units needed</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {patient.age}, {patient.gender}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Posted {patient.timePosted}</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Hospital Information */}
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center">
                        <Building2 className="h-4 w-4 mr-2" />
                        Hospital Information
                      </h4>
                      <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Hospital:</span>
                          <p className="font-medium">{patient.hospital}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Address:</span>
                          <p>{patient.hospitalAddress}</p>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Distance:</span>
                          <span className="font-medium">{patient.distance}</span>
                        </div>
                        <div className="pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShowDirections(patient.coordinates)}
                            className="w-full bg-transparent"
                          >
                            <Navigation className="h-3 w-3 mr-2" />
                            Show Directions
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Contact Information */}
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        Contact Information
                      </h4>
                      <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contact Person:</span>
                          <span className="font-medium">{patient.contactPerson}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span>{patient.contactPhone}</span>
                        </div>
                        <div className="pt-2">
                          <Button size="sm" onClick={() => handleContact(patient.contactPhone)} className="w-full">
                            <Phone className="h-3 w-3 mr-2" />
                            Contact Hospital
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
