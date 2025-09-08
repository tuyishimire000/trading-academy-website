"use client"

// Force dynamic rendering to prevent static generation
export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { Suspense } from "react"
import { useRouter } from "next/navigation"
import { CardDescription } from "@/components/ui/card"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { CourseProgress } from "@/components/dashboard/course-progress"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"
import { UserHeader } from "@/components/dashboard/user-header"
import { NotificationCenter } from "@/components/notifications/notification-center"

import Portfolio from "@/components/portfolio/multi-wallet-portfolio"
import { SubscriptionPlanDisplay } from "@/components/dashboard/subscription-plan-display"
import { PartnershipProgram } from "@/components/dashboard/partnership-program"
import { CoursesContent } from "@/components/dashboard/courses-content"
import { ShowcaseStories } from "@/components/dashboard/showcase-stories"
import { SocialMediaLinks } from "@/components/dashboard/social-media-links"
import { BillingContent } from "@/components/dashboard/billing-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AchievementsPage } from "@/components/achievements/achievements-page"
import { UserSettings } from "@/components/dashboard/user-settings"
import { ResourcesPage } from "@/components/dashboard/resources-page"
import { TradingJournal } from "@/components/dashboard/trading-journal"
import { 
  MessageCircle, 
  Loader2, 
  Bell, 
  Home,
  BookOpen,
  MessageSquare,
  Calendar,
  Settings,
  Target,
  TrendingUp,
  Award,
  FileText,
  Video,
  Headphones,
  Star,
  Handshake,
  Share2,
  Users2,
  CreditCard
} from "lucide-react"

function DashboardPageContent() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
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
      description: 'Your learning progress'
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: TrendingUp,
      description: 'Trading portfolio & analytics'
    },
    {
      id: 'trading-tools',
      label: 'Trading Tools',
      icon: Target,
      description: 'Trading journal & tools'
    },
    {
      id: 'community',
      label: 'Community',
      icon: MessageSquare,
      description: 'Connect with traders',
      badge: 'New',
      href: '/community'
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
      id: 'partnership',
      label: 'Partnership Program',
      icon: Handshake,
      description: 'Referral & promotion programs',
      badge: 'Earn'
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: CreditCard,
      description: 'Payment history & invoices'
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
                <CourseProgress 
                  onViewAllCourses={() => setActiveSection('courses')} 
                  onCourseClick={(course) => {
                    setSelectedCourseId(course.id)
                    setActiveSection('courses')
                  }}
                />
                <ShowcaseStories />
                <SocialMediaLinks />
              </div>
              <div className="space-y-6">
                <SubscriptionPlanDisplay />
                <UpcomingEvents />
              </div>
            </div>
          </div>
        )

      case 'courses':
        return (
          <CoursesContent 
            initialSelectedCourseId={selectedCourseId}
            onCourseSelected={setSelectedCourseId}
          />
        )

              case 'portfolio':
          return <Portfolio />

      case 'trading-tools':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trading Tools</h1>
                <p className="text-gray-600">Professional tools to enhance your trading</p>
              </div>
            </div>
            
            {/* Trading Journal Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Trading Journal</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/trading-journal')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Open Journal
                </Button>
              </div>
              
              {/* Trading Journal Preview Card */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/trading-journal')}>
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Trading Journal</h3>
                  <p className="text-sm text-gray-600">Track your trades and analyze performance</p>
                  <Button className="mt-4 w-full" variant="outline">
                    Open Journal
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Other Trading Tools */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Additional Trading Tools</h2>
              <Button variant="outline" size="sm">
                <Target className="h-4 w-4 mr-2" />
                View All Tools
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/risk-calculator')}>
                <CardContent className="p-6 text-center">
                  <Target className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Risk Calculator</h3>
                  <p className="text-sm text-gray-600">Calculate position sizing</p>
                  <Button className="mt-4 w-full" variant="outline">
                    Calculate Risk
                  </Button>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/market-scanner')}>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Market Scanner</h3>
                  <p className="text-sm text-gray-600">Find trading opportunities</p>
                  <Button className="mt-4 w-full" variant="outline" onClick={(e) => { e.stopPropagation(); router.push('/market-scanner') }}>
                    Scan Markets
                  </Button>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/market-calendar')}>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Economic Calendar</h3>
                  <p className="text-sm text-gray-600">Track market events</p>
                  <Button className="mt-4 w-full" variant="outline" onClick={(e) => { e.stopPropagation(); router.push('/market-calendar') }}>
                    View Calendar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )



      case 'events':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Events & Webinars</h1>
                <p className="text-gray-600">Join live trading sessions and workshops</p>
              </div>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                View All Events
              </Button>
            </div>
            <UpcomingEvents />
          </div>
        )

      case 'achievements':
        return (
          <AchievementsPage />
        )

      case 'partnership':
        return <PartnershipProgram />

      case 'billing':
        return <BillingContent />

      case 'settings':
        return <UserSettings />

      case 'resources':
        return <ResourcesPage />

      default:
        return null
    }
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
        <UserHeader />
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Sidebar */}
        <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 flex-shrink-0 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
            {!sidebarCollapsed && (
              <div className="flex items-center">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-3">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Trading Academy</h2>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg
                className={`h-4 w-4 text-gray-600 dark:text-gray-300 transition-transform ${
                  sidebarCollapsed ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </div>
          
          {/* Scrollable Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.href) {
                          router.push(item.href)
                        } else {
                          setActiveSection(item.id)
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                        isActive 
                          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700' 
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center">
                        <Icon className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'} ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`} />
                        {!sidebarCollapsed && (
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                          </div>
                        )}
                      </div>
                      {!sidebarCollapsed && item.badge && (
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
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>

      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading Dashboard...</h2>
        </div>
      </div>
    }>
      <DashboardPageContent />
    </Suspense>
  )
}
