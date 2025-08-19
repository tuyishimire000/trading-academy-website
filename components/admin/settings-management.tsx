"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { 
  Settings, 
  User, 
  Palette, 
  Layout, 
  Save, 
  Eye, 
  EyeOff,
  Upload,
  Image,
  Type,
  Move,
  Lock
} from "lucide-react"

interface AdminProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  is_admin: boolean
}

interface WebsiteSettings {
  branding: {
    websiteName: string
    logo: string
    favicon: string
    tagline: string
  }
  landingPage: {
    theme: {
      primaryColor: string
      secondaryColor: string
      accentColor: string
      backgroundColor: string
      textColor: string
    }
    layout: {
      hero: { order: number; visible: boolean }
      features: { order: number; visible: boolean }
      testimonials: { order: number; visible: boolean }
      pricing: { order: number; visible: boolean }
      about: { order: number; visible: boolean }
      contact: { order: number; visible: boolean }
    }
    content: {
      hero: {
        title: string
        subtitle: string
        ctaText: string
        ctaLink: string
      }
      features: {
        title: string
        subtitle: string
      }
      testimonials: {
        title: string
        subtitle: string
      }
      pricing: {
        title: string
        subtitle: string
      }
      about: {
        title: string
        subtitle: string
      }
      contact: {
        title: string
        subtitle: string
      }
    }
  }
}

