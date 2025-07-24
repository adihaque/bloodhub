"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface User {
  id: string
  name: string
  phone: string
  bloodGroup: string
  role: "donor" | "recipient" | "hospital" | "admin"
  location: {
    lat: number
    lng: number
    address: string
  }
  isVerified: boolean
  lastDonation?: string
  healthStatus?: "good" | "monitor" | "suspended"
}

interface AppContextType {
  user: User | null
  setUser: (user: User | null) => void
  emergencyMode: boolean
  setEmergencyMode: (mode: boolean) => void
  currentIncident: string | null
  setCurrentIncident: (incident: string | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [currentIncident, setCurrentIncident] = useState<string | null>("Milestone Jet Crash tragedy: Diabari, Uttara")

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        emergencyMode,
        setEmergencyMode,
        currentIncident,
        setCurrentIncident,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within a Providers")
  }
  return context
}
