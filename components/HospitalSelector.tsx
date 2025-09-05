"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MapPin, Search, Navigation } from "lucide-react"

interface Hospital {
  name: string
  address: string
  coordinates: { lat: number; lng: number }
  placeId?: string
}

interface HospitalSelectorProps {
  onHospitalSelect: (hospital: Hospital) => void
  selectedHospital?: Hospital | null
  className?: string
}

export function HospitalSelector({ onHospitalSelect, selectedHospital, className = "" }: HospitalSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Get user location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }, [])

  // Mock hospital data for Bangladesh (in a real app, this would come from Google Places API)
  const mockHospitals: Hospital[] = [
    {
      name: "Dhaka Medical College Hospital",
      address: "Bakshibazar, Dhaka 1000, Bangladesh",
      coordinates: { lat: 23.7257, lng: 90.3974 }
    },
    {
      name: "Bangabandhu Sheikh Mujib Medical University",
      address: "Shahbag, Dhaka 1000, Bangladesh", 
      coordinates: { lat: 23.7394, lng: 90.3958 }
    },
    {
      name: "Sir Salimullah Medical College Hospital",
      address: "Mitford, Dhaka 1100, Bangladesh",
      coordinates: { lat: 23.7104, lng: 90.4074 }
    },
    {
      name: "National Institute of Cardiovascular Diseases",
      address: "Sher-E-Bangla Nagar, Dhaka 1207, Bangladesh",
      coordinates: { lat: 23.7679, lng: 90.3568 }
    },
    {
      name: "Holy Family Red Crescent Medical College Hospital",
      address: "Eskaton Garden Rd, Dhaka 1000, Bangladesh",
      coordinates: { lat: 23.7465, lng: 90.4072 }
    },
    {
      name: "Square Hospitals Ltd.",
      address: "West Panthapath, Dhaka 1205, Bangladesh",
      coordinates: { lat: 23.7516, lng: 90.3740 }
    },
    {
      name: "United Hospital Limited",
      address: "Plot 15, Road 71, Gulshan 2, Dhaka 1212, Bangladesh",
      coordinates: { lat: 23.7925, lng: 90.4078 }
    },
    {
      name: "Apollo Hospitals Dhaka",
      address: "Plot 81, Block E, Bashundhara R/A, Dhaka 1229, Bangladesh",
      coordinates: { lat: 23.8103, lng: 90.4125 }
    },
    {
      name: "Chittagong Medical College Hospital",
      address: "K.B. Fazlul Kader Road, Chittagong 4203, Bangladesh",
      coordinates: { lat: 22.3569, lng: 91.7832 }
    },
    {
      name: "Rajshahi Medical College Hospital",
      address: "Laxmipur, Rajshahi 6000, Bangladesh",
      coordinates: { lat: 24.3745, lng: 88.6042 }
    }
  ]

  const searchHospitals = async (query: string) => {
    if (!query.trim()) {
      setHospitals([])
      setShowResults(false)
      return
    }

    setIsLoading(true)
    
    // Simulate API delay
    setTimeout(() => {
      const filteredHospitals = mockHospitals.filter(hospital =>
        hospital.name.toLowerCase().includes(query.toLowerCase()) ||
        hospital.address.toLowerCase().includes(query.toLowerCase())
      )
      
      // Sort by distance if user location is available
      if (userLocation) {
        filteredHospitals.sort((a, b) => {
          const distanceA = calculateDistance(userLocation, a.coordinates)
          const distanceB = calculateDistance(userLocation, b.coordinates)
          return distanceA - distanceB
        })
      }
      
      setHospitals(filteredHospitals)
      setShowResults(true)
      setIsLoading(false)
    }, 500)
  }

  const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180
    const dLng = (point2.lng - point1.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const handleHospitalSelect = (hospital: Hospital) => {
    onHospitalSelect(hospital)
    setSearchQuery(hospital.name)
    setShowResults(false)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    searchHospitals(query)
  }

  const openInMaps = (hospital: Hospital) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ' ' + hospital.address)}`
    window.open(url, '_blank')
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="hospital-search">Select Hospital</Label>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            id="hospital-search"
            type="text"
            placeholder="Search for hospitals..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        
        {showResults && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 text-center text-muted-foreground">
                Searching hospitals...
              </div>
            ) : hospitals.length > 0 ? (
              hospitals.map((hospital, index) => (
                <div
                  key={index}
                  className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                  onClick={() => handleHospitalSelect(hospital)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{hospital.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{hospital.address}</p>
                      {userLocation && (
                        <p className="text-xs text-primary mt-1">
                          {calculateDistance(userLocation, hospital.coordinates).toFixed(1)} km away
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        openInMaps(hospital)
                      }}
                      className="ml-2 p-1 h-auto"
                    >
                      <Navigation className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-muted-foreground">
                No hospitals found. Try a different search term.
              </div>
            )}
          </div>
        )}
      </div>
      
      {selectedHospital && (
        <div className="mt-3 p-3 bg-muted rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-sm">{selectedHospital.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">{selectedHospital.address}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => openInMaps(selectedHospital)}
              className="ml-2"
            >
              <MapPin className="h-3 w-3 mr-1" />
              View on Map
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