export function SettingsManagement() {
  const [activeTab, setActiveTab] = useState("profile")
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const { toast } = useToast()

  // Form states
  const [profileForm, setProfileForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [brandingForm, setBrandingForm] = useState({
    websiteName: "",
    logo: "",
    favicon: "",
    tagline: ""
  })

  const [themeForm, setThemeForm] = useState({
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af",
    accentColor: "#f59e0b",
    backgroundColor: "#ffffff",
    textColor: "#1f2937"
  })

  const [layoutForm, setLayoutForm] = useState({
    hero: { order: 1, visible: true },
    features: { order: 2, visible: true },
    testimonials: { order: 3, visible: true },
    pricing: { order: 4, visible: true },
    about: { order: 5, visible: true },
    contact: { order: 6, visible: true }
  })

  const [contentForm, setContentForm] = useState({
    hero: {
      title: "",
      subtitle: "",
      ctaText: "",
      ctaLink: ""
    },
    features: {
      title: "",
      subtitle: ""
    },
    testimonials: {
      title: "",
      subtitle: ""
    },
    pricing: {
      title: "",
      subtitle: ""
    },
    about: {
      title: "",
      subtitle: ""
    },
    contact: {
      title: "",
      subtitle: ""
    }
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [profileRes, websiteRes] = await Promise.all([
        fetch("/api/admin/settings/profile"),
        fetch("/api/admin/settings/website")
      ])

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setAdminProfile(profileData)
        setProfileForm({
          email: profileData.email,
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
      }

      if (websiteRes.ok) {
        const websiteData = await websiteRes.json()
        setWebsiteSettings(websiteData)
        setBrandingForm(websiteData.branding)
        setThemeForm(websiteData.landingPage.theme)
        setLayoutForm(websiteData.landingPage.layout)
        setContentForm(websiteData.landingPage.content)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSave = async () => {
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/admin/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: profileForm.email,
          first_name: profileForm.first_name,
          last_name: profileForm.last_name,
          currentPassword: profileForm.currentPassword,
          newPassword: profileForm.newPassword
        }),
      })

      const data = await response.json()

             if (response.ok) {
         toast({
           title: "Success! ✨",
           description: data.message,
         })
        setProfileForm(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }))
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
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleWebsiteSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/settings/website", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branding: brandingForm,
          landingPage: {
            theme: themeForm,
            layout: layoutForm,
            content: contentForm
          }
        }),
      })

      const data = await response.json()

             if (response.ok) {
         toast({
           title: "Success! ✨",
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
        description: "Failed to save website settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const moveSection = (section: string, direction: 'up' | 'down') => {
    const sections = Object.keys(layoutForm)
    const currentIndex = sections.indexOf(section)
    
    if (direction === 'up' && currentIndex > 0) {
      const newOrder = { ...layoutForm }
      const temp = newOrder[sections[currentIndex]].order
      newOrder[sections[currentIndex]].order = newOrder[sections[currentIndex - 1]].order
      newOrder[sections[currentIndex - 1]].order = temp
      setLayoutForm(newOrder)
    } else if (direction === 'down' && currentIndex < sections.length - 1) {
      const newOrder = { ...layoutForm }
      const temp = newOrder[sections[currentIndex]].order
      newOrder[sections[currentIndex]].order = newOrder[sections[currentIndex + 1]].order
      newOrder[sections[currentIndex + 1]].order = temp
      setLayoutForm(newOrder)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!adminProfile || !websiteSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Failed to load settings</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Content
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Admin Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={profileForm.currentPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={profileForm.newPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleProfileSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Website Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="websiteName">Website Name</Label>
                <Input
                  id="websiteName"
                  value={brandingForm.websiteName}
                  onChange={(e) => setBrandingForm({ ...brandingForm, websiteName: e.target.value })}
                  placeholder="Trading Academy"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={brandingForm.tagline}
                  onChange={(e) => setBrandingForm({ ...brandingForm, tagline: e.target.value })}
                  placeholder="Master the Art of Trading"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logo"
                      value={brandingForm.logo}
                      onChange={(e) => setBrandingForm({ ...brandingForm, logo: e.target.value })}
                      placeholder="/logo.png"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon">Favicon URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="favicon"
                      value={brandingForm.favicon}
                      onChange={(e) => setBrandingForm({ ...brandingForm, favicon: e.target.value })}
                      placeholder="/favicon.ico"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleWebsiteSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Branding"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Settings */}
        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Landing Page Theme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={themeForm.primaryColor}
                      onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={themeForm.primaryColor}
                      onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={themeForm.secondaryColor}
                      onChange={(e) => setThemeForm({ ...themeForm, secondaryColor: e.target.value })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={themeForm.secondaryColor}
                      onChange={(e) => setThemeForm({ ...themeForm, secondaryColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={themeForm.accentColor}
                      onChange={(e) => setThemeForm({ ...themeForm, accentColor: e.target.value })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={themeForm.accentColor}
                      onChange={(e) => setThemeForm({ ...themeForm, accentColor: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={themeForm.backgroundColor}
                      onChange={(e) => setThemeForm({ ...themeForm, backgroundColor: e.target.value })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={themeForm.backgroundColor}
                      onChange={(e) => setThemeForm({ ...themeForm, backgroundColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={themeForm.textColor}
                    onChange={(e) => setThemeForm({ ...themeForm, textColor: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={themeForm.textColor}
                    onChange={(e) => setThemeForm({ ...themeForm, textColor: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPreviewDialogOpen(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleWebsiteSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Theme"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Settings */}
        <TabsContent value="layout">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Landing Page Layout
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Reorder and configure landing page sections. Header and footer cannot be moved.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {Object.entries(layoutForm).map(([section, config]) => (
                  <div key={section} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="font-medium capitalize">{section}</span>
                        <span className="text-sm text-muted-foreground">Order: {config.order}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={config.visible}
                        onCheckedChange={(checked) => 
                          setLayoutForm(prev => ({
                            ...prev,
                            [section]: { ...prev[section], visible: checked }
                          }))
                        }
                      />
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveSection(section, 'up')}
                          disabled={config.order === 1}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveSection(section, 'down')}
                          disabled={config.order === Object.keys(layoutForm).length}
                        >
                          ↓
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleWebsiteSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Layout"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Settings */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Landing Page Content
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Customize the content and messaging for each section of your landing page.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hero Section Content */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Hero Section</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="heroTitle">Hero Title</Label>
                    <Input
                      id="heroTitle"
                      value={contentForm.hero.title}
                      onChange={(e) => setContentForm(prev => ({
                        ...prev,
                        hero: { ...prev.hero, title: e.target.value }
                      }))}
                      placeholder="Master the Art of Trading"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                    <Input
                      id="heroSubtitle"
                      value={contentForm.hero.subtitle}
                      onChange={(e) => setContentForm(prev => ({
                        ...prev,
                        hero: { ...prev.hero, subtitle: e.target.value }
                      }))}
                      placeholder="Learn from experts and build your trading skills"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="heroCtaText">CTA Button Text</Label>
                    <Input
                      id="heroCtaText"
                      value={contentForm.hero.ctaText}
                      onChange={(e) => setContentForm(prev => ({
                        ...prev,
                        hero: { ...prev.hero, ctaText: e.target.value }
                      }))}
                      placeholder="Get Started"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heroCtaLink">CTA Button Link</Label>
                    <Input
                      id="heroCtaLink"
                      value={contentForm.hero.ctaLink}
                      onChange={(e) => setContentForm(prev => ({
                        ...prev,
                        hero: { ...prev.hero, ctaLink: e.target.value }
                      }))}
                      placeholder="/signup"
                    />
                  </div>
                </div>
              </div>

              {/* About Section Content */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">About Section</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="aboutTitle">About Title</Label>
                    <Input
                      id="aboutTitle"
                      value={contentForm.about.title}
                      onChange={(e) => setContentForm(prev => ({
                        ...prev,
                        about: { ...prev.about, title: e.target.value }
                      }))}
                      placeholder="About Trading Academy"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aboutSubtitle">About Subtitle</Label>
                    <Input
                      id="aboutSubtitle"
                      value={contentForm.about.subtitle}
                      onChange={(e) => setContentForm(prev => ({
                        ...prev,
                        about: { ...prev.about, subtitle: e.target.value }
                      }))}
                      placeholder="Your journey to trading success starts here"
                    />
                  </div>
                </div>
              </div>

              {/* Features Section Content */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Features Section</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="featuresTitle">Features Title</Label>
                    <Input
                      id="featuresTitle"
                      value={contentForm.features.title}
                      onChange={(e) => setContentForm(prev => ({
                        ...prev,
                        features: { ...prev.features, title: e.target.value }
                      }))}
                      placeholder="Why Choose Trading Academy"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="featuresSubtitle">Features Subtitle</Label>
                    <Input
                      id="featuresSubtitle"
                      value={contentForm.features.subtitle}
                      onChange={(e) => setContentForm(prev => ({
                        ...prev,
                        features: { ...prev.features, subtitle: e.target.value }
                      }))}
                      placeholder="Everything you need to succeed in trading"
                    />
                  </div>
                </div>
              </div>

              {/* Testimonials Section Content */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Testimonials Section</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="testimonialsTitle">Testimonials Title</Label>
                    <Input
                      id="testimonialsTitle"
                      value={contentForm.testimonials.title}
                      onChange={(e) => setContentForm(prev => ({
                        ...prev,
                        testimonials: { ...prev.testimonials, title: e.target.value }
                      }))}
                      placeholder="What Our Students Say"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="testimonialsSubtitle">Testimonials Subtitle</Label>
                    <Input
                      id="testimonialsSubtitle"
                      value={contentForm.testimonials.subtitle}
                      onChange={(e) => setContentForm(prev => ({
                        ...prev,
                        testimonials: { ...prev.testimonials, subtitle: e.target.value }
                      }))}
                      placeholder="Success stories from our community"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Section Content */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Section</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactTitle">Contact Title</Label>
                    <Input
                      id="contactTitle"
                      value={contentForm.contact.title}
                      onChange={(e) => setContentForm(prev => ({
                        ...prev,
                        contact: { ...prev.contact, title: e.target.value }
                      }))}
                      placeholder="Get in Touch"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactSubtitle">Contact Subtitle</Label>
                    <Input
                      id="contactSubtitle"
                      value={contentForm.contact.subtitle}
                      onChange={(e) => setContentForm(prev => ({
                        ...prev,
                        contact: { ...prev.contact, subtitle: e.target.value }
                      }))}
                      placeholder="Have questions? We're here to help"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleWebsiteSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Content"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Landing Page Preview</DialogTitle>
          </DialogHeader>
          <div 
            className="p-8 rounded-lg border"
            style={{
              backgroundColor: themeForm.backgroundColor,
              color: themeForm.textColor
            }}
          >
            <div className="text-center space-y-4">
              <h1 
                className="text-4xl font-bold"
                style={{ color: themeForm.primaryColor }}
              >
                {brandingForm.websiteName}
              </h1>
              <p className="text-xl">{brandingForm.tagline}</p>
              <div className="flex gap-4 justify-center">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: themeForm.primaryColor }}
                />
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: themeForm.secondaryColor }}
                />
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: themeForm.accentColor }}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
