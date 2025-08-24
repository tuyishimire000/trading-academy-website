"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  BookOpen,
  Clock,
  CheckCircle,
  Lock,
  ArrowLeft,
  ArrowRight,
  List,
  FileText,
  Video,
  Headphones,
  Download,
  Share2,
  Star,
  MessageCircle,
  Loader2,
  AlertCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CourseModule {
  id: string
  title: string
  description: string | null
  content_type: string
  content_url: string | null
  duration: number | null
  sort_order: number
  is_published: boolean
  is_completed?: boolean
}

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string | null
  difficulty_level: string
  estimated_duration: number | null
  required_plan: string
  modules: CourseModule[]
  userProgress: {
    status: string
    progress_percentage: number
    last_accessed: string
  } | null
}

interface CoursePlayerProps {
  courseId: string
  onBack: () => void
}

export function CoursePlayer({ courseId, onBack }: CoursePlayerProps) {
  const [course, setCourse] = useState<Course | null>(null)
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const currentModule = course?.modules[currentModuleIndex]

  useEffect(() => {
    fetchCourseData()
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/courses/${courseId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch course data')
      }
      const data = await response.json()
      setCourse(data.course)
      
      // Find the first incomplete module or start from the beginning
      const firstIncompleteIndex = data.course.modules.findIndex((module: CourseModule) => !module.is_completed)
      setCurrentModuleIndex(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0)
    } catch (error) {
      console.error('Error fetching course data:', error)
      setError('Failed to load course data')
      toast({
        title: "Error",
        description: "Failed to load course data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleModuleComplete = async () => {
    if (!currentModule) return

    try {
      const response = await fetch('/api/user/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: courseId,
          moduleId: currentModule.id,
          action: 'complete_module'
        })
      })

      if (response.ok) {
        // Update local state
        if (course) {
          const updatedModules = course.modules.map(module => 
            module.id === currentModule.id ? { ...module, is_completed: true } : module
          )
          setCourse({ ...course, modules: updatedModules })
        }

        // Move to next module if available
        if (currentModuleIndex < (course?.modules.length || 0) - 1) {
          setCurrentModuleIndex(currentModuleIndex + 1)
        }

        toast({
          title: "Module Completed!",
          description: "Great job! Moving to the next module.",
        })
      }
    } catch (error) {
      console.error('Error marking module as complete:', error)
      toast({
        title: "Error",
        description: "Failed to mark module as complete.",
        variant: "destructive",
      })
    }
  }

  const handleModuleSelect = (index: number) => {
    setCurrentModuleIndex(index)
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'audio':
        return <Headphones className="h-4 w-4" />
      case 'document':
        return <FileText className="h-4 w-4" />
      case 'quiz':
        return <MessageCircle className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Course</h2>
          <p className="text-gray-600 mb-4">{error || 'Course not found'}</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    )
  }

  const completedModules = course.modules.filter(module => module.is_completed).length
  const totalModules = course.modules.length
  const progressPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{course.title}</h1>
            <p className="text-sm text-gray-600">
              Module {currentModuleIndex + 1} of {totalModules} • {progressPercentage.toFixed(0)}% complete
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowSidebar(!showSidebar)}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Player */}
          <div className="bg-black relative">
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              {currentModule?.content_type === 'video' && currentModule?.content_url ? (
                <video
                  className="w-full h-full object-contain"
                  controls
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                >
                  <source src={currentModule.content_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="text-center text-white">
                  <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No video content available</p>
                  <p className="text-gray-400">This module doesn't contain video content</p>
                </div>
              )}
            </div>

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <span className="text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Module Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                {/* Module Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {currentModule?.title}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          {getContentTypeIcon(currentModule?.content_type || 'video')}
                          <span className="ml-1 capitalize">{currentModule?.content_type}</span>
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDuration(currentModule?.duration)}
                        </span>
                        {currentModule?.is_completed && (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={handleModuleComplete}
                      disabled={currentModule?.is_completed}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {currentModule?.is_completed ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </>
                      )}
                    </Button>
                  </div>

                  {currentModule?.description && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{currentModule.description}</p>
                    </div>
                  )}
                </div>

                {/* Module Navigation */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentModuleIndex(Math.max(0, currentModuleIndex - 1))}
                    disabled={currentModuleIndex === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous Module
                  </Button>
                  
                  <div className="text-sm text-gray-600">
                    {currentModuleIndex + 1} of {totalModules}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentModuleIndex(Math.min(totalModules - 1, currentModuleIndex + 1))}
                    disabled={currentModuleIndex === totalModules - 1}
                  >
                    Next Module
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Course Content */}
        {showSidebar && (
          <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Course Content</h3>
              
              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-600">{progressPercentage.toFixed(0)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {completedModules} of {totalModules} modules completed
                </p>
              </div>

              {/* Modules List */}
              <div className="space-y-1">
                {course.modules.map((module, index) => (
                  <button
                    key={module.id}
                    onClick={() => handleModuleSelect(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      index === currentModuleIndex
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {module.is_completed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          {getContentTypeIcon(module.content_type)}
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {module.title}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                          <span>{formatDuration(module.duration)}</span>
                          {module.is_completed && (
                            <span className="text-green-600">✓ Completed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
