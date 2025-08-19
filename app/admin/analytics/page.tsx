"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import {
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  Activity,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  TrendingDown,
  Minus
} from "lucide-react"

interface AnalyticsData {
  overview: {
    totalUsers: number
    newUsersThisMonth: number
    totalCourses: number
    totalModules: number
    totalEvents: number
    totalPosts: number
    totalSubscriptions: number
    activeSubscriptions: number
    totalPortfolioPositions: number
    totalTrades: number
    totalRevenue: string
  }
  userEngagement: {
    averageProgress: string
    totalProgressEntries: number
    activeUsersPercentage: string
  }
  subscriptionPlans: Array<{
    name: string
    displayName: string
    price: number
    subscriberCount: number
  }>
  charts: {
    userGrowth: Array<{
      month: string
      users: number
    }>
    revenueGrowth: Array<{
      month: string
      revenue: number
    }>
    courseParticipation: Array<{
      month: string
      participations: number
      avgProgress: number
    }>
    forumSentiment: Array<{
      month: string
      totalPosts: number
      positive: number
      negative: number
      neutral: number
      sentimentScore: number
    }>
  }
  recentActivity: {
    newUsers: number
    activeSubscriptions: number
    totalPosts: number
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      } else {
        setError('Failed to fetch analytics data')
      }
    } catch (error) {
      setError('Failed to fetch analytics data')
    } finally {
      setLoading(false)
    }
  }

  const getSentimentIcon = (score: number) => {
    if (score > 20) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (score < -20) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  const getSentimentColor = (score: number) => {
    if (score > 20) return 'text-green-600'
    if (score < -20) return 'text-red-600'
    return 'text-gray-600'
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
            <Button variant="outline" size="sm" onClick={fetchAnalyticsData} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analyticsData) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your trading academy performance
          </p>
        </div>
        <Button onClick={fetchAnalyticsData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.overview.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              +{analyticsData.recentActivity.activeSubscriptions} active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{analyticsData.overview.newUsersThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Participation</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.userEngagement.averageProgress}% avg progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Activity</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.overview.totalEvents} upcoming events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Growth</TabsTrigger>
          <TabsTrigger value="users">User Growth</TabsTrigger>
          <TabsTrigger value="participation">Course Participation</TabsTrigger>
          <TabsTrigger value="sentiment">Forum Sentiment</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscription Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Growth (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analyticsData.charts.revenueGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Growth (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData.charts.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#00C49F"
                    strokeWidth={3}
                    dot={{ fill: '#00C49F', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Participation & Progress (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.charts.courseParticipation}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="participations" fill="#8884d8" name="Participations" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgProgress"
                    stroke="#ff7300"
                    name="Avg Progress %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Forum Sentiment Analysis (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sentiment Score Chart */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Sentiment Score Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.charts.forumSentiment}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="sentimentScore"
                        stroke="#ff7300"
                        strokeWidth={3}
                        dot={{ fill: '#ff7300', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Sentiment Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Latest Month Sentiment</h3>
                  <div className="space-y-4">
                    {analyticsData.charts.forumSentiment.slice(-1).map((data, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Overall Sentiment</span>
                          <div className="flex items-center gap-2">
                            {getSentimentIcon(data.sentimentScore)}
                            <span className={`font-semibold ${getSentimentColor(data.sentimentScore)}`}>
                              {data.sentimentScore.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Positive Posts</span>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              {data.positive}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Neutral Posts</span>
                            <Badge variant="secondary">
                              {data.neutral}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Negative Posts</span>
                            <Badge variant="destructive">
                              {data.negative}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Subscription Plan Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.subscriptionPlans}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="subscriberCount"
                      >
                        {analyticsData.subscriptionPlans.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Subscription Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Plan Details</h3>
                  <div className="space-y-3">
                    {analyticsData.subscriptionPlans.map((plan, index) => (
                      <div key={plan.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{plan.displayName}</div>
                          <div className="text-sm text-muted-foreground">${plan.price}/month</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{plan.subscriberCount} subscribers</div>
                          <div className="text-sm text-muted-foreground">
                            ${(plan.price * plan.subscriberCount).toFixed(2)} revenue
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">User Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Active Users</span>
                <span className="font-medium">{analyticsData.userEngagement.activeUsersPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg Progress</span>
                <span className="font-medium">{analyticsData.userEngagement.averageProgress}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Progress Entries</span>
                <span className="font-medium">{analyticsData.userEngagement.totalProgressEntries}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Platform Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Modules</span>
                <span className="font-medium">{analyticsData.overview.totalModules}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Portfolio Positions</span>
                <span className="font-medium">{analyticsData.overview.totalPortfolioPositions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Trades</span>
                <span className="font-medium">{analyticsData.overview.totalTrades}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">New Users</span>
                <span className="font-medium">{analyticsData.recentActivity.newUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Active Subscriptions</span>
                <span className="font-medium">{analyticsData.recentActivity.activeSubscriptions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Forum Posts</span>
                <span className="font-medium">{analyticsData.recentActivity.totalPosts}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
