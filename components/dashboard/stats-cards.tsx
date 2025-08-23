"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUserProgress } from "@/lib/hooks/use-user-progress"
import { useEvents } from "@/lib/hooks/use-events"
import { BookOpen, Play, Award, TrendingUp } from "lucide-react"

export function StatsCards() {
  const { stats, loading: progressLoading } = useUserProgress()
  const { events, loading: eventsLoading } = useEvents()

  if (progressLoading || eventsLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-12 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(event.start_time)
    const now = new Date()
    const diffInDays = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diffInDays <= 30 // Events in the next 30 days
  }).length



  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Courses Completed</CardTitle>
          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold">{stats.coursesCompleted}</div>
          <p className="text-xs text-muted-foreground">
            {stats.coursesInProgress > 0 ? `${stats.coursesInProgress} in progress` : "All courses completed!"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Upcoming Events</CardTitle>
          <Play className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold">{upcomingEvents}</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Learning Progress</CardTitle>
          <Award className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold">{stats.overallProgress}%</div>
          <p className="text-xs text-muted-foreground">Average progress</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Total Courses</CardTitle>
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold">{stats.totalCourses}</div>
          <p className="text-xs text-muted-foreground">Available courses</p>
        </CardContent>
      </Card>
    </div>
  )
}
