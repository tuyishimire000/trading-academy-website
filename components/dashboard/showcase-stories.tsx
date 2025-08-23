"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useShowcaseStories } from "@/lib/hooks/use-showcase-stories"
import { 
  Play, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Image,
  Loader2
} from "lucide-react"

interface ShowcaseStory {
  id: string
  title: string
  caption: string | null
  image_url: string
  group_name: string | null
  is_active: boolean
  expires_at: string
  created_at: string
}

interface StoryGroup {
  groupName: string
  stories: ShowcaseStory[]
  storyCount: number
}

export function ShowcaseStories() {
  const { data, loading, error } = useShowcaseStories()
  const [selectedGroup, setSelectedGroup] = useState<StoryGroup | null>(null)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [isViewing, setIsViewing] = useState(false)
  const [progress, setProgress] = useState(0)

  // Auto-advance stories every 3 seconds
  useEffect(() => {
    if (!isViewing || !selectedGroup) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next story
          if (currentStoryIndex < selectedGroup.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1)
            return 0
          } else {
            // Close stories when done
            setIsViewing(false)
            setCurrentStoryIndex(0)
            setProgress(0)
            return 0
          }
        }
        return prev + 2 // Increment by 2% every 60ms (3 seconds total)
      })
    }, 60)

    return () => clearInterval(interval)
  }, [isViewing, selectedGroup, currentStoryIndex])

  const handleGroupClick = (group: StoryGroup) => {
    setSelectedGroup(group)
    setCurrentStoryIndex(0)
    setProgress(0)
    setIsViewing(true)
  }

  const handlePreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1)
      setProgress(0)
    }
  }

  const handleNextStory = () => {
    if (selectedGroup && currentStoryIndex < selectedGroup.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1)
      setProgress(0)
    } else {
      setIsViewing(false)
      setCurrentStoryIndex(0)
      setProgress(0)
    }
  }

  const handleClose = () => {
    setIsViewing(false)
    setCurrentStoryIndex(0)
    setProgress(0)
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()
    
    if (diff <= 0) return "Expired"
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Showcase Stories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading stories...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data || data.groups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Showcase Stories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {error || "No stories available at the moment"}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentStory = selectedGroup?.stories[currentStoryIndex]

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Showcase Stories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {data.groups.map((group) => (
              <div
                key={group.groupName}
                className="flex-shrink-0 cursor-pointer"
                onClick={() => handleGroupClick(group)}
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500">
                    <img
                      src={group.stories[0].image_url}
                      alt={group.groupName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {group.storyCount}
                  </div>
                </div>
                <p className="text-xs text-center mt-2 text-gray-600 truncate w-16">
                  {group.groupName}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Story Viewer Modal */}
      <Dialog open={isViewing} onOpenChange={setIsViewing}>
        <DialogContent className="max-w-md p-0 bg-black">
          {currentStory && (
            <div className="relative">
              {/* Progress bars */}
              <div className="absolute top-4 left-4 right-4 z-10">
                <div className="flex space-x-1">
                  {selectedGroup?.stories.map((_, index) => (
                    <div key={index} className="flex-1 bg-gray-600 rounded-full h-1">
                      <div
                        className={`h-full rounded-full transition-all duration-100 ${
                          index < currentStoryIndex
                            ? "bg-white"
                            : index === currentStoryIndex
                            ? "bg-white"
                            : "bg-gray-400"
                        }`}
                        style={{
                          width: index === currentStoryIndex ? `${progress}%` : 
                                 index < currentStoryIndex ? "100%" : "0%"
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 text-white hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Story image */}
              <div className="relative">
                <img
                  src={currentStory.image_url}
                  alt={currentStory.title}
                  className="w-full h-96 object-cover"
                />
                
                {/* Navigation buttons */}
                <button
                  onClick={handlePreviousStory}
                  disabled={currentStoryIndex === 0}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 disabled:opacity-50"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                
                <button
                  onClick={handleNextStory}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>

                {/* Story content overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {currentStory.title}
                  </h3>
                  {currentStory.caption && (
                    <p className="text-white/90 text-sm mb-2">
                      {currentStory.caption}
                    </p>
                  )}
                  <div className="flex items-center text-white/70 text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{getTimeRemaining(currentStory.expires_at)} left</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
