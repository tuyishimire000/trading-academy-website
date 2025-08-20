"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CardDescription } from "@/components/ui/card"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { CourseProgress } from "@/components/dashboard/course-progress"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"
import { UserHeader } from "@/components/dashboard/user-header"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { ForumChat } from "@/components/community/forum-chat"
import { PortfolioTracker } from "@/components/portfolio/portfolio-tracker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MessageCircle, 
  Users, 
  Loader2, 
  Bell, 
  Home,
  BookOpen,
  BarChart3,
  MessageSquare,
  Calendar,
  Settings,
  Target,
  TrendingUp,
  Award,
  FileText,
  Video,
  Headphones,
  Star
} from "lucide-react"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const checkAuthAndSubscription = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const json = await res.json()
          setUser(json.user)
          
          // Check subscription status
          const subscriptionRes = await fetch("/api/user/subscription")
          if (subscriptionRes.ok) {
            const subscriptionData = await subscriptionRes.json()
            const subscription = subscriptionData.subscription
            
            // If no subscription or subscription is pending, redirect to subscription page
            if (!subscription || subscription.status === 'pending') {
              router.push("/subscription")
              return
            }
          } else {
            // If there's an error checking subscription, redirect to subscription page
            router.push("/subscription")
            return
          }
        } else {
          router.push("/login")
        }
      } catch (error) {
        router.push("/login")
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    checkAuthAndSubscription()

    return () => {
      mounted = false
    }
  }, [router])

  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      description: 'Dashboard overview and stats'
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: BookOpen,
      description: 'Your learning progress',
      badge: '3 Active'
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: BarChart3,
      description: 'Trading portfolio & analytics'
    },
    {
      id: 'community',
      label: 'Community',
      icon: MessageSquare,
      description: 'Connect with traders',
      badge: 'New'
    },
    {
      id: 'events',
      label: 'Events',
      icon: Calendar,
      description: 'Live sessions & webinars'
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: Award,
      description: 'Your accomplishments'
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: FileText,
      description: 'Trading materials'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Account preferences'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to access the dashboard</p>
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome back, {user?.first_name || 'Trader'}!</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotifications(true)}
                className="relative"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </Button>
            </div>

            <StatsCards />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <CourseProgress />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Latest Content</CardTitle>
                    <CardDescription>New materials added this week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">New content is added regularly</p>
                      <Button className="bg-[#5865F2] hover:bg-[#4752C4]">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Join Discord
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <UpcomingEvents />
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Community Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <Users className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-4">
                        Join our Discord community to see the latest discussions.
                      </p>
                      <Button className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Join Discord Server
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      case 'courses':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
                <p className="text-gray-600">Track your learning progress</p>
              </div>
              <Button>
                <BookOpen className="h-4 w-4 mr-2" />
                Browse All Courses
              </Button>
            </div>
            <CourseProgress />
          </div>
        )

      case 'portfolio':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Portfolio Tracker</h1>
                <p className="text-gray-600">Monitor your trading performance</p>
              </div>
              <Button>
                <BarChart3 className="h-4 w-4 mr-2" />
                Add Trade
              </Button>
            </div>
            <PortfolioTracker />
          </div>
        )

      case 'community':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Community Forum</h1>
                <p className="text-gray-600">Connect with fellow traders</p>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                1,247 members online
              </Badge>
            </div>
            <ForumChat
              currentUser={{
                id: user?.id || '1',
                name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'User',
                role: 'member',
                joinDate: new Date(),
                postsCount: 0,
                reputation: 0
              }}
            />
          </div>
        )

      case 'events':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Events & Webinars</h1>
                <p className="text-gray-600">Join live trading sessions</p>
              </div>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
            </div>
            <UpcomingEvents />
          </div>
        )

      case 'achievements':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
                <p className="text-gray-600">Your trading accomplishments</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">First Course Completed</h3>
                  <p className="text-sm text-gray-600">Completed your first trading course</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Consistent Learner</h3>
                  <p className="text-sm text-gray-600">7 days of consecutive learning</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Portfolio Growth</h3>
                  <p className="text-sm text-gray-600">Achieved 10% portfolio growth</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'resources':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trading Resources</h1>
                <p className="text-gray-600">Access learning materials and tools</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Video className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Video Library</h3>
                  <p className="text-sm text-gray-600">Access to 500+ trading videos</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">E-Books</h3>
                  <p className="text-sm text-gray-600">Comprehensive trading guides</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Headphones className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Podcasts</h3>
                  <p className="text-sm text-gray-600">Weekly trading insights</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage your account preferences</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-sm text-gray-600">{user?.first_name} {user?.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Notifications</span>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Push Notifications</span>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-3">
                <Star className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold">Trading Academy</h2>
            </div>
            
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-amber-600' : 'text-gray-500'}`} />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </div>
                    {item.badge && (
                      <Badge 
                        variant={isActive ? "default" : "secondary"} 
                        className="text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>

      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  )
}
