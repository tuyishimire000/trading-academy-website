"use client"

import { useEffect, useState } from "react"

interface Event {
  id: string
  title: string
  description: string
  event_type: string
  start_time: string
  end_time: string
  meeting_url: string
  required_plan: string
  max_participants?: number
  instructor?: {
    id: string
    first_name: string
    last_name: string
  }
  participants: any[]
  isUserRegistered: boolean
  participantCount: number
  hasAccess: boolean
  userPlanLevel: number
  eventPlanLevel: number
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events")
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Failed to fetch events")
        setEvents(json.events || [])
      } catch (err) {
        console.error("Error fetching events:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return { events, loading }
}
