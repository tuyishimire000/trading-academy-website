"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Search
} from "lucide-react"

interface User {
  id: string
  name: string
  avatar?: string
  role: 'member' | 'moderator' | 'admin'
  joinDate: Date
  postsCount: number
  reputation: number
}

interface Message {
  id: string
  content: string
  author: User
  timestamp: Date
  likes: number
  dislikes: number
  replies: Message[]
  isEdited: boolean
  category: 'general' | 'strategy' | 'analysis' | 'news' | 'help'
}

interface ForumChatProps {
  currentUser: User
}

export function ForumChat({ currentUser }: ForumChatProps) {
  const [activeTab, setActiveTab] = useState('general')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'What\'s everyone\'s thoughts on the current market volatility? I\'m seeing some interesting patterns in the S&P 500.',
      author: {
        id: 'user1',
        name: 'Sarah Johnson',
        role: 'member',
        joinDate: new Date('2024-01-15'),
        postsCount: 45,
        reputation: 120
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      likes: 8,
      dislikes: 1,
      replies: [
        {
          id: '1-1',
          content: 'I\'ve been watching the VIX closely. The current levels suggest we might see a breakout soon.',
          author: {
            id: 'user2',
            name: 'Mike Chen',
            role: 'moderator',
            joinDate: new Date('2023-11-20'),
            postsCount: 156,
            reputation: 340
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 25),
          likes: 5,
          dislikes: 0,
          replies: [],
          isEdited: false,
          category: 'strategy'
        }
      ],
      isEdited: false,
      category: 'general'
    },
    {
      id: '2',
      content: 'Just completed the Advanced Technical Analysis course! The Fibonacci retracement section was incredibly helpful.',
      author: {
        id: 'user3',
        name: 'Alex Rodriguez',
        role: 'member',
        joinDate: new Date('2024-02-01'),
        postsCount: 12,
        reputation: 67
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      likes: 15,
      dislikes: 0,
      replies: [],
      isEdited: false,
      category: 'help'
    }
  ])
  
  const [newMessage, setNewMessage] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const scrollRef = useRef<HTMLDivElement>(null)

  const categories = [
    { id: 'all', name: 'All Topics', icon: MessageCircle },
    { id: 'general', name: 'General Discussion', icon: Users },
    { id: 'strategy', name: 'Trading Strategies', icon: Target },
    { id: 'analysis', name: 'Market Analysis', icon: TrendingUp },
    { id: 'news', name: 'Market News', icon: Calendar },
    { id: 'help', name: 'Help & Support', icon: BookOpen }
  ]

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.author.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || message.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      author: currentUser,
      timestamp: new Date(),
      likes: 0,
      dislikes: 0,
      replies: [],
      isEdited: false,
      category: activeTab as any
    }

    setMessages(prev => [message, ...prev])
    setNewMessage('')
    
    // Scroll to bottom
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleReply = (messageId: string) => {
    if (!replyContent.trim()) return

    const reply: Message = {
      id: `${messageId}-${Date.now()}`,
      content: replyContent,
      author: currentUser,
      timestamp: new Date(),
      likes: 0,
      dislikes: 0,
      replies: [],
      isEdited: false,
      category: 'general'
    }

    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, replies: [...msg.replies, reply] }
        : msg
    ))

    setReplyContent('')
    setReplyTo(null)
  }

  const handleLike = (messageId: string, isReply = false, parentId?: string) => {
    setMessages(prev => prev.map(msg => {
      if (isReply && parentId) {
        if (msg.id === parentId) {
          return {
            ...msg,
            replies: msg.replies.map(reply => 
              reply.id === messageId 
                ? { ...reply, likes: reply.likes + 1 }
                : reply
            )
          }
        }
        return msg
      }
      return msg.id === messageId 
        ? { ...msg, likes: msg.likes + 1 }
        : msg
    }))
  }

  const handleDislike = (messageId: string, isReply = false, parentId?: string) => {
    setMessages(prev => prev.map(msg => {
      if (isReply && parentId) {
        if (msg.id === parentId) {
          return {
            ...msg,
            replies: msg.replies.map(reply => 
              reply.id === messageId 
                ? { ...reply, dislikes: reply.dislikes + 1 }
                : reply
            )
          }
        }
        return msg
      }
      return msg.id === messageId 
        ? { ...msg, dislikes: msg.dislikes + 1 }
        : msg
    }))
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Forum</h2>
          <p className="text-gray-600">Connect with fellow traders and share insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            1,247 members online
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="strategy">Strategies</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="help">Help</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* New Message Input */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                      </Badge>
                    </div>
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      Post Message
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <Card key={message.id}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={message.author.avatar} />
                        <AvatarFallback>{getInitials(message.author.name)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{message.author.name}</span>
                            <Badge variant={message.author.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                              {message.author.role}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatTimestamp(message.timestamp)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Flag className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-gray-900">{message.content}</p>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike(message.id)}
                              className="h-8 px-2"
                            >
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {message.likes}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDislike(message.id)}
                              className="h-8 px-2"
                            >
                              <ThumbsDown className="h-3 w-3 mr-1" />
                              {message.dislikes}
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyTo(message.id)}
                            className="h-8 px-2"
                          >
                            <Reply className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                        </div>

                        {/* Reply Input */}
                        {replyTo === message.id && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex gap-2">
                              <Textarea
                                placeholder="Write a reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="flex-1"
                              />
                              <div className="flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleReply(message.id)}
                                  disabled={!replyContent.trim()}
                                >
                                  <Send className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setReplyTo(null)
                                    setReplyContent('')
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Replies */}
                        {message.replies.length > 0 && (
                          <div className="ml-8 space-y-3 mt-4">
                            {message.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={reply.author.avatar} />
                                  <AvatarFallback>{getInitials(reply.author.name)}</AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{reply.author.name}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {reply.author.role}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {formatTimestamp(reply.timestamp)}
                                    </span>
                                  </div>
                                  
                                  <p className="text-sm text-gray-900 mb-2">{reply.content}</p>
                                  
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleLike(reply.id, true, message.id)}
                                      className="h-6 px-2 text-xs"
                                    >
                                      <ThumbsUp className="h-3 w-3 mr-1" />
                                      {reply.likes}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDislike(reply.id, true, message.id)}
                                      className="h-6 px-2 text-xs"
                                    >
                                      <ThumbsDown className="h-3 w-3 mr-1" />
                                      {reply.dislikes}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
