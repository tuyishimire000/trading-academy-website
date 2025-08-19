"use client"

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

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchSubscription = async () => {
      try {
        const res = await fetch("/api/user/subscription")
        if (res.ok) {
          const json = await res.json()
          setSubscription(json.subscription)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [user])

  return { subscription, loading }
}
