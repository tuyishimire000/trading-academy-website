"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Bookmark,
  BookmarkCheck,
  Maximize,
  Settings
} from "lucide-react"

interface VideoPlayerProps {
  videoUrl: string
  title: string
  description?: string
  duration: number // in seconds
  courseId: string
  moduleId: string
  onProgressUpdate?: (progress: number) => void
  initialProgress?: number
}

export function VideoPlayer({
  videoUrl,
  title,
  description,
  duration,
  courseId,
  moduleId,
  onProgressUpdate,
  initialProgress = 0
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [progress, setProgress] = useState(initialProgress)
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [showControls, setShowControls] = useState(true)
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout>()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration)
      if (initialProgress > 0) {
        video.currentTime = (initialProgress / 100) * video.duration
      }
    }

    const handleTimeUpdate = () => {
      const currentProgress = (video.currentTime / video.duration) * 100
      setCurrentTime(video.currentTime)
      setProgress(currentProgress)
      onProgressUpdate?.(currentProgress)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(100)
      onProgressUpdate?.(100)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [initialProgress, onProgressUpdate])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const skip = (seconds: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds))
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    video.currentTime = percentage * video.duration
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const addBookmark = () => {
    const video = videoRef.current
    if (!video) return

    const currentTime = video.currentTime
    if (!bookmarks.includes(currentTime)) {
      setBookmarks([...bookmarks, currentTime].sort((a, b) => a - b))
    }
  }

  const jumpToBookmark = (time: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = time
  }

  const removeBookmark = (time: number) => {
    setBookmarks(bookmarks.filter(b => b !== time))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeout) {
      clearTimeout(controlsTimeout)
    }
    const timeout = setTimeout(() => setShowControls(false), 3000)
    setControlsTimeout(timeout)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <p className="text-gray-600">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video Container */}
        <div 
          className="relative bg-black rounded-lg overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setShowControls(false)}
        >
          <video
            ref={videoRef}
            className="w-full h-auto"
            src={videoUrl}
            preload="metadata"
          />
          
          {/* Controls Overlay */}
          {showControls && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <div 
                className="w-full h-2 bg-gray-600 rounded-full cursor-pointer mb-2"
                onClick={seek}
              >
                <div 
                  className="h-full bg-amber-500 rounded-full relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-amber-500 rounded-full shadow-lg" />
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => skip(-10)}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => skip(10)}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>

                  <span className="text-sm ml-2">
                    {formatTime(currentTime)} / {formatTime(videoDuration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addBookmark}
                    className="text-white hover:bg-white/20"
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Display */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Progress: {Math.round(progress)}%</span>
          <Progress value={progress} className="w-32" />
        </div>

        {/* Bookmarks */}
        {bookmarks.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Bookmarks</h4>
            <div className="flex flex-wrap gap-2">
              {bookmarks.map((time, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-amber-100"
                  onClick={() => jumpToBookmark(time)}
                >
                  <BookmarkCheck className="h-3 w-3 mr-1" />
                  {formatTime(time)}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeBookmark(time)
                    }}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
