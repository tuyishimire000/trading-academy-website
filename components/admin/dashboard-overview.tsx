"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  BookOpen,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  BarChart3,
  Globe,
  Clock,
  ExternalLink,
  RefreshCw,
  Eye,
  MessageSquare,
  Award,
  Target,
  AlertCircle
} from "lucide-react"
import { TradingViewChart } from "./tradingview-chart"

interface DashboardStats {
  totalUsers: number
  activeSubscriptions: number
  totalCourses: number
  upcomingEvents: number
  recentSignups: number
  totalRevenue: number
  averageProgress: number
  totalPosts: number
  subscriptionBreakdown: Record<string, number>
}

interface RecentActivity {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  user?: string
}

interface TradingEvent {
  id: string
  currency: string
  event: string
  impact: string
  time: string
  forecast: string
  previous: string
  actual: string | null
  date: string
}

interface TradingNews {
  id: string
  title: string
  summary: string
  content: string
  source: string
  author: string
  publishedAt: string
  url: string
  category: string
  sentiment: string
  impact: string
}

export function AdminDashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [tradingEvents, setTradingEvents] = useState<TradingEvent[]>([])
  const [tradingNews, setTradingNews] = useState<TradingNews[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      }

      // Fetch recent activities
      const activitiesResponse = await fetch('/api/admin/activities')
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json()
        setRecentActivities(activitiesData.activities || [])
      }

      // Fetch trading calendar
      const calendarResponse = await fetch('/api/admin/trading-calendar')
      if (calendarResponse.ok) {
        const calendarData = await calendarResponse.json()
        setTradingEvents(calendarData.events || [])
      }

      // Fetch trading news
      const newsResponse = await fetch('/api/admin/trading-news')
      if (newsResponse.ok) {
        const newsData = await newsResponse.json()
        setTradingNews(newsData.news || [])
      }

    } catch (error) {
      setError('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'default'
      default: return 'default'
    }
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={fetchDashboardData} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.recentSignups || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">
              ${stats?.totalRevenue || 0} total revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCourses || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.averageProgress || 0}% avg progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.upcomingEvents || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalPosts || 0} forum posts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trading">Trading Calendar</TabsTrigger>
          <TabsTrigger value="news">Market News</TabsTrigger>
          <TabsTrigger value="chart">Live Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.description} • {formatTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">New user registered</p>
                          <p className="text-xs text-muted-foreground">2 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Course completed</p>
                          <p className="text-xs text-muted-foreground">5 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">New subscription</p>
                          <p className="text-xs text-muted-foreground">10 minutes ago</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Subscription Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Subscription Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.subscriptionBreakdown ? (
                    Object.entries(stats.subscriptionBreakdown).map(([plan, count]) => (
                      <div key={plan} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{plan}</span>
                        <Badge variant="secondary">{count} users</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Basic Plan</span>
                        <Badge variant="secondary">15 users</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Premium Plan</span>
                        <Badge variant="secondary">8 users</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Pro Plan</span>
                        <Badge variant="secondary">3 users</Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trading" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Trading Calendar
                <Button variant="outline" size="sm" onClick={fetchDashboardData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tradingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-bold">{event.currency}</div>
                        <div className="text-xs text-muted-foreground">Currency</div>
                      </div>
                      <div>
                        <div className="font-medium">{event.event}</div>
                        <div className="text-sm text-muted-foreground">{event.time}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getImpactColor(event.impact)}>{event.impact}</Badge>
                      <div className="text-sm mt-1">
                        <span className="text-muted-foreground">Forecast: </span>
                        <span className="font-medium">{event.forecast}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Previous: </span>
                        <span className="font-medium">{event.previous}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="news" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Latest Market News
                <Button variant="outline" size="sm" onClick={fetchDashboardData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {tradingNews.map((news) => (
                  <div key={news.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium mb-2">{news.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{news.summary}</p>
                                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                           <span>{news.source}</span>
                           <span>{news.author}</span>
                           <span>{formatTime(news.publishedAt)}</span>
                           <Badge variant={news.sentiment === 'positive' ? 'default' : news.sentiment === 'negative' ? 'destructive' : 'secondary'}>
                             {news.sentiment}
                           </Badge>
                         </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="space-y-6">
          <TradingViewChart />
        </TabsContent>
      </Tabs>
    </div>
  )
}
