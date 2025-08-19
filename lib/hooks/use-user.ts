"use client"

import { useEffect, useState } from "react"

interface JwtUser {
  id: string
  email: string
  is_admin?: boolean
}

export function useUser() {
  const [user, setUser] = useState<JwtUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const json = await res.json()
          setUser(json.user)
        } else {
          setUser(null)
        }
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  return { user, loading }
}
