"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatDate } from "@/lib/utils/format"
import { Users, MessageCircle, Calendar, BookOpen, Activity, UserPlus } from "lucide-react"

interface CommunityData {
  recentUsers: Array<{
    first_name: string
    last_name: string
    created_at: string
  }>
  eventRegistrations: Array<{
    id: string
    created_at: string
    events: {
      title: string
      event_date: string
    }
    profiles: {
      first_name: string
      last_name: string
    }
  }>
  courseEnrollments: Array<{
    created_at: string
    status: string
    courses: {
      title: string
    }
    profiles: {
      first_name: string
      last_name: string
    }
  }>
  discordStats: {
    totalMembers: number
    onlineMembers: number
    newMembersToday: number
    messagesLast24h: number
    activeChannels: number
  }
  engagement: {
    totalUsers: number
    activeUsers: number
    engagementRate: number
  }
}

export function CommunityManagement() {
  const [community, setCommunity] = useState<CommunityData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const response = await fetch("/api/admin/community")
        const data = await response.json()

        if (response.ok) {
          setCommunity(data.community)
        } else {
          console.error("Failed to fetch community data:", data.error)
        }
      } catch (error) {
        console.error("Error fetching community data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCommunity()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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

  if (!community) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Failed to load community data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Discord Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{community.discordStats.totalMembers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Now</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{community.discordStats.onlineMembers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Today</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{community.discordStats.newMembersToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages (24h)</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{community.discordStats.messagesLast24h}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Channels</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{community.discordStats.activeChannels}</div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Community Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Engagement Rate</span>
              <span className="text-sm text-muted-foreground">
                {community.engagement.activeUsers} / {community.engagement.totalUsers} users
              </span>
            </div>
            <Progress value={community.engagement.engagementRate} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {community.engagement.engagementRate}% of users were active in the last 7 days
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Recent New Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {community.recentUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">Joined {formatDate(user.created_at)}</p>
                  </div>
                  <Badge variant="outline">New</Badge>
                </div>
              ))}
              {community.recentUsers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No new users this week</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Event Registrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Event Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {community.eventRegistrations.slice(0, 5).map((registration) => (
                <div key={registration.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{registration.events.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {registration.profiles.first_name} {registration.profiles.last_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{formatDate(registration.created_at)}</p>
                  </div>
                </div>
              ))}
              {community.eventRegistrations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent event registrations</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recent Course Enrollments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {community.courseEnrollments.map((enrollment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{enrollment.courses.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {enrollment.profiles.first_name} {enrollment.profiles.last_name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={enrollment.status === "completed" ? "default" : "outline"} className="text-xs">
                    {enrollment.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(enrollment.created_at)}</span>
                </div>
              </div>
            ))}
            {community.courseEnrollments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No recent course enrollments</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
