import { useState, useEffect } from "react"

interface PlatformSocialLink {
  id: string
  platform: string
  name: string
  url: string
  description: string | null
  required_plan: string | null
  is_active: boolean
  sort_order: number
}

interface PlatformSocialLinksData {
  links: PlatformSocialLink[]
  grouped: Record<string, PlatformSocialLink[]>
  userPlan: string | null
}

interface UsePlatformSocialLinksReturn {
  data: PlatformSocialLinksData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function usePlatformSocialLinks(): UsePlatformSocialLinksReturn {
  const [data, setData] = useState<PlatformSocialLinksData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSocialLinks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/platform-social-links")
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || "Failed to fetch social links")
      }
    } catch (err) {
      setError("Failed to fetch social links")
      console.error("Error fetching platform social links:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSocialLinks()
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchSocialLinks
  }
}
