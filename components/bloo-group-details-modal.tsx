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

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    const message = encodeURIComponent(`Hi, I saw your blood request for ${bloodGroupData.bloodGroup} blood. I would like to help donate.`)
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank")
  }

  // Handle single blood request (not grouped)
  const isSingleRequest = bloodGroupData.patientName || bloodGroupData.contactPhone
  const patients = isSingleRequest ? [bloodGroupData] : (bloodGroupData?.patients || [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-primary">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 font-bold">
              {bloodGroupData.bloodGroup}
            </div>
            {isSingleRequest ? 
              `${bloodGroupData.bloodGroup} Blood Request (${bloodGroupData.quantity || 1} units needed)` :
              `${bloodGroupData.bloodGroup} Blood Requests (${bloodGroupData.totalUnits} units needed)`
            }
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="flex justify-center">
            <Badge
              variant={bloodGroupData.urgency === "Critical" ? "destructive" : "secondary"}
              className="animate-pulse text-lg px-4 py-2"
            >
              {bloodGroupData.urgency} - {isSingleRequest ? '1 patient' : `${bloodGroupData.requestCount} patients`}
            </Badge>
          </div>

          <Separator />

          {/* Patient Cards */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{isSingleRequest ? 'Patient Details:' : `Patients Needing ${bloodGroupData.bloodGroup} Blood:`}</h3>

            {patients.map((patient: any, index: number) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {/* Patient Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-lg">{patient.patientName || patient.cause || 'Emergency Case'}</span>
                      </div>
                      <Badge variant="outline">{patient.unitsNeeded || patient.quantity || 1} units needed</Badge>
                    </div>

                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Posted {patient.timePosted || patient.createdAt ? 'recently' : 'just now'}</span>
                    </div>
                    {(patient.age || patient.gender) && (
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {[patient.age, patient.gender].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}

                    <Separator />

                    {/* Hospital Information */}
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center">
                        <Building2 className="h-4 w-4 mr-2" />
                        Hospital Information
                      </h4>
                      <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Location:</span>
                          <p className="font-medium">{patient.location || patient.hospital || 'Location not provided'}</p>
                        </div>
                        {patient.notes && (
                          <div>
                            <span className="text-muted-foreground">Additional Notes:</span>
                            <p className="text-sm">{patient.notes}</p>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Distance:</span>
                          <span className="font-medium">{patient.distance || 'Calculating...'}</span>
                        </div>
                        {patient.coordinates && (
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
                        )}
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
                          <span className="text-muted-foreground">Patient:</span>
                          <span className="font-medium">{patient.patientName || 'Anonymous'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contact Phone:</span>
                          <span className="font-medium">{patient.contactPhone || 'Not provided'}</span>
                        </div>
                        {patient.contactPhone && (
                          <div className="pt-2 space-y-2">
                            <Button size="sm" onClick={() => handleContact(patient.contactPhone)} className="w-full">
                              <Phone className="h-3 w-3 mr-2" />
                              Call Now
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleWhatsApp(patient.contactPhone)} className="w-full">
                              <svg className="h-3 w-3 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z"/>
                              </svg>
                              WhatsApp
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Emergency Contact Info */}
          {isSingleRequest && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">🚨 Emergency Blood Request</h4>
              <p className="text-sm text-red-700">
                This is an urgent request. Please contact immediately if you can donate {bloodGroupData.bloodGroup} blood.
              </p>
              <div className="mt-3 text-sm text-red-600">
                <p><strong>Location:</strong> {bloodGroupData.location}</p>
                <p><strong>Quantity Needed:</strong> {bloodGroupData.quantity || 1} units</p>
                <p><strong>Urgency:</strong> {bloodGroupData.urgency}</p>
                {bloodGroupData.notes && <p><strong>Notes:</strong> {bloodGroupData.notes}</p>}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
