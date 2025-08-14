"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCourses } from "@/lib/hooks/use-courses"
import { formatDuration, getDifficultyColor } from "@/lib/utils/format"
import { BookOpen, Clock, Star } from "lucide-react"

export function DynamicCourses() {
  const { courses, loading } = useCourses()

  if (loading) {
    return (
      <section className="w-full py-8 md:py-16 lg:py-24">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8 md:mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const featuredCourses = courses.slice(0, 6)

  return (
    <section className="w-full py-8 md:py-16 lg:py-24">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
              Featured Courses
            </h2>
            <p className="max-w-[900px] text-gray-500 text-base sm:text-lg md:text-xl px-4">
              Master trading with our comprehensive course library designed by professional traders.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-6xl items-start gap-6 py-8 md:py-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {featuredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="h-8 w-8 text-green-600" />
                  <div className="flex gap-2">
                    <Badge className={`text-xs ${getDifficultyColor(course.difficulty_level)}`}>
                      {course.difficulty_level}
                    </Badge>
                    {course.required_plan !== "basic" && (
                      <Badge variant="secondary" className="text-xs">
                        {course.required_plan}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg sm:text-xl line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-3">{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(course.estimated_duration || 0)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>4.8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
