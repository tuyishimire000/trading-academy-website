"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Settings, CreditCard, MessageSquare, Mail, Shield, Save } from "lucide-react"

interface SettingsData {
  general: {
    siteName: string
    siteDescription: string
    maintenanceMode: boolean
    registrationEnabled: boolean
  }
  subscription: {
    stripePublishableKey: string
    trialPeriodDays: number
    allowCancellation: boolean
    prorationEnabled: boolean
  }
  discord: {
    botToken: string
    guildId: string
    welcomeChannelId: string
    autoRoleEnabled: boolean
  }
  email: {
    provider: string
    fromEmail: string
    fromName: string
    smtpHost: string
    smtpPort: number
  }
  security: {
    passwordMinLength: number
    requireSpecialChars: boolean
    sessionTimeoutMinutes: number
    maxLoginAttempts: number
  }
}

export function SettingsManagement() {
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings")
        const data = await response.json()

        if (response.ok) {
          setSettings(data.settings)
        } else {
          console.error("Failed to fetch settings:", data.error)
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async (category: string, categorySettings: any) => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, settings: categorySettings }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Settings saved",
          description: data.message,
        })
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (category: keyof SettingsData, field: string, value: any) => {
    if (!settings) return

    setSettings((prev) => ({
      ...prev!,
      [category]: {
        ...prev![category],
        [field]: value,
      },
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Failed to load settings</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="discord" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Discord
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.general.siteName}
                  onChange={(e) => updateSettings("general", "siteName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e) => updateSettings("general", "siteDescription", e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Temporarily disable access to the site</p>
                </div>
                <Switch
                  checked={settings.general.maintenanceMode}
                  onCheckedChange={(checked) => updateSettings("general", "maintenanceMode", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Registration Enabled</Label>
                  <p className="text-sm text-muted-foreground">Allow new users to register</p>
                </div>
                <Switch
                  checked={settings.general.registrationEnabled}
                  onCheckedChange={(checked) => updateSettings("general", "registrationEnabled", checked)}
                />
              </div>

              <Button onClick={() => handleSave("general", settings.general)} disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save General Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Settings */}
        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Subscription & Billing Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripeKey">Stripe Publishable Key</Label>
                <Input
                  id="stripeKey"
                  type="password"
                  value={settings.subscription.stripePublishableKey}
                  onChange={(e) => updateSettings("subscription", "stripePublishableKey", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trialDays">Trial Period (Days)</Label>
                <Input
                  id="trialDays"
                  type="number"
                  value={settings.subscription.trialPeriodDays}
                  onChange={(e) => updateSettings("subscription", "trialPeriodDays", Number.parseInt(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Cancellation</Label>
                  <p className="text-sm text-muted-foreground">Let users cancel their subscriptions</p>
                </div>
                <Switch
                  checked={settings.subscription.allowCancellation}
                  onCheckedChange={(checked) => updateSettings("subscription", "allowCancellation", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Proration Enabled</Label>
                  <p className="text-sm text-muted-foreground">Prorate charges when upgrading/downgrading</p>
                </div>
                <Switch
                  checked={settings.subscription.prorationEnabled}
                  onCheckedChange={(checked) => updateSettings("subscription", "prorationEnabled", checked)}
                />
              </div>

              <Button
                onClick={() => handleSave("subscription", settings.subscription)}
                disabled={saving}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Billing Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discord Settings */}
        <TabsContent value="discord">
          <Card>
            <CardHeader>
              <CardTitle>Discord Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="botToken">Bot Token</Label>
                <Input
                  id="botToken"
                  type="password"
                  value={settings.discord.botToken}
                  onChange={(e) => updateSettings("discord", "botToken", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guildId">Guild ID</Label>
                <Input
                  id="guildId"
                  value={settings.discord.guildId}
                  onChange={(e) => updateSettings("discord", "guildId", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcomeChannel">Welcome Channel ID</Label>
                <Input
                  id="welcomeChannel"
                  value={settings.discord.welcomeChannelId}
                  onChange={(e) => updateSettings("discord", "welcomeChannelId", e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Role Assignment</Label>
                  <p className="text-sm text-muted-foreground">Automatically assign roles to new members</p>
                </div>
                <Switch
                  checked={settings.discord.autoRoleEnabled}
                  onCheckedChange={(checked) => updateSettings("discord", "autoRoleEnabled", checked)}
                />
              </div>

              <Button onClick={() => handleSave("discord", settings.discord)} disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Discord Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailProvider">Email Provider</Label>
                <Input
                  id="emailProvider"
                  value={settings.email.provider}
                  onChange={(e) => updateSettings("email", "provider", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={settings.email.fromEmail}
                  onChange={(e) => updateSettings("email", "fromEmail", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={settings.email.fromName}
                  onChange={(e) => updateSettings("email", "fromName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  value={settings.email.smtpHost}
                  onChange={(e) => updateSettings("email", "smtpHost", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={settings.email.smtpPort}
                  onChange={(e) => updateSettings("email", "smtpPort", Number.parseInt(e.target.value))}
                />
              </div>

              <Button onClick={() => handleSave("email", settings.email)} disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Email Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passwordLength">Minimum Password Length</Label>
                <Input
                  id="passwordLength"
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => updateSettings("security", "passwordMinLength", Number.parseInt(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Special Characters</Label>
                  <p className="text-sm text-muted-foreground">Passwords must contain special characters</p>
                </div>
                <Switch
                  checked={settings.security.requireSpecialChars}
                  onCheckedChange={(checked) => updateSettings("security", "requireSpecialChars", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (Minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.security.sessionTimeoutMinutes}
                  onChange={(e) => updateSettings("security", "sessionTimeoutMinutes", Number.parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => updateSettings("security", "maxLoginAttempts", Number.parseInt(e.target.value))}
                />
              </div>

              <Button onClick={() => handleSave("security", settings.security)} disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Security Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
