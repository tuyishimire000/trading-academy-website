import { useState, useEffect } from "react"

interface ShowcaseStory {
  id: string
  title: string
  caption: string | null
  image_url: string
  group_name: string | null
  is_active: boolean
  expires_at: string
  created_at: string
}

interface StoryGroup {
  groupName: string
  stories: ShowcaseStory[]
  storyCount: number
}

interface ShowcaseStoriesData {
  stories: ShowcaseStory[]
  grouped: Record<string, ShowcaseStory[]>
  groups: StoryGroup[]
  totalStories: number
  totalGroups: number
}

interface UseShowcaseStoriesReturn {
  data: ShowcaseStoriesData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useShowcaseStories(): UseShowcaseStoriesReturn {
  const [data, setData] = useState<ShowcaseStoriesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/showcase-stories")
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || "Failed to fetch showcase stories")
      }
    } catch (err) {
      setError("Failed to fetch showcase stories")
      console.error("Error fetching showcase stories:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStories()
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchStories
  }
}
