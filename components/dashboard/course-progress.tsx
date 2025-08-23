"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getDifficultyColor, getStatusColor } from "@/lib/utils/format"
import { BookOpen, Play, CheckCircle, Lock, ArrowRight, Loader2, ArrowUp, Crown, Check } from "lucide-react"
import { useRouter } from "next/navigation"

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string | null
  difficulty_level: string
  estimated_duration: number | null
  required_plan: string
  category: {
    name: string
    icon: string
  }
  userProgress: {
    status: string
    progress_percentage: number
    last_accessed: string
  } | null
  hasAccess: boolean
  userPlanLevel: string
  coursePlanLevel: number
  isLocked: boolean
}

interface CoursesData {
  courses: Course[]
  userPlan: string
  totalCourses: number
  accessibleCourses: number
  lockedCourses: number
}

interface CourseProgressProps {
  onViewAllCourses?: () => void
}

export function CourseProgress({ onViewAllCourses }: CourseProgressProps) {
  const [coursesData, setCoursesData] = useState<CoursesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [selectedRequiredPlan, setSelectedRequiredPlan] = useState<string>("")
  const [availablePlans, setAvailablePlans] = useState<any[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses')
        if (!response.ok) throw new Error('Failed to fetch courses')
        const data = await response.json()
        setCoursesData(data)
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const handleCourseClick = (course: Course) => {
    if (course.isLocked) {
      // Show upgrade modal
      handleUpgrade(course.required_plan)
      return
    }
    
    // Navigate to course detail page
    router.push(`/courses/${course.id}`)
  }

  const handleUpgrade = async (requiredPlan: string) => {
    setSelectedRequiredPlan(requiredPlan)
    setLoadingPlans(true)
    setShowUpgradeDialog(true)

    try {
      const response = await fetch("/api/subscription-plans")
      if (response.ok) {
        const data = await response.json()
        
        // Find the required plan to get its price
        const requiredPlanData = data.plans.find((plan: any) => 
          plan.name.toLowerCase().includes(requiredPlan.toLowerCase()) ||
          requiredPlan.toLowerCase().includes(plan.name.toLowerCase())
        )
        
        if (requiredPlanData) {
          const requiredPlanPrice = requiredPlanData.price
          
          // Filter plans that are higher than or equal to the required plan price
          const filteredPlans = data.plans.filter((plan: any) => 
            plan.price >= requiredPlanPrice && plan.name !== coursesData?.userPlan
          )
          
          setAvailablePlans(filteredPlans)
        } else {
          // Fallback: show all plans except current plan
          const filteredPlans = data.plans.filter((plan: any) => 
            plan.name !== coursesData?.userPlan
          )
          setAvailablePlans(filteredPlans)
        }
      }
    } catch (error) {
      console.error("Error fetching plans:", error)
    } finally {
      setLoadingPlans(false)
    }
  }

  const handlePlanSelection = (plan: any) => {
    setShowUpgradeDialog(false)
    router.push(`/subscription?planId=${plan.id}`)
  }

  const handleViewAllCourses = () => {
    if (onViewAllCourses) {
      onViewAllCourses()
    } else {
      router.push('/courses')
    }
  }

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

  if (!coursesData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Continue Learning</CardTitle>
          <CardDescription className="text-sm">Pick up where you left off</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Unable to load courses</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { courses, userPlan, totalCourses, accessibleCourses } = coursesData

  // Get courses with progress (in progress or completed) - including locked ones
  const coursesWithProgress = courses.filter(course => 
    course.userProgress && course.userProgress.status !== 'not_started'
  )

  // Get in-progress courses first (including locked ones), then completed (including locked ones), then accessible courses without progress
  const inProgressCourses = coursesWithProgress.filter(course => 
    course.userProgress?.status === 'in_progress'
  )
  const completedCourses = coursesWithProgress.filter(course => 
    course.userProgress?.status === 'completed'
  )
  const accessibleCoursesWithoutProgress = courses.filter(course => 
    course.hasAccess && (!course.userProgress || course.userProgress.status === 'not_started')
  )

  // Combine courses to show: in-progress first (including locked), then completed (including locked), then accessible without progress
  const coursesToShow = [
    ...inProgressCourses.slice(0, 2),
    ...completedCourses.slice(0, 1),
    ...accessibleCoursesWithoutProgress.slice(0, 2)
  ].slice(0, 3)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl">Continue Learning</CardTitle>
              <CardDescription className="text-sm">
                {coursesWithProgress.length > 0 
                  ? `Pick up where you left off • ${accessibleCourses} courses available`
                  : `${accessibleCourses} courses available to start`
                }
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleViewAllCourses}>
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {coursesToShow.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No courses started yet</p>
              <Button onClick={handleViewAllCourses}>Browse Courses</Button>
            </div>
          ) : (
            coursesToShow.map((course) => (
              <div
                key={course.id}
                className={`flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                  course.isLocked ? 'opacity-75' : ''
                }`}
                onClick={() => handleCourseClick(course)}
              >
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  course.isLocked 
                    ? 'bg-gray-100' 
                    : course.userProgress?.status === 'completed'
                    ? 'bg-green-100'
                    : 'bg-blue-100'
                }`}>
                  {course.isLocked ? (
                    <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                  ) : course.userProgress?.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  ) : (
                    <Play className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{course.title}</h3>
                    <div className="flex gap-2 mt-1 sm:mt-0">
                      <Badge className={`text-xs ${getDifficultyColor(course.difficulty_level)}`}>
                        {course.difficulty_level}
                      </Badge>
                      {course.userProgress && (
                        <Badge className={`text-xs ${getStatusColor(course.userProgress.status)}`}>
                          {course.userProgress.status.replace("_", " ")}
                        </Badge>
                      )}
                      {course.isLocked && (
                        <Badge className="text-xs bg-orange-100 text-orange-800">
                          {course.required_plan} plan
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {course.userProgress && course.userProgress.status !== 'not_started' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Progress</span>
                        <span>{course.userProgress.progress_percentage}%</span>
                      </div>
                      <Progress value={course.userProgress.progress_percentage} className="h-2" />
                    </div>
                  )}
                  
                  {course.category && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span>{course.category.icon}</span>
                      <span>{course.category.name}</span>
                    </div>
                  )}
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full sm:w-auto mt-2 sm:mt-0"
                  variant={course.isLocked ? "outline" : "default"}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (course.isLocked) {
                      handleUpgrade(course.required_plan)
                    } else {
                      handleCourseClick(course)
                    }
                  }}
                >
                  {course.isLocked ? (
                    <>
                      <Lock className="h-4 w-4 mr-1" />
                      Upgrade
                    </>
                  ) : course.userProgress?.status === 'completed' ? (
                    "Review"
                  ) : course.userProgress?.status === 'in_progress' ? (
                    "Continue"
                  ) : (
                    "Start"
                  )}
                </Button>
              </div>
            ))
          )}
          
          {accessibleCourses > coursesToShow.length && (
            <div className="text-center pt-2">
              <Button variant="ghost" size="sm" onClick={handleViewAllCourses}>
                View {accessibleCourses - coursesToShow.length} more courses
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUp className="h-5 w-5 text-amber-600" />
              Upgrade Required
            </DialogTitle>
            <DialogDescription>
              This course requires a {selectedRequiredPlan} plan or higher. Choose a plan to continue learning.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {loadingPlans ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading plans...</span>
              </div>
            ) : availablePlans.length > 0 ? (
              <div className="space-y-3">
                {availablePlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Crown className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{plan.display_name}</h4>
                        <p className="text-xs text-gray-600">{plan.billing_cycle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">${plan.price}</div>
                      <div className="text-xs text-gray-600">per {plan.billing_cycle}</div>
                    </div>
                    <Button
                      onClick={() => handlePlanSelection(plan)}
                      className="bg-amber-500 hover:bg-amber-600 ml-4"
                      size="sm"
                    >
                      Upgrade to {plan.display_name}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No upgrade plans available</p>
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setShowUpgradeDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
