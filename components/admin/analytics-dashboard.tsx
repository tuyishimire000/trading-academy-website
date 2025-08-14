"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { Users, DollarSign, BookOpen, Calendar, TrendingUp, Activity } from "lucide-react"

interface AnalyticsData {
  overview: {
    totalUsers: number
    activeSubscriptions: number
    totalCourses: number
    totalEvents: number
    monthlyRevenue: number
  }
  userGrowth: Record<string, number>
  completionRates: Record<string, { total: number; completed: number }>
  recentActivity: Array<{ created_at: string }>
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/admin/analytics")
        const data = await response.json()

        if (response.ok) {
          setAnalytics(data.analytics)
        } else {
          console.error("Failed to fetch analytics:", data.error)
        }
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    )
  }

  const { overview, userGrowth, completionRates } = analytics

  // Calculate growth percentage (mock calculation)
  const userGrowthArray = Object.values(userGrowth)
  const recentGrowth = userGrowthArray.slice(-7).reduce((a, b) => a + b, 0)
  const previousGrowth = userGrowthArray.slice(-14, -7).reduce((a, b) => a + b, 0)
  const growthPercentage = previousGrowth > 0 ? Math.round(((recentGrowth - previousGrowth) / previousGrowth) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`inline-flex items-center ${growthPercentage >= 0 ? "text-green-600" : "text-red-600"}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {growthPercentage >= 0 ? "+" : ""}
                {growthPercentage}%
              </span>{" "}
              from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(overview.monthlyRevenue)} monthly revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Available for students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Scheduled events</p>
          </CardContent>
        </Card>
      </div>

      {/* Course Completion Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Course Completion Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(completionRates).map(([courseTitle, data]) => {
              const completionRate = data.total > 0 ? (data.completed / data.total) * 100 : 0
              return (
                <div key={courseTitle} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{courseTitle}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {data.completed}/{data.total}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{Math.round(completionRate)}%</span>
                    </div>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>
              )
            })}
            {Object.keys(completionRates).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No course completion data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Growth Chart (Simple visualization) */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(userGrowth)
              .slice(-10)
              .map(([date, count]) => (
                <div key={date} className="flex items-center justify-between">
                  <span className="text-sm">{formatDate(date)}</span>
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-500 h-2 rounded" style={{ width: `${Math.max(count * 10, 4)}px` }}></div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                </div>
              ))}
            {Object.keys(userGrowth).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No user growth data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
