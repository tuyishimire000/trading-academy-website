"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Users, 
  MessageCircle, 
  Settings, 
  Shield, 
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Hash,
  ExternalLink
} from "lucide-react"

// Interfaces
interface DiscordSettings {
  serverUrl: string
  serverName: string
  inviteCode: string
  isActive: boolean
  memberCount: number
  onlineCount: number
  channels: Array<{ name: string; memberCount: number }>
}

interface ForumCategory {
  id: string
  name: string
  slug: string
  description: string
  color: string
  is_active: boolean
  post_count: number
  created_at: string
  updated_at: string
}

interface UserSuspension {
  id: string
  first_name: string
  last_name: string
  email: string
  forum_suspended: boolean
  suspension_reason: string | null
  suspended_at: string | null
  created_at: string
  recent_posts: number
  negative_score: number
  risk_level: 'low' | 'medium' | 'high'
}

export function CommunityManagement() {
  const [activeTab, setActiveTab] = useState("overview")
  const [discordSettings, setDiscordSettings] = useState<DiscordSettings | null>(null)
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [suspendedUsers, setSuspendedUsers] = useState<UserSuspension[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [discordDialogOpen, setDiscordDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [suspensionDialogOpen, setSuspensionDialogOpen] = useState(false)

  // Form states
  const [discordForm, setDiscordForm] = useState({
    serverUrl: "",
    serverName: "",
    inviteCode: "",
    isActive: true
  })
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
    is_active: true
  })
  const [suspensionForm, setSuspensionForm] = useState({
    reason: "",
    duration: "1_week"
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [discordRes, categoriesRes, suspensionsRes] = await Promise.all([
        fetch("/api/admin/discord"),
        fetch("/api/admin/forum-categories"),
        fetch("/api/admin/user-suspensions")
      ])

      if (discordRes.ok) {
        const discordData = await discordRes.json()
        setDiscordSettings(discordData)
        setDiscordForm({
          serverUrl: discordData.serverUrl,
          serverName: discordData.serverName,
          inviteCode: discordData.inviteCode,
          isActive: discordData.isActive
        })
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData)
      }

      if (suspensionsRes.ok) {
        const suspensionsData = await suspensionsRes.json()
        setSuspendedUsers(suspensionsData.users)
      }
    } catch (error) {
      console.error("Error fetching community data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDiscordUpdate = async () => {
    try {
      const response = await fetch("/api/admin/discord", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordForm)
      })

      if (response.ok) {
        const data = await response.json()
        setDiscordSettings(data.settings)
        setDiscordDialogOpen(false)
      }
    } catch (error) {
      console.error("Error updating Discord settings:", error)
    }
  }

  const handleCategoryCreate = async () => {
    try {
      const response = await fetch("/api/admin/forum-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm)
      })

      if (response.ok) {
        await fetchAllData()
        setCategoryDialogOpen(false)
        setCategoryForm({ name: "", description: "", color: "#3b82f6", is_active: true })
      }
    } catch (error) {
      console.error("Error creating category:", error)
    }
  }

  const handleCategoryDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const response = await fetch(`/api/admin/forum-categories?id=${categoryId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        await fetchAllData()
      }
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="discord">Discord</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="suspensions">User Management</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{discordSettings?.memberCount || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Online Now</CardTitle>
                <MessageCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{discordSettings?.onlineCount || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Forum Categories</CardTitle>
                <Hash className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suspended Users</CardTitle>
                <Shield className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {suspendedUsers.filter(u => u.forum_suspended).length}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Discord Channels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {discordSettings?.channels.map((channel, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">#{channel.name}</span>
                      </div>
                      <Badge variant="outline">{channel.memberCount} members</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  High Risk Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suspendedUsers
                    .filter(user => user.risk_level === 'high')
                    .slice(0, 5)
                    .map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.recent_posts} recent posts
                          </p>
                        </div>
                        <Badge className={getRiskLevelColor(user.risk_level)}>
                          {user.risk_level}
                        </Badge>
                      </div>
                    ))}
                  {suspendedUsers.filter(user => user.risk_level === 'high').length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No high-risk users detected
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Discord Tab */}
        <TabsContent value="discord" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Discord Server Settings</span>
                <Button onClick={() => setDiscordDialogOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Settings
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Server Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {discordSettings?.serverName}</p>
                    <p><strong>URL:</strong> {discordSettings?.serverUrl}</p>
                    <p><strong>Invite Code:</strong> {discordSettings?.inviteCode}</p>
                    <p><strong>Status:</strong> 
                      <Badge variant={discordSettings?.isActive ? "default" : "secondary"} className="ml-2">
                        {discordSettings?.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Total Members:</strong> {discordSettings?.memberCount}</p>
                    <p><strong>Online Now:</strong> {discordSettings?.onlineCount}</p>
                    <p><strong>Active Channels:</strong> {discordSettings?.channels.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Forum Categories</h3>
            <Button onClick={() => setCategoryDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell>{category.post_count}</TableCell>
                      <TableCell>
                        <Badge variant={category.is_active ? "default" : "secondary"}>
                          {category.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCategoryDelete(category.id)}
                            disabled={category.post_count > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Suspensions Tab */}
        <TabsContent value="suspensions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">User Management</h3>
            <div className="flex gap-2">
              <Badge variant="outline">
                {suspendedUsers.filter(u => u.forum_suspended).length} Suspended
              </Badge>
              <Badge variant="outline">
                {suspendedUsers.filter(u => u.risk_level === 'high').length} High Risk
              </Badge>
            </div>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Recent Posts</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suspendedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{user.recent_posts}</TableCell>
                      <TableCell>
                        <Badge className={getRiskLevelColor(user.risk_level)}>
                          {user.risk_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.forum_suspended ? (
                          <Badge variant="destructive">Suspended</Badge>
                        ) : (
                          <Badge variant="default">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {user.forum_suspended ? (
                            <Button variant="outline" size="sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Unsuspend
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm">
                              <Ban className="h-4 w-4 mr-1" />
                              Suspend
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Discord Settings Dialog */}
      <Dialog open={discordDialogOpen} onOpenChange={setDiscordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discord Server Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Server Name</label>
              <Input
                value={discordForm.serverName}
                onChange={(e) => setDiscordForm({ ...discordForm, serverName: e.target.value })}
                placeholder="Trading Academy Community"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Server URL</label>
              <Input
                value={discordForm.serverUrl}
                onChange={(e) => setDiscordForm({ ...discordForm, serverUrl: e.target.value })}
                placeholder="https://discord.gg/..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Invite Code</label>
              <Input
                value={discordForm.inviteCode}
                onChange={(e) => setDiscordForm({ ...discordForm, inviteCode: e.target.value })}
                placeholder="tradingacademy"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={discordForm.isActive}
                onCheckedChange={(checked) => setDiscordForm({ ...discordForm, isActive: checked })}
              />
              <label className="text-sm font-medium">Server Active</label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDiscordDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleDiscordUpdate}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Category name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Category description"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <Input
                type="color"
                value={categoryForm.color}
                onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={categoryForm.is_active}
                onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, is_active: checked })}
              />
              <label className="text-sm font-medium">Active</label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCategoryCreate}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
