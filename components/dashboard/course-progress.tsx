"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useUserProgress } from "@/lib/hooks/use-user-progress"
import { getDifficultyColor, getStatusColor } from "@/lib/utils/format"
import { BookOpen } from "lucide-react"

export function CourseProgress() {
  const { progress, loading } = useUserProgress()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Continue Learning</CardTitle>
          <CardDescription className="text-sm">Pick up where you left off</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse p-3 sm:p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const inProgressCourses = progress.filter((p) => p.status === "in_progress").slice(0, 3)
  const recentCourses = progress.slice(0, 3)

  const coursesToShow = inProgressCourses.length > 0 ? inProgressCourses : recentCourses

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Continue Learning</CardTitle>
        <CardDescription className="text-sm">Pick up where you left off</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {coursesToShow.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No courses started yet</p>
            <Button>Browse Courses</Button>
          </div>
        ) : (
          coursesToShow.map((courseProgress) => (
            <div
              key={courseProgress.id}
              className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <h3 className="font-semibold text-sm sm:text-base truncate">{courseProgress.courses.title}</h3>
                  <div className="flex gap-2 mt-1 sm:mt-0">
                    <Badge className={`text-xs ${getDifficultyColor(courseProgress.courses.difficulty_level)}`}>
                      {courseProgress.courses.difficulty_level}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(courseProgress.status)}`}>
                      {courseProgress.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Progress</span>
                    <span>{courseProgress.progress_percentage}%</span>
                  </div>
                  <Progress value={courseProgress.progress_percentage} className="h-2" />
                </div>
              </div>
              <Button size="sm" className="w-full sm:w-auto mt-2 sm:mt-0">
                {courseProgress.status === "completed" ? "Review" : "Continue"}
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
