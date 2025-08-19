"use client"

// Fetch via REST API backed by Sequelize/MySQL
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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses")
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Failed to fetch courses")
        setCourses(json.courses || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch courses")
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  return { courses, loading, error }
}
