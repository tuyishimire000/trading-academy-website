"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoPlayer } from "@/components/course/video-player"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { QuizSystem } from "@/components/course/quiz-system"
import { ForumChat } from "@/components/community/forum-chat"
import { PortfolioTracker } from "@/components/portfolio/portfolio-tracker"
import { 
  Play, 
  Bell, 
  BookOpen, 
  MessageCircle, 
  BarChart3,
  Star,
  ArrowRight,
  CheckCircle
} from "lucide-react"

export default function FeaturesDemoPage() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)

  const demoQuiz = {
    id: 'demo-quiz',
    title: 'Trading Fundamentals Quiz',
    description: 'Test your knowledge of basic trading concepts',
    timeLimit: 10,
    passingScore: 70,
    questions: [
      {
        id: '1',
        type: 'multiple-choice',
        question: 'What is a "bull market"?',
        options: [
          'A market where prices are falling',
          'A market where prices are rising',
          'A market with high volatility',
          'A market with low trading volume'
        ],
        correctAnswer: 'A market where prices are rising',
        explanation: 'A bull market is characterized by rising prices and optimistic investor sentiment.',
        points: 10
      },
      {
        id: '2',
        type: 'multiple-select',
        question: 'Which of the following are common technical indicators?',
        options: [
          'Moving Average',
          'Relative Strength Index (RSI)',
          'Price-to-Earnings Ratio',
          'MACD',
          'Bollinger Bands'
        ],
        correctAnswer: ['Moving Average', 'Relative Strength Index (RSI)', 'MACD', 'Bollinger Bands'],
        explanation: 'P/E ratio is a fundamental indicator, while the others are technical indicators.',
        points: 15
      },
      {
        id: '3',
        type: 'true-false',
        question: 'Diversification helps reduce portfolio risk.',
        correctAnswer: 'true',
        explanation: 'Diversification spreads risk across different assets, reducing overall portfolio volatility.',
        points: 10
      }
    ]
  }

  const features = [
    {
      id: 'video-player',
      title: 'Interactive Video Player',
      description: 'Advanced video player with progress tracking, bookmarks, and playback controls',
      icon: Play,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      demo: (
        <VideoPlayer
          videoUrl="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
          title="Introduction to Technical Analysis"
          description="Learn the basics of technical analysis and chart patterns"
          duration={1800}
          courseId="demo-course"
          moduleId="demo-module"
          onProgressUpdate={(progress) => console.log('Progress:', progress)}
        />
      )
    },
    {
      id: 'notifications',
      title: 'Real-time Notifications',
      description: 'Comprehensive notification system for course updates, events, and achievements',
      icon: Bell,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      demo: (
        <div className="text-center">
          <Button onClick={() => setShowNotifications(true)}>
            <Bell className="h-4 w-4 mr-2" />
            Open Notification Center
          </Button>
        </div>
      )
    },
    {
      id: 'quiz-system',
      title: 'Interactive Quiz System',
      description: 'Comprehensive assessment system with multiple question types and detailed feedback',
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      demo: (
        <div className="text-center">
          <Button onClick={() => setShowQuiz(true)}>
            <BookOpen className="h-4 w-4 mr-2" />
            Start Demo Quiz
          </Button>
        </div>
      )
    },
    {
      id: 'community',
      title: 'Community Forum',
      description: 'Real-time community chat with categories, search, and user interactions',
      icon: MessageCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      demo: (
        <div className="h-96 overflow-hidden rounded-lg border">
          <ForumChat
            currentUser={{
              id: 'demo-user',
              name: 'Demo User',
              role: 'member',
              joinDate: new Date(),
              postsCount: 5,
              reputation: 25
            }}
          />
        </div>
      )
    },
    {
      id: 'portfolio',
      title: 'Portfolio Tracker',
      description: 'Advanced portfolio analytics with charts, performance metrics, and trade history',
      icon: BarChart3,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      demo: (
        <div className="h-96 overflow-hidden rounded-lg border">
          <PortfolioTracker />
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Features Demo</h1>
              <p className="text-gray-600 mt-2">
                Explore the advanced features of Prime Aura Trading Academy
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              Premium Features
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Feature Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">New Features Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <Card key={feature.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${feature.bgColor}`}>
                      <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Demo
                    <ArrowRight className="h-3 w-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Interactive Demos */}
        <Tabs defaultValue="video-player" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="video-player">Video Player</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="quiz-system">Quiz System</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>

          {features.map((feature) => (
            <TabsContent key={feature.id} value={feature.id} className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${feature.bgColor}`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {feature.demo}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Benefits Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why These Features Matter</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Enhanced Learning</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Interactive video player with bookmarks and progress tracking ensures better retention and engagement.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Community Building</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Real-time forum and chat system fosters collaboration and knowledge sharing among traders.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Performance Tracking</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Comprehensive portfolio analytics help users track progress and improve trading strategies.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Assessment & Feedback</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Interactive quiz system with detailed feedback ensures proper knowledge validation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Real-time Updates</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Notification system keeps users informed about new content, events, and achievements.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Professional Tools</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Portfolio tracker with advanced analytics provides professional-grade trading insights.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />

      {/* Quiz Modal */}
      {showQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <QuizSystem
              quiz={demoQuiz}
              onComplete={(score, passed) => {
                console.log('Quiz completed:', { score, passed })
                setShowQuiz(false)
              }}
              onClose={() => setShowQuiz(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
