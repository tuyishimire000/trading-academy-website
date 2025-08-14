"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string
  difficulty_level: string
  estimated_duration: number
  required_plan: string
  course_categories: {
    name: string
    icon: string
  }
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from("courses")
          .select(`
            *,
            course_categories (
              name,
              icon
            )
          `)
          .eq("is_published", true)
          .order("sort_order")

        if (error) throw error
        setCourses(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch courses")
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [supabase])

  return { courses, loading, error }
}
