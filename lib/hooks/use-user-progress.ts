"use client"

import { useEffect, useState } from "react"
import { useUser } from "./use-user"

interface UserProgress {
  id: string
  course_id: string
  status: string
  progress_percentage: number
  last_accessed: string
  courses: {
    title: string
    thumbnail_url: string
    difficulty_level: string
  }
}

export function useUserProgress() {
  const { user } = useUser()
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    coursesCompleted: 0,
    coursesInProgress: 0,
    totalCourses: 0,
    overallProgress: 0,
  })

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchProgress = async () => {
      try {
        const res = await fetch("/api/user/progress")
        if (!res.ok) throw new Error("Failed to fetch progress")
        const json = await res.json()
        const progressData = json.progress || []
        setProgress(progressData)

        const completed = progressData.filter((p: any) => p.status === "completed").length
        const inProgress = progressData.filter((p: any) => p.status === "in_progress").length
        const total = progressData.length
        const overall = total > 0 ? Math.round(progressData.reduce((acc: number, p: any) => acc + p.progress_percentage, 0) / total) : 0

        setStats({
          coursesCompleted: completed,
          coursesInProgress: inProgress,
          totalCourses: total,
          overallProgress: overall,
        })
      } catch (err) {
        console.error("Error fetching progress:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [user])

  return { progress, stats, loading }
}
