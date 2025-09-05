"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc, serverTimestamp, query, orderBy } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { useApp } from "@/components/providers"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const { currentIncident, setCurrentIncident } = useApp()
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [isBusy, setIsBusy] = useState(false)

  // Data
  const [requests, setRequests] = useState<any[]>([])
  const [quickUsers, setQuickUsers] = useState<any[]>([])
  const [incidents, setIncidents] = useState<any[]>([])

  // Incident form state
  const [incidentTitle, setIncidentTitle] = useState("")
  const [incidentDescription, setIncidentDescription] = useState("")
  const [incidentActive, setIncidentActive] = useState(true)

  // Quick user editing state
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editUserName, setEditUserName] = useState("")
  const [editUserBloodGroup, setEditUserBloodGroup] = useState("")
  const [editUserLocation, setEditUserLocation] = useState("")
  const [editUserPhone, setEditUserPhone] = useState("")

  // Incident editing state
  const [editingIncident, setEditingIncident] = useState<string | null>(null)
  const [editIncidentTitle, setEditIncidentTitle] = useState("")
  const [editIncidentDescription, setEditIncidentDescription] = useState("")
  const [editIncidentActive, setEditIncidentActive] = useState(true)

  useEffect(() => {
    const unsubReq = onSnapshot(query(collection(db, 'requests'), orderBy('createdAt', 'desc')), (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    const unsubQuick = onSnapshot(collection(db, 'users'), (snap) => {
      // Show ALL users from Firestore
      setQuickUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    const unsubInc = onSnapshot(query(collection(db, 'incidents'), orderBy('createdAt', 'desc')), (snap) => {
      setIncidents(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => { unsubReq(); unsubQuick(); unsubInc(); }
  }, [])

  const createIncident = async () => {
    setError("")
    setInfo("")
    try {
      if (!incidentTitle.trim()) throw new Error('Title is required')
      await addDoc(collection(db, 'incidents'), {
        title: incidentTitle.trim(),
        description: incidentDescription.trim(),
        active: incidentActive,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      
      // If creating an active incident, set it as current incident
      if (incidentActive) {
        setCurrentIncident(incidentTitle.trim())
      }
      
      setIncidentTitle("")
      setIncidentDescription("")
      setIncidentActive(true)
      setInfo('Incident created')
    } catch (e: any) {
      setError(e.message || 'Failed to create incident')
    }
  }

  const setIncidentStatus = async (id: string, active: boolean) => {
    setError("")
    try {
      await updateDoc(doc(db, 'incidents', id), { active, updatedAt: serverTimestamp() })
      
      // If activating an incident, set it as current incident
      if (active) {
        const incident = incidents.find(inc => inc.id === id)
        if (incident) {
          setCurrentIncident(incident.title)
        }
      } else {
        // If deactivating the current incident, clear it
        const incident = incidents.find(inc => inc.id === id)
        if (incident && currentIncident === incident.title) {
          setCurrentIncident(null)
        }
      }
    } catch (e: any) {
      setError(e.message || 'Failed to update incident')
    }
  }

  const removeIncident = async (id: string) => {
    setError("")
    try {
      await deleteDoc(doc(db, 'incidents', id))
    } catch (e: any) {
      setError(e.message || 'Failed to delete incident')
    }
  }

  const fulfillRequest = async (id: string) => {
    setError("")
    try {
      await updateDoc(doc(db, 'requests', id), { status: 'fulfilled', updatedAt: serverTimestamp() })
      setInfo('Request marked as fulfilled')
    } catch (e: any) {
      setError(e.message || 'Failed to update request')
    }
  }

  const removeRequest = async (id: string) => {
    setError("")
    try {
      await deleteDoc(doc(db, 'requests', id))
    } catch (e: any) {
      setError(e.message || 'Failed to delete request')
    }
  }

  const startEditUser = (user: any) => {
    setEditingUser(user.id)
    setEditUserName(user.name || "")
    setEditUserBloodGroup(user.bloodGroup || "")
    setEditUserLocation(user.location || "")
    setEditUserPhone(user.phone || "")
  }

  const cancelEditUser = () => {
    setEditingUser(null)
    setEditUserName("")
    setEditUserBloodGroup("")
    setEditUserLocation("")
    setEditUserPhone("")
  }

  const saveEditUser = async () => {
    setError("")
    setInfo("")
    if (!editingUser) return
    
    try {
      if (!editUserName.trim()) throw new Error('Name is required')
      if (!editUserBloodGroup.trim()) throw new Error('Blood group is required')
      if (!editUserLocation.trim()) throw new Error('Location is required')
      
      await updateDoc(doc(db, 'users', editingUser), {
        name: editUserName.trim(),
        bloodGroup: editUserBloodGroup.trim(),
        location: editUserLocation.trim(),
        phone: editUserPhone.trim(),
        updatedAt: serverTimestamp(),
      })
      
      setInfo('User updated successfully')
      cancelEditUser()
    } catch (e: any) {
      setError(e.message || 'Failed to update user')
    }
  }

  const deleteUser = async (id: string) => {
    setError("")
    try {
      await deleteDoc(doc(db, 'users', id))
      setInfo('User deleted successfully')
    } catch (e: any) {
      setError(e.message || 'Failed to delete user')
    }
  }

  

  const startEditIncident = (incident: any) => {
    setEditingIncident(incident.id)
    setEditIncidentTitle(incident.title || "")
    setEditIncidentDescription(incident.description || "")
    setEditIncidentActive(incident.active !== false) // Default to true if undefined
  }

  const cancelEditIncident = () => {
    setEditingIncident(null)
    setEditIncidentTitle("")
    setEditIncidentDescription("")
    setEditIncidentActive(true)
  }

  const saveEditIncident = async () => {
    setError("")
    setInfo("")
    if (!editingIncident) return
    
    try {
      if (!editIncidentTitle.trim()) throw new Error('Title is required')
      
      await updateDoc(doc(db, 'incidents', editingIncident), {
        title: editIncidentTitle.trim(),
        description: editIncidentDescription.trim(),
        active: editIncidentActive,
        updatedAt: serverTimestamp(),
      })
      
      setInfo('Incident updated successfully')
      cancelEditIncident()
    } catch (e: any) {
      setError(e.message || 'Failed to update incident')
    }
  }

  const clearAllIncidents = async () => {
    setError("")
    setInfo("")
    try {
      // Set current incident to null in global context
      setCurrentIncident(null)
      
      // Deactivate all incidents in Firestore
      const activeIncidents = incidents.filter(inc => inc.active)
      for (const incident of activeIncidents) {
        await updateDoc(doc(db, 'incidents', incident.id), { 
          active: false, 
          updatedAt: serverTimestamp() 
        })
      }
      
      setInfo('All incidents cleared - homepage will now show only the inspirational quote')
    } catch (e: any) {
      setError(e.message || 'Failed to clear incidents')
    }
  }

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.replace('/')
  }

  return (
    <div className="min-h-screen p-4 max-w-6xl mx-auto space-y-6">
      {error && (
        <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
      )}
      {info && (
        <Alert><AlertDescription>{info}</AlertDescription></Alert>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Control Center</h1>
        <Button variant="outline" onClick={logout}>Logout</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Incidents">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={incidentTitle} onChange={(e) => setIncidentTitle(e.target.value)} placeholder="e.g., Milestone Crash - Diabari" />
            <Label>Description</Label>
            <Textarea value={incidentDescription} onChange={(e) => setIncidentDescription(e.target.value)} rows={3} placeholder="Details about the incident" />
            <div className="flex gap-2">
              <Button onClick={createIncident}>Create Incident</Button>
              <Button variant="outline" onClick={() => { setIncidentTitle(""); setIncidentDescription(""); setIncidentActive(true) }}>Reset</Button>
              <Button variant="destructive" onClick={clearAllIncidents}>No Incident</Button>
            </div>
          </div>
          <div className="space-y-3 pt-4">
            {incidents.map((inc) => (
              <div key={inc.id} className="p-3 border rounded">
                {editingIncident === inc.id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div className="grid gap-2">
                      <Label>Title</Label>
                      <Input value={editIncidentTitle} onChange={(e) => setEditIncidentTitle(e.target.value)} placeholder="Incident title" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Textarea value={editIncidentDescription} onChange={(e) => setEditIncidentDescription(e.target.value)} rows={3} placeholder="Incident details" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`active-${inc.id}`}
                        checked={editIncidentActive}
                        onCheckedChange={setEditIncidentActive}
                      />
                      <Label htmlFor={`active-${inc.id}`}>Active</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEditIncident}>Save</Button>
                      <Button size="sm" variant="outline" onClick={cancelEditIncident}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="font-semibold">{inc.title}</div>
                      <div className="text-sm text-muted-foreground">{inc.description}</div>
                      <div className="text-xs mt-1">Status: {inc.active ? 'Active' : 'Inactive'}</div>
                      {inc.createdAt && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Created: {inc.createdAt.toDate ? inc.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEditIncident(inc)}>Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => setIncidentStatus(inc.id, !inc.active)}>{inc.active ? 'Deactivate' : 'Activate'}</Button>
                      <Button size="sm" variant="destructive" onClick={() => removeIncident(inc.id)}>Delete</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {incidents.length === 0 && (
              <div className="text-sm text-muted-foreground">No incidents yet.</div>
            )}
          </div>
        </Section>

        <Section title="Requests">
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="p-3 border rounded">
                <div className="font-semibold">{r.bloodGroup} • {r.quantity} units • {r.urgency}</div>
                <div className="text-sm text-muted-foreground">{r.location}</div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => fulfillRequest(r.id)} disabled={r.status === 'fulfilled'}>
                    {r.status === 'fulfilled' ? 'Fulfilled' : 'Mark Fulfilled'}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => removeRequest(r.id)}>Remove</Button>
                </div>
              </div>
            ))}
            {requests.length === 0 && <div className="text-sm text-muted-foreground">No requests found.</div>}
          </div>
        </Section>
      </div>

      <Section title="Users">
        <div className="space-y-3">
          {quickUsers.map((u) => (
            <div key={u.id} className="p-3 border rounded">
              {editingUser === u.id ? (
                // Edit mode
                <div className="space-y-3">
                  <div className="grid gap-2">
                    <Label>Name</Label>
                    <Input value={editUserName} onChange={(e) => setEditUserName(e.target.value)} placeholder="Full name" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Blood Group</Label>
                    <Select value={editUserBloodGroup} onValueChange={setEditUserBloodGroup}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Location</Label>
                    <Input value={editUserLocation} onChange={(e) => setEditUserLocation(e.target.value)} placeholder="City, Area" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone (Optional)</Label>
                    <Input value={editUserPhone} onChange={(e) => setEditUserPhone(e.target.value)} placeholder="Phone number" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEditUser}>Save</Button>
                    <Button size="sm" variant="outline" onClick={cancelEditUser}>Cancel</Button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="font-semibold">{u.name || u.fullName || u.email || u.id} {u.bloodGroup ? `• ${u.bloodGroup}` : ''}</div>
                    <div className="text-sm text-muted-foreground">{u.location}</div>
                    {(u.whatsappNumber || u.phoneNumber || u.phone) && (
                      <div className="text-sm text-muted-foreground">📞 {u.whatsappNumber || u.phoneNumber || u.phone}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEditUser(u)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteUser(u.id)}>Delete</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {quickUsers.length === 0 && <div className="text-sm text-muted-foreground">No users yet.</div>}
        </div>
      </Section>
    </div>
  )
}



