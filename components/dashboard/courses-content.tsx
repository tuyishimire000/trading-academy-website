"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  BookOpen, 
  Lock, 
  Play, 
  Clock, 
  Star, 
  TrendingUp,
  ArrowUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  Crown
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { CoursePlayer } from "./course-player"

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

interface SubscriptionPlan {
  id: string
  name: string
  display_name: string
  price: number
  billing_cycle: string
  features: string[]
}

interface CoursesContentProps {
  initialSelectedCourseId?: string | null
  onCourseSelected?: (courseId: string | null) => void
}

export function CoursesContent({ initialSelectedCourseId, onCourseSelected }: CoursesContentProps) {
  const [coursesData, setCoursesData] = useState<CoursesData | null>(null)
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('progress')
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [selectedCourseForUpgrade, setSelectedCourseForUpgrade] = useState<Course | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(initialSelectedCourseId || null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (initialSelectedCourseId && initialSelectedCourseId !== selectedCourseId) {
      setSelectedCourseId(initialSelectedCourseId)
    }
  }, [initialSelectedCourseId, selectedCourseId])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, plansResponse] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/subscription-plans')
        ])
        
        if (!coursesResponse.ok) throw new Error('Failed to fetch courses')
        if (!plansResponse.ok) throw new Error('Failed to fetch subscription plans')
        
        const coursesData = await coursesResponse.json()
        const plansData = await plansResponse.json()
        
        setCoursesData(coursesData)
        setSubscriptionPlans(plansData.plans || [])
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load courses. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleUpgradeClick = (course: Course, event: React.MouseEvent) => {
    event.stopPropagation()
    setSelectedCourseForUpgrade(course)
    setUpgradeModalOpen(true)
  }

  const handleUpgradeToPlan = (planId: string) => {
    setUpgradeModalOpen(false)
    router.push(`/subscription?planId=${planId}`)
  }

  const handleCourseClick = (course: Course) => {
    if (course.isLocked) {
      return
    }
    setSelectedCourseId(course.id)
    if (onCourseSelected) {
      onCourseSelected(course.id)
    }
  }

  const handleBackToCourses = () => {
    setSelectedCourseId(null)
    if (onCourseSelected) {
      onCourseSelected(null)
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'not_started': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    )
  }

  if (!coursesData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Courses</h2>
          <p className="text-gray-600 mb-4">Please try refreshing the page.</p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    )
  }

  const { courses, userPlan, totalCourses, accessibleCourses, lockedCourses } = coursesData

  const inProgressCourses = courses.filter(course => 
    course.userProgress && course.userProgress.status === 'in_progress'
  )
  const completedCourses = courses.filter(course => 
    course.userProgress && course.userProgress.status === 'completed'
  )

  // If a course is selected, show the course player
  if (selectedCourseId) {
    return (
      <CoursePlayer 
        courseId={selectedCourseId} 
        onBack={handleBackToCourses}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Courses</h1>
        <p className="text-gray-600">Master trading with our comprehensive course library</p>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Total Courses</p>
                   <p className="text-2xl font-bold">{totalCourses}</p>
                 </div>
                 <BookOpen className="h-8 w-8 text-blue-500" />
               </div>
             </CardContent>
           </Card>
           
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Accessible</p>
                   <p className="text-2xl font-bold text-green-600">{accessibleCourses}</p>
                 </div>
                 <CheckCircle className="h-8 w-8 text-green-500" />
               </div>
             </CardContent>
           </Card>
           
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Locked</p>
                   <p className="text-2xl font-bold text-orange-600">{lockedCourses}</p>
                 </div>
                 <Lock className="h-8 w-8 text-orange-500" />
               </div>
             </CardContent>
           </Card>
         </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            My Progress
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            All Courses
          </TabsTrigger>
        </TabsList>

        {/* My Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          {inProgressCourses.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Continue Learning</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgressCourses.map((course) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    onCourseClick={handleCourseClick}
                    onUpgradeClick={handleUpgradeClick}
                    getDifficultyColor={getDifficultyColor}
                    getStatusColor={getStatusColor}
                    formatDuration={formatDuration}
                  />
                ))}
              </div>
            </div>
          )}

          {completedCourses.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCourses.map((course) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    onCourseClick={handleCourseClick}
                    onUpgradeClick={handleUpgradeClick}
                    getDifficultyColor={getDifficultyColor}
                    getStatusColor={getStatusColor}
                    formatDuration={formatDuration}
                  />
                ))}
              </div>
            </div>
          )}

          {inProgressCourses.length === 0 && completedCourses.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Learning Journey</h3>
                <p className="text-gray-600 mb-4">You haven't started any courses yet. Browse our course library to begin learning.</p>
                <Button onClick={() => setActiveTab('all')}>Browse All Courses</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* All Courses Tab */}
        <TabsContent value="all" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">All Available Courses</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Filter by:</span>
              <Badge variant="outline">All</Badge>
              <Badge variant="outline">Beginner</Badge>
              <Badge variant="outline">Intermediate</Badge>
              <Badge variant="outline">Advanced</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onCourseClick={handleCourseClick}
                onUpgradeClick={handleUpgradeClick}
                getDifficultyColor={getDifficultyColor}
                getStatusColor={getStatusColor}
                formatDuration={formatDuration}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Upgrade Modal */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-600" />
              Upgrade Required
            </DialogTitle>
            <DialogDescription>
              {selectedCourseForUpgrade && (
                <>
                  To access <strong>"{selectedCourseForUpgrade.title}"</strong>, you need to upgrade to a {selectedCourseForUpgrade.required_plan} plan or higher.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedCourseForUpgrade && subscriptionPlans
              .filter(plan => {
                const planHierarchy = { 'free': 1, 'premium': 2, 'pro': 3 }
                const coursePlanLevel = planHierarchy[selectedCourseForUpgrade.required_plan as keyof typeof planHierarchy] || 1
                const userPlanLevel = planHierarchy[coursesData?.userPlan as keyof typeof planHierarchy] || 1
                const planLevel = planHierarchy[plan.name as keyof typeof planHierarchy] || 1
                
                return planLevel >= coursePlanLevel && planLevel > userPlanLevel
              })
              .map(plan => (
                <div key={plan.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{plan.display_name}</h3>
                    <span className="text-2xl font-bold text-amber-600">${plan.price}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 capitalize">{plan.billing_cycle}</p>
                  <Button 
                    onClick={() => handleUpgradeToPlan(plan.id)}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Upgrade to {plan.display_name}
                  </Button>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Course Card Component
function CourseCard({ 
  course, 
  onCourseClick, 
  onUpgradeClick,
  getDifficultyColor, 
  getStatusColor, 
  formatDuration 
}: {
  course: Course
  onCourseClick: (course: Course) => void
  onUpgradeClick: (course: Course, event: React.MouseEvent) => void
  getDifficultyColor: (level: string) => string
  getStatusColor: (status: string) => string
  formatDuration: (minutes: number | null) => string
}) {
  return (
    <Card 
      className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
        course.isLocked ? 'opacity-75' : 'hover:scale-105'
      }`}
      onClick={() => onCourseClick(course)}
    >
      {/* Locked Overlay */}
      {course.isLocked && (
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-10">
          <div className="text-center text-white mb-4">
            <Lock className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Upgrade Required</p>
            <p className="text-xs opacity-75">{course.required_plan} plan</p>
          </div>
          <Button 
            onClick={(e) => onUpgradeClick(course, e)}
            className="bg-amber-600 hover:bg-amber-700 text-white border-0"
            size="sm"
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            Upgrade
          </Button>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2 mb-2">{course.title}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`text-xs ${getDifficultyColor(course.difficulty_level)}`}>
                {course.difficulty_level}
              </Badge>
              {course.userProgress && (
                <Badge className={`text-xs ${getStatusColor(course.userProgress.status)}`}>
                  {course.userProgress.status.replace('_', ' ')}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(course.estimated_duration)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
          {course.description}
        </p>

        {/* Progress Bar for courses with progress */}
        {course.userProgress && course.userProgress.status !== 'not_started' && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{course.userProgress.progress_percentage}%</span>
            </div>
            <Progress value={course.userProgress.progress_percentage} className="h-2" />
          </div>
        )}

        {/* Course Category */}
        {course.category && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span className="text-lg">{course.category.icon}</span>
            <span>{course.category.name}</span>
          </div>
        )}

        {/* Action Button */}
        {!course.isLocked && (
          <Button 
            className="w-full" 
            variant="default"
          >
            {course.userProgress?.status === 'completed' ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Review Course
              </>
            ) : course.userProgress?.status === 'in_progress' ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Continue Learning
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Start Course
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
