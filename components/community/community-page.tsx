"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  MessageCircle, 
  Send, 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  Flag,
  Users,
  TrendingUp,
  BookOpen,
  Target,
  Calendar,
  Star,
  Filter,
  Search,
  Plus,
  Clock,
  Eye,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Share2
} from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import { CommunityHeader } from "./community-header"

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  avatar?: string
  role: 'member' | 'moderator' | 'admin'
  join_date: Date
  posts_count: number
  reputation: number
}

interface ForumCategory {
  id: string
  name: string
  description: string | null
  slug: string
  sort_order: number
  is_active: boolean
  posts_count: number
}

interface ForumPost {
  id: string
  user_id: string
  category_id: string
  parent_id: string | null
  title: string | null
  content: string
  likes_count: number
  dislikes_count: number
  is_edited: boolean
  created_at: Date
  updated_at: Date
  user: User
  category: ForumCategory
  replies: ForumPost[]
  user_vote?: 'up' | 'down' | null
  // Support for nested replies (replies to comments)
  replies_to_replies?: ForumPost[]
}

interface CreatePostData {
  title?: string
  content: string
  category_id: string
  parent_id?: string
}

export function CommunityPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('all')
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showCreateComment, setShowCreateComment] = useState<string | null>(null)
  
     
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [newPost, setNewPost] = useState<CreatePostData>({
    title: '',
    content: '',
    category_id: ''
  })
  const [newComment, setNewComment] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest')

  // Fetch categories
  useEffect(() => {
    fetchCategories()
  }, [])

  // Fetch posts when categories change
  useEffect(() => {
    if (categories.length > 0) {
      fetchPosts()
    }
  }, [categories, activeTab, selectedCategory, sortBy])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/forum/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
        if (data.length > 0) {
          setNewPost(prev => ({ ...prev, category_id: data[0].id }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast({
        title: "Error",
        description: "Failed to load forum categories",
        variant: "destructive"
      })
    }
  }

  const fetchPosts = async () => {
    setLoading(true)
    try {
      let url = '/api/forum/posts?includeReplies=true&'
      if (selectedCategory !== 'all') {
        const category = categories.find(c => c.slug === selectedCategory)
        if (category) {
          url += `categoryId=${category.id}&`
        }
      }
      if (activeTab !== 'all') {
        const category = categories.find(c => c.slug === activeTab)
        if (category) {
          url += `categoryId=${category.id}&`
        }
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        // Sort posts based on selected sort
        const sortedPosts = sortPosts(data, sortBy)
        setPosts(sortedPosts)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      toast({
        title: "Error",
        description: "Failed to load forum posts",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const sortPosts = (posts: ForumPost[], sort: string): ForumPost[] => {
    switch (sort) {
      case 'newest':
        return [...posts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'popular':
        return [...posts].sort((a, b) => (b.likes_count - b.dislikes_count) - (a.likes_count - a.dislikes_count))
      case 'trending':
        return [...posts].sort((a, b) => {
          const aScore = (a.likes_count - a.dislikes_count) + (a.replies?.length || 0)
          const bScore = (b.likes_count - b.dislikes_count) + (b.replies?.length || 0)
          return bScore - aScore
        })
      default:
        return posts
    }
  }

  const handleCreatePost = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a post",
        variant: "destructive"
      })
      return
    }

    if (!newPost.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter post content",
        variant: "destructive"
      })
      return
    }

    if (!newPost.category_id || newPost.category_id === '') {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive"
      })
      return
    }

    

    try {
      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      })

      if (response.ok) {
        const createdPost = await response.json()
        setPosts(prev => [createdPost, ...prev])
        setNewPost({ title: '', content: '', category_id: categories[0]?.id || '' })
        setShowCreatePost(false)
        toast({
          title: "Success",
          description: "Post created successfully!",
        })
        
        // Refresh categories to update post counts
        fetchCategories()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create post')
      }
    } catch (error) {
      console.error('Failed to create post:', error)
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      })
    }
  }

       const handleCreateComment = async (parentId: string) => {
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to comment",
        variant: "destructive"
      })
      return
    }

    if (!newComment.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a comment",
        variant: "destructive"
      })
      return
    }

         const requestBody = {
       content: newComment,
       categoryId: categories[0]?.id || '',
       parentId: parentId
     }

    try {
      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
                 const createdComment = await response.json()
         
         // Update posts state to include the new comment
         setPosts(prev => {
           
           const updatedPosts = prev.map(post => {
             // If this is the main post being commented on
             if (post.id === parentId) {
               return { ...post, replies: [...(post.replies || []), createdComment] }
             }
             
             // If this is a comment being replied to, find the parent post and update it
             if (post.replies && post.replies.length > 0) {
               const updatedReplies = post.replies.map(reply => {
                 if (reply.id === parentId) {
                   // This is the comment being replied to
                   return { 
                     ...reply, 
                     replies: [...(reply.replies || []), createdComment] 
                   }
                 }
                 return reply
               })
               
               // Check if any reply was updated
               if (updatedReplies.some(reply => reply.id === parentId)) {
                 return { ...post, replies: updatedReplies }
               }
             }
             
             return post
           })
           
                        return updatedPosts
         })
        
                 setNewComment('')
         setShowCreateComment(null)
         toast({
           title: "Success",
           description: "Comment posted successfully!",
         })
         
         // Don't call fetchPosts() here as it overrides our optimistic updates
         // The state is already updated above
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to post comment')
      }
    } catch (error) {
      console.error('Failed to create comment:', error)
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive"
      })
    }
  }

  const handleVote = async (postId: string, vote: 'up' | 'down') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to vote",
        variant: "destructive"
      })
      return
    }

    // Optimistic update for both posts and comments
    setPosts(prev => prev.map(post => {
      // Check if this is the main post
      if (post.id === postId) {
        const currentVote = post.user_vote
        let likes = post.likes_count
        let dislikes = post.dislikes_count

        if (currentVote === vote) {
          // Remove vote
          if (vote === 'up') likes--
          else dislikes--
          return { ...post, likes_count: likes, dislikes_count: dislikes, user_vote: null }
        } else if (currentVote) {
          // Change vote
          if (currentVote === 'up') likes--
          else dislikes--
          if (vote === 'up') likes++
          else dislikes++
          return { ...post, likes_count: likes, dislikes_count: dislikes, user_vote: vote }
        } else {
          // New vote
          if (vote === 'up') likes++
          else dislikes++
          return { ...post, likes_count: likes, dislikes_count: dislikes, user_vote: vote }
        }
      }
      
      // Check if this is a comment within the post
      if (post.replies && post.replies.length > 0) {
        const updatedReplies = post.replies.map(reply => {
          if (reply.id === postId) {
            const currentVote = reply.user_vote
            let likes = reply.likes_count
            let dislikes = reply.dislikes_count

            if (currentVote === vote) {
              // Remove vote
              if (vote === 'up') likes--
              else dislikes--
              return { ...reply, likes_count: likes, dislikes_count: dislikes, user_vote: null }
            } else if (currentVote) {
              // Change vote
              if (currentVote === 'up') likes--
              else dislikes--
              if (vote === 'up') likes++
              else dislikes++
              return { ...reply, likes_count: likes, dislikes_count: dislikes, user_vote: vote }
            } else {
              // New vote
              if (vote === 'up') likes++
              else dislikes++
              return { ...reply, likes_count: likes, dislikes_count: dislikes, user_vote: vote }
            }
          }
          return reply
        })
        
        if (updatedReplies.some(reply => reply.id === postId)) {
          return { ...post, replies: updatedReplies }
        }
      }
      
      return post
    }))

    try {
      const response = await fetch(`/api/forum/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote })
      })

      if (!response.ok) {
        throw new Error('Failed to vote')
      }

      // Fetch updated posts to get accurate vote counts
      fetchPosts()
    } catch (error) {
      console.error('Vote error:', error)
      toast({
        title: "Error",
        description: "Failed to process vote",
        variant: "destructive"
      })
      
      // Revert optimistic update on error
      fetchPosts()
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getScore = (post: ForumPost) => post.likes_count - post.dislikes_count

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (post.title && post.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         post.user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.user.last_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || post.category.slug === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <CommunityHeader />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Community Forum</h1>
          <p className="text-gray-600 text-lg">Connect with fellow traders, share insights, and learn from the community</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('all')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  All Topics
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.slug ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.slug)}
                  >
                    {category.name}
                    <Badge variant="secondary" className="ml-auto">
                      {category.posts_count || 0}
                    </Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Create Post */}
            {user && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.first_name?.[0]}{user.last_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-left text-gray-500"
                      onClick={() => setShowCreatePost(true)}
                    >
                      What's on your mind?
                    </Button>
                  </div>

                  {showCreatePost && (
                    <div className="space-y-4">
                      <Input
                        placeholder="Post title (optional)"
                        value={newPost.title}
                        onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                      />
                      <Textarea
                        placeholder="Share your thoughts, questions, or insights..."
                        value={newPost.content}
                        onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                        rows={4}
                      />
                      <div className="flex items-center gap-3">
                        <select
                          value={newPost.category_id}
                          onChange={(e) => setNewPost(prev => ({ ...prev, category_id: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={categories.length === 0}
                        >
                          {categories.length === 0 ? (
                            <option value="">Loading categories...</option>
                          ) : (
                            <>
                              <option value="">Select a category</option>
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                        <Button 
                          onClick={handleCreatePost}
                          disabled={!newPost.category_id || newPost.category_id === ''}
                        >
                          Post
                        </Button>
                        <Button variant="outline" onClick={() => setShowCreatePost(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Filters and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="trending">Trending</option>
                </select>
              </div>
            </div>

            {/* Posts */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery || selectedCategory !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'Be the first to start a conversation!'
                    }
                  </p>
                  {user && (
                    <Button onClick={() => setShowCreatePost(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Post
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                                 {filteredPosts.map((post) => (
                                       <PostCard
                      key={post.id}
                      post={post}
                      onVote={handleVote}
                      onCreateComment={handleCreateComment}
                      showCreateComment={showCreateComment}
                                             setShowCreateComment={setShowCreateComment}
                      newComment={newComment}
                      setNewComment={setNewComment}
                      currentUser={user}
                      isCommentsExpanded={expandedComments.has(post.id)}
                      onToggleComments={() => toggleComments(post.id)}
                    />
                 ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface PostCardProps {
  post: ForumPost
  onVote: (postId: string, vote: 'up' | 'down') => void
  onCreateComment: (parentId: string) => void
  showCreateComment: string | null
  setShowCreateComment: (postId: string | null) => void
  newComment: string
  setNewComment: (comment: string) => void
  currentUser: any
  isCommentsExpanded: boolean
  onToggleComments: () => void
}

 function PostCard({
   post,
   onVote,
   onCreateComment,
   showCreateComment,
   setShowCreateComment,
   newComment,
   setNewComment,
   currentUser,
   isCommentsExpanded,
   onToggleComments
 }: PostCardProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getScore = (post: ForumPost) => post.likes_count - post.dislikes_count

  return (
    <Card>
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.user.avatar} />
            <AvatarFallback>{post.user.first_name?.[0]}{post.user.last_name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900">
                {post.user.first_name} {post.user.last_name}
              </span>
              <Badge variant="outline" className="text-xs">
                {post.category.name}
              </Badge>
              {post.user.role !== 'member' && (
                <Badge variant="secondary" className="text-xs">
                  {post.user.role}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(post.created_at)}
              {post.is_edited && <span>• edited</span>}
            </div>
          </div>
        </div>

        {/* Post Content */}
        {post.title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
        )}
        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>

        {/* Post Actions */}
        <div className="flex items-center gap-4">
                     {/* Voting */}
           <div className="flex items-center gap-1">
             <Button
               variant="ghost"
               size="sm"
               className={`h-8 px-2 ${post.user_vote === 'up' ? 'text-green-600' : 'text-gray-500'}`}
               onClick={() => onVote(post.id, 'up')}
             >
               <ArrowUp className="h-4 w-4" />
             </Button>
             <span className="text-sm font-medium text-gray-900 min-w-[20px] text-center">
               {post.likes_count}
             </span>
             <Button
               variant="ghost"
               size="sm"
               className={`h-8 px-2 ${post.user_vote === 'down' ? 'text-red-600' : 'text-gray-500'}`}
               onClick={() => onVote(post.id, 'down')}
             >
               <ArrowDown className="h-4 w-4" />
             </Button>
             <span className="text-sm font-medium text-gray-900 min-w-[20px] text-center">
               {post.dislikes_count}
             </span>
           </div>

                     {/* Comments */}
           <Button
             variant="ghost"
             size="sm"
             className="h-8 px-3"
             onClick={() => setShowCreateComment(showCreateComment === post.id ? null : post.id)}
           >
             <MessageSquare className="h-4 w-4 mr-2" />
             {post.replies?.length || 0} Comments
           </Button>
           
           {/* Toggle Comments Visibility */}
           {post.replies && post.replies.length > 0 && (
             <Button
               variant="ghost"
               size="sm"
               className="h-8 px-3"
               onClick={onToggleComments}
             >
               {isCommentsExpanded ? 'Hide' : 'Show'} Comments
             </Button>
           )}

          {/* Share */}
          <Button variant="ghost" size="sm" className="h-8 px-3">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>

          {/* More options */}
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

                                   {/* Create Comment */}
                     {showCreateComment === post.id && currentUser && (
            <div className="mt-4 pt-4 border-t">
             <div className="flex items-start gap-3">
               <Avatar className="h-8 w-8">
                 <AvatarImage src={currentUser.avatar} />
                 <AvatarFallback>{currentUser.first_name?.[0]}{currentUser.last_name?.[0]}</AvatarFallback>
               </Avatar>
               <div className="flex-1">
                 <Textarea
                   placeholder={showCreateComment === post.id ? "Write a comment..." : "Write a reply..."}
                   value={newComment}
                   onChange={(e) => setNewComment(e.target.value)}
                   rows={2}
                   className="mb-2"
                 />
                 <div className="flex gap-2">
                   <Button size="sm" onClick={() => onCreateComment(showCreateComment)}>
                     {showCreateComment === post.id ? "Comment" : "Reply"}
                   </Button>
                   <Button size="sm" variant="outline" onClick={() => setShowCreateComment(null)}>
                     Cancel
                   </Button>
                 </div>
               </div>
             </div>
           </div>
         )}

                 {/* Replies */}
         {post.replies && post.replies.length > 0 && isCommentsExpanded && (
           <div className="mt-4 space-y-3">
             <Separator />
             <div className="ml-8 space-y-3">
               {post.replies.map((reply) => (
                 <div key={reply.id} className="flex items-start gap-3">
                   <Avatar className="h-6 w-6">
                     <AvatarImage src={reply.user.avatar} />
                     <AvatarFallback>{reply.user.first_name?.[0]}{reply.user.last_name?.[0]}</AvatarFallback>
                   </Avatar>
                   <div className="flex-1">
                     <div className="flex items-center gap-2 mb-1">
                       <span className="font-medium text-sm text-gray-900">
                         {reply.user.first_name} {reply.user.last_name}
                       </span>
                       <span className="text-xs text-gray-500">
                         {formatTimeAgo(reply.created_at)}
                       </span>
                     </div>
                     <p className="text-sm text-gray-700">{reply.content}</p>
                     <div className="flex items-center gap-3 mt-2">
                       <Button
                         variant="ghost"
                         size="sm"
                         className="h-6 px-2 text-xs"
                         onClick={() => onVote(reply.id, 'up')}
                       >
                         <ArrowUp className="h-3 w-3 mr-1" />
                         {reply.likes_count}
                       </Button>
                       <Button
                         variant="ghost"
                         size="sm"
                         className="h-6 px-2 text-xs"
                         onClick={() => onVote(reply.id, 'down')}
                       >
                         <ArrowDown className="h-3 w-3 mr-1" />
                         {reply.dislikes_count}
                       </Button>
                                                                        <Button
                           variant="ghost"
                           size="sm"
                           className="h-6 px-2 text-xs"
                           onClick={() => setShowCreateComment(reply.id)}
                         >
                          Reply
                        </Button>
                     </div>
                     
                     {/* Nested replies to this comment */}
                     {reply.replies && reply.replies.length > 0 && (
                       <div className="mt-3 ml-6 space-y-2 border-l-2 border-gray-200 pl-3">
                         {reply.replies.map((nestedReply) => (
                           <div key={nestedReply.id} className="flex items-start gap-2">
                             <Avatar className="h-5 w-5">
                               <AvatarImage src={nestedReply.user.avatar} />
                               <AvatarFallback>{nestedReply.user.first_name?.[0]}{nestedReply.user.last_name?.[0]}</AvatarFallback>
                             </Avatar>
                             <div className="flex-1">
                               <div className="flex items-center gap-2 mb-1">
                                 <span className="font-medium text-xs text-gray-900">
                                   {nestedReply.user.first_name} {nestedReply.user.last_name}
                                 </span>
                                 <span className="text-xs text-gray-500">
                                   {formatTimeAgo(nestedReply.created_at)}
                                 </span>
                               </div>
                               <p className="text-xs text-gray-700">{nestedReply.content}</p>
                               <div className="flex items-center gap-2 mt-1">
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   className="h-5 px-1 text-xs"
                                   onClick={() => onVote(nestedReply.id, 'up')}
                                 >
                                   <ArrowUp className="h-3 w-3 mr-1" />
                                   {nestedReply.likes_count}
                                 </Button>
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   className="h-5 px-1 text-xs"
                                   onClick={() => onVote(nestedReply.id, 'down')}
                                 >
                                   <ArrowDown className="h-3 w-3 mr-1" />
                                   {nestedReply.dislikes_count}
                                 </Button>
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                                           
                      {/* Reply form for this comment */}
                       {showCreateComment === reply.id && currentUser && (
                         <div className="mt-3 ml-6 border-l-2 border-gray-200 pl-3 bg-blue-50 p-3 rounded-md border">
                          <div className="flex items-start gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={currentUser.avatar} />
                              <AvatarFallback>{currentUser.first_name?.[0]}{currentUser.last_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <Textarea
                                placeholder="Write a reply..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                rows={2}
                                className="mb-2 text-xs border border-gray-300 rounded"
                              />
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="h-6 px-2 text-xs"
                                  onClick={() => onCreateComment(reply.id)}
                                >
                                  Reply
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-6 px-2 text-xs"
                                  onClick={() => setShowCreateComment(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                   </div>
                 </div>
               ))}
             </div>
           </div>
         )}
      </CardContent>
    </Card>
  )
}
