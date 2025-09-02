"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { 
  Video, 
  BookOpen, 
  Headphones, 
  Search, 
  Filter, 
  Play, 
  Download, 
  ExternalLink,
  Star,
  Eye,
  Clock,
  User,
  Calendar,
  FileText,
  TrendingUp,
  Bookmark,
  Share2
} from "lucide-react"

interface ResourceCategory {
  id: number
  name: string
  description?: string
  icon?: string
  color: string
}

interface BaseResource {
  id: number
  type: 'video' | 'book' | 'podcast'
  title: string
  description?: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  tags?: any
  rating: number
  is_featured: boolean
  category?: ResourceCategory
  created_at: string
}

interface VideoResource extends BaseResource {
  type: 'video'
  url: string
  thumbnail_url?: string
  duration_seconds?: number
  source: string
  views_count: number
}

interface BookResource extends BaseResource {
  type: 'book'
  author: string
  cover_image_url?: string
  file_url: string
  file_size_mb?: number
  file_type?: string
  pages?: number
  isbn?: string
  publisher?: string
  publication_year?: number
  downloads_count: number
}

interface PodcastResource extends BaseResource {
  type: 'podcast'
  host?: string
  url: string
  platform: string
  cover_image_url?: string
  duration_seconds?: number
  episode_number?: number
  season_number?: number
  listens_count: number
}

type Resource = VideoResource | BookResource | PodcastResource

