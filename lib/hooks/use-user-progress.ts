"use client"

import { createClient } from "@/lib/supabase/client"
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
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .from("user_course_progress")
          .select(`
            *,
            courses (
              title,
              thumbnail_url,
              difficulty_level
            )
          `)
          .eq("user_id", user.id)
          .order("last_accessed", { ascending: false })

        if (error) throw error

        const progressData = data || []
        setProgress(progressData)

        // Calculate stats
        const completed = progressData.filter((p) => p.status === "completed").length
        const inProgress = progressData.filter((p) => p.status === "in_progress").length
        const total = progressData.length
        const overall =
          total > 0 ? Math.round(progressData.reduce((acc, p) => acc + p.progress_percentage, 0) / total) : 0

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
  }, [user, supabase])

  return { progress, stats, loading }
}
