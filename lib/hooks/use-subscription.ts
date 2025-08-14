"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useUser } from "./use-user"

interface UserSubscription {
  id: string
  plan_id: string
  status: string
  current_period_end: string
  subscription_plans: {
    name: string
    display_name: string
    features: any
  }
}

export function useSubscription() {
  const { user } = useUser()
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchSubscription = async () => {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          subscription_plans (
            name,
            display_name,
            features
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single()

      if (!error && data) {
        setSubscription(data)
      }
      setLoading(false)
    }

    fetchSubscription()
  }, [user, supabase])

  return { subscription, loading }
}