interface ResourcesData {
  videos: VideoResource[]
  books: BookResource[]
  podcasts: PodcastResource[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function ResourcesPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [resources, setResources] = useState<ResourcesData | null>(null)
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    featured: false,
    search: ''
  })
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchResources()
  }, [filters, activeTab])

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchValue }))
    }, 500)

    return () => clearTimeout(timer)
  }, [searchValue])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/resources/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchResources = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.category && filters.category !== 'all') params.append('category', filters.category)
      if (filters.difficulty && filters.difficulty !== 'all') params.append('difficulty', filters.difficulty)
      if (filters.featured) params.append('featured', 'true')
      if (filters.search.trim()) params.append('search', filters.search.trim())
      if (activeTab !== 'all') params.append('type', activeTab)

      const response = await fetch(`/api/resources?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setResources(data)
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const resetFilters = () => {
    setFilters({
      category: 'all',
      difficulty: 'all',
      featured: false,
      search: ''
    })
    setSearchValue('')
  }

  const renderVideoCard = (video: VideoResource) => (
    <Card key={video.id} className="hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={video.thumbnail_url || '/placeholder.jpg'}
          alt={video.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
            <Play className="h-4 w-4 mr-2" />
            Watch
          </Button>
        </div>
        {video.is_featured && (
          <Badge className="absolute top-2 right-2 bg-amber-500">
            Featured
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge variant="outline" className={getDifficultyColor(video.difficulty_level)}>
            {video.difficulty_level}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {video.rating}
          </div>
        </div>
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {video.duration_seconds ? formatDuration(video.duration_seconds) : 'N/A'}
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {video.views_count.toLocaleString()}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open(video.url, '_blank')}
            className="flex-1 mr-2"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open
          </Button>
          <Button variant="ghost" size="sm">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderBookCard = (book: BookResource) => (
    <Card key={book.id} className="hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={book.cover_image_url || '/placeholder.jpg'}
          alt={book.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        {book.is_featured && (
          <Badge className="absolute top-2 right-2 bg-amber-500">
            Featured
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge variant="outline" className={getDifficultyColor(book.difficulty_level)}>
            {book.difficulty_level}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {book.rating}
          </div>
        </div>
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{book.title}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <User className="h-4 w-4" />
          {book.author}
        </div>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{book.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {book.pages || 'N/A'} pages
          </div>
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {book.downloads_count.toLocaleString()}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open(book.file_url, '_blank')}
            className="flex-1 mr-2"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="ghost" size="sm">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderPodcastCard = (podcast: PodcastResource) => (
    <Card key={podcast.id} className="hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={podcast.cover_image_url || '/placeholder.jpg'}
          alt={podcast.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        {podcast.is_featured && (
          <Badge className="absolute top-2 right-2 bg-amber-500">
            Featured
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge variant="outline" className={getDifficultyColor(podcast.difficulty_level)}>
            {podcast.difficulty_level}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {podcast.rating}
          </div>
        </div>
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{podcast.title}</h3>
        {podcast.host && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <User className="h-4 w-4" />
            {podcast.host}
          </div>
        )}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{podcast.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {podcast.duration_seconds ? formatDuration(podcast.duration_seconds) : 'N/A'}
          </div>
          <div className="flex items-center gap-2">
            <Headphones className="h-4 w-4" />
            {podcast.listens_count.toLocaleString()}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open(podcast.url, '_blank')}
            className="flex-1 mr-2"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Listen
          </Button>
          <Button variant="ghost" size="sm">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trading Resources</h1>
          <p className="text-gray-600">Access learning materials and tools from external sources</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search resources..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-64"
              />
            </div>
                                 <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                       <SelectTrigger className="w-48">
                         <SelectValue placeholder="All Categories" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="all">All Categories</SelectItem>
                         {categories.map((category) => (
                           <SelectItem key={category.id} value={category.id.toString()}>
                             {category.name}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     <Select value={filters.difficulty} onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}>
                       <SelectTrigger className="w-40">
                         <SelectValue placeholder="All Levels" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="all">All Levels</SelectItem>
                         <SelectItem value="beginner">Beginner</SelectItem>
                         <SelectItem value="intermediate">Intermediate</SelectItem>
                         <SelectItem value="advanced">Advanced</SelectItem>
                       </SelectContent>
                     </Select>
            <Button
              variant={filters.featured ? "default" : "outline"}
              onClick={() => setFilters(prev => ({ ...prev, featured: !prev.featured }))}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Featured Only
            </Button>
            <Button
              variant="outline"
              onClick={resetFilters}
              className="ml-auto"
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            All Resources
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="book" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Books
          </TabsTrigger>
          <TabsTrigger value="podcast" className="flex items-center gap-2">
            <Headphones className="h-4 w-4" />
            Podcasts
          </TabsTrigger>
        </TabsList>

        {/* All Resources Tab */}
        <TabsContent value="all" className="space-y-8">
          {resources && (
            <>
              {/* Featured Videos */}
              {resources.videos.filter(v => v.is_featured).length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Video className="h-6 w-6 text-blue-500" />
                    Featured Videos
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.videos.filter(v => v.is_featured).map(renderVideoCard)}
                  </div>
                </div>
              )}

              {/* Featured Books */}
              {resources.books.filter(b => b.is_featured).length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-green-500" />
                    Featured Books
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.books.filter(b => b.is_featured).map(renderBookCard)}
                  </div>
                </div>
              )}

              {/* Featured Podcasts */}
              {resources.podcasts.filter(p => p.is_featured).length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Headphones className="h-6 w-6 text-purple-500" />
                    Featured Podcasts
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.podcasts.filter(p => p.is_featured).map(renderPodcastCard)}
                  </div>
                </div>
              )}

              {/* All Resources Grid */}
              <div>
                <h2 className="text-2xl font-bold mb-4">All Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.videos.map(renderVideoCard)}
                  {resources.books.map(renderBookCard)}
                  {resources.podcasts.map(renderPodcastCard)}
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="video" className="space-y-6">
          {resources && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.videos.map(renderVideoCard)}
            </div>
          )}
        </TabsContent>

        {/* Books Tab */}
        <TabsContent value="book" className="space-y-6">
          {resources && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.books.map(renderBookCard)}
            </div>
          )}
        </TabsContent>

        {/* Podcasts Tab */}
        <TabsContent value="podcast" className="space-y-6">
          {resources && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.podcasts.map(renderPodcastCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {resources && resources.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={resources.pagination.page === 1}
            onClick={() => setFilters(prev => ({ ...prev, page: resources.pagination.page - 1 }))}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {resources.pagination.page} of {resources.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={resources.pagination.page === resources.pagination.totalPages}
            onClick={() => setFilters(prev => ({ ...prev, page: resources.pagination.page + 1 }))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
