"use client"

import { createClient } from "@/lib/supabase/client"
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
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("status", "scheduled")
          .gte("start_time", new Date().toISOString())
          .order("start_time")
          .limit(10)

        if (error) throw error
        setEvents(data || [])
      } catch (err) {
        console.error("Error fetching events:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [supabase])

  return { events, loading }
}
