"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Palette, Moon, Sun, Monitor, Bell, Eye, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { auth } from "@/app/firebase/config"
import { onAuthStateChanged } from "firebase/auth"

export default function AppearancePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Appearance settings
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [notifications, setNotifications] = useState(true)
  const [soundEffects, setSoundEffects] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [compactMode, setCompactMode] = useState(false)
  const [showAnimations, setShowAnimations] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Check if user has verified email
        if (!firebaseUser.emailVerified) {
          router.push(`/auth/verify-email?email=${encodeURIComponent(firebaseUser.email || "")}`)
          return
        }
        setUser(firebaseUser)
      } else {
        router.push('/auth/login')
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    // Apply theme changes
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else if (newTheme === "light") {
      document.documentElement.classList.remove("dark")
    } else {
      // System theme - check system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading appearance settings...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Appearance</h1>
              <p className="text-muted-foreground">Customize your app appearance and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Theme Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              Theme & Colors
            </CardTitle>
            <CardDescription>
              Choose your preferred color scheme and theme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose between light, dark, or system theme
                </p>
              </div>
              <Select value={theme} onValueChange={(value: "light" | "dark" | "system") => handleThemeChange(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center">
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center">
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center">
                      <Monitor className="mr-2 h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Animations</Label>
                <p className="text-sm text-muted-foreground">
                  Enable smooth animations and transitions
                </p>
              </div>
              <Switch checked={showAnimations} onCheckedChange={setShowAnimations} />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifications & Alerts
            </CardTitle>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for blood requests and updates
                </p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sound Effects</Label>
                <p className="text-sm text-muted-foreground">
                  Play sounds for notifications and actions
                </p>
              </div>
              <Switch checked={soundEffects} onCheckedChange={setSoundEffects} />
            </div>
          </CardContent>
        </Card>

        {/* Interface Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              Interface Preferences
            </CardTitle>
            <CardDescription>
              Customize how the interface looks and behaves
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compact Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use a more compact layout for better space utilization
                </p>
              </div>
              <Switch checked={compactMode} onCheckedChange={setCompactMode} />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Refresh</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically refresh data every few minutes
                </p>
              </div>
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Control your privacy and security preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Location Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Allow sharing your location for nearby requests
                </p>
              </div>
              <Switch checked={true} disabled />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">
                  Control who can see your profile information
                </p>
              </div>
              <Switch checked={true} disabled />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            onClick={() => {
              // Reset to default settings
              setTheme("system")
              setNotifications(true)
              setSoundEffects(true)
              setAutoRefresh(false)
              setCompactMode(false)
              setShowAnimations(true)
            }}
            variant="outline"
            className="flex-1"
          >
            Reset to Defaults
          </Button>
          <Button 
            onClick={() => router.back()}
            className="flex-1"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}






