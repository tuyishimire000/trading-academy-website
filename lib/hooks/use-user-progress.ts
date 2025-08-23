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
        // Fetch user progress
        const progressRes = await fetch("/api/user/progress")
        if (!progressRes.ok) throw new Error("Failed to fetch progress")
        const progressJson = await progressRes.json()
        const progressData = progressJson.progress || []
        setProgress(progressData)

        // Fetch all courses (including locked ones)
        const coursesRes = await fetch("/api/courses")
        if (!coursesRes.ok) throw new Error("Failed to fetch courses")
        const coursesJson = await coursesRes.json()
        const allCourses = coursesJson.courses || []

        // Calculate stats according to requirements
        const completed = progressData.filter((p: any) => p.status === "completed").length
        const inProgress = progressData.filter((p: any) => p.status === "in_progress").length
        const totalCourses = allCourses.length // All courses including locked ones
        const startedCourses = progressData.filter((p: any) => p.status === "in_progress" || p.status === "completed")
        const overallProgress = startedCourses.length > 0 
          ? Math.round(startedCourses.reduce((acc: number, p: any) => acc + p.progress_percentage, 0) / startedCourses.length) 
          : 0



        setStats({
          coursesCompleted: completed,
          coursesInProgress: inProgress,
          totalCourses: totalCourses,
          overallProgress: overallProgress,
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
