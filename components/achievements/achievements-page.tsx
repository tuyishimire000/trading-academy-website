"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  TrendingUp, 
  Gift,
  Crown,
  Zap,
  Flame,
  BookOpen,
  Users,
  MessageSquare,
  TrendingDown,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  ArrowRight,
  Sparkles
} from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { toast } from "@/hooks/use-toast"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points: number
  criteria: any
  is_earned: boolean
  earned_at: string | null
}

interface UserPoints {
  total_points: number
  points_earned: number
  points_spent: number
  current_level: string
}

interface PointsHistory {
  id: string
  points_change: number
  action_type: string
  created_at: string
  achievement?: {
    name: string
    icon: string
  }
  description?: string
}

interface PointsReward {
  id: number
  points_required: number
  reward_type: string
  reward_value: string
  can_claim: boolean
  is_claimed: boolean
}

interface AchievementProgress {
  achievements: Achievement[]
  userPoints: UserPoints
  pointsHistory: PointsHistory[]
  availableRewards: PointsReward[]
  totalAchievements: number
  totalPossibleAchievements: number
}

export function AchievementsPage() {
  const { user } = useAuth()
  const [achievementData, setAchievementData] = useState<AchievementProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (user) {
      fetchAchievements()
    }
  }, [user])

  const fetchAchievements = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/achievements')
      if (response.ok) {
        const data = await response.json()
        setAchievementData(data)
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error)
      toast({
        title: "Error",
        description: "Failed to load achievements",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'legend': return <Crown className="h-5 w-5 text-yellow-500" />
      case 'expert': return <Star className="h-5 w-5 text-purple-500" />
      case 'advanced': return <Zap className="h-5 w-5 text-blue-500" />
      case 'intermediate': return <TrendingUp className="h-5 w-5 text-green-500" />
      case 'beginner+': return <Flame className="h-5 w-5 text-orange-500" />
      case 'beginner': return <BookOpen className="h-5 w-5 text-blue-500" />
      default: return <Circle className="h-5 w-5 text-gray-500" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'legend': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'expert': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'advanced': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'intermediate': return 'bg-green-100 text-green-800 border-green-200'
      case 'beginner+': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'beginner': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getLevelName = (level: string) => {
    switch (level) {
      case 'legend': return 'Legend'
      case 'expert': return 'Expert'
      case 'advanced': return 'Advanced'
      case 'intermediate': return 'Intermediate'
      case 'beginner+': return 'Beginner+'
      case 'beginner': return 'Beginner'
      default: return 'Newcomer'
    }
  }

  const getNextLevelPoints = (currentPoints: number) => {
    if (currentPoints >= 10000) return null
    if (currentPoints >= 5000) return 10000
    if (currentPoints >= 2000) return 5000
    if (currentPoints >= 1000) return 2000
    if (currentPoints >= 500) return 1000
    if (currentPoints >= 100) return 500
    return 100
  }

  const getProgressPercentage = (currentPoints: number, nextLevelPoints: number | null) => {
    if (!nextLevelPoints) return 100
    
    let previousLevel = 0
    if (currentPoints >= 5000) previousLevel = 5000
    else if (currentPoints >= 2000) previousLevel = 2000
    else if (currentPoints >= 1000) previousLevel = 1000
    else if (currentPoints >= 500) previousLevel = 500
    else if (currentPoints >= 100) previousLevel = 100
    else previousLevel = 0

    const range = nextLevelPoints - previousLevel
    const progress = currentPoints - previousLevel
    return Math.min(100, Math.max(0, (progress / range) * 100))
  }

  const getAchievementCategory = (achievement: Achievement) => {
    const name = achievement.name.toLowerCase()
    if (name.includes('course') || name.includes('module') || name.includes('learning')) return 'Learning'
    if (name.includes('forum') || name.includes('community') || name.includes('discord')) return 'Community'
    if (name.includes('trade') || name.includes('portfolio')) return 'Trading'
    if (name.includes('event') || name.includes('session')) return 'Events'
    if (name.includes('subscription') || name.includes('upgrade')) return 'Subscription'
    if (name.includes('points')) return 'Milestones'
    return 'Special'
  }

  const groupAchievementsByCategory = (achievements: Achievement[]) => {
    const grouped: { [key: string]: Achievement[] } = {}
    achievements.forEach(achievement => {
      const category = getAchievementCategory(achievement)
      if (!grouped[category]) grouped[category] = []
      grouped[category].push(achievement)
    })
    return grouped
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!achievementData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto text-center">
          <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Achievements Found</h1>
          <p className="text-gray-600">Start earning achievements by using the platform!</p>
        </div>
      </div>
    )
  }

  const { achievements, userPoints, pointsHistory, availableRewards, totalAchievements, totalPossibleAchievements } = achievementData
  const nextLevelPoints = getNextLevelPoints(userPoints.total_points)
  const progressPercentage = getProgressPercentage(userPoints.total_points, nextLevelPoints)
  const groupedAchievements = groupAchievementsByCategory(achievements)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Achievements & Rewards</h1>
          <p className="text-gray-600 text-lg">Track your progress and unlock exclusive rewards</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Trophy className="h-8 w-8 text-amber-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{totalAchievements}</h3>
                  <p className="text-sm text-gray-600">Achievements Earned</p>
                  <Progress value={(totalAchievements / totalPossibleAchievements) * 100} className="mt-2" />
                  <p className="text-xs text-gray-500 mt-1">{totalPossibleAchievements} total available</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{userPoints.total_points}</h3>
                  <p className="text-sm text-gray-600">Total Points</p>
                  {nextLevelPoints && (
                    <div className="mt-2">
                      <Progress value={progressPercentage} className="mb-1" />
                      <p className="text-xs text-gray-500">{nextLevelPoints - userPoints.total_points} points to next level</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    {getLevelIcon(userPoints.current_level)}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{getLevelName(userPoints.current_level)}</h3>
                  <p className="text-sm text-gray-600">Current Level</p>
                  <Badge variant="outline" className={`mt-2 ${getLevelColor(userPoints.current_level)}`}>
                    Level {userPoints.current_level}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Gift className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {availableRewards.filter(r => r.can_claim && !r.is_claimed).length}
                  </h3>
                  <p className="text-sm text-gray-600">Rewards Available</p>
                  <p className="text-xs text-gray-500 mt-1">Claim your rewards!</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {achievements.filter(a => a.is_earned).slice(0, 3).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {achievements.filter(a => a.is_earned).slice(0, 3).map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <h4 className="font-semibold text-sm">{achievement.name}</h4>
                          <p className="text-xs text-gray-600">+{achievement.points} points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Achievements Yet</h3>
                    <p className="text-gray-600 mb-4">Start completing courses, posting in the community, and trading to earn achievements!</p>
                    <Button onClick={() => setActiveTab('achievements')}>
                      View All Achievements
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {category === 'Learning' && <BookOpen className="h-5 w-5 text-blue-500" />}
                    {category === 'Community' && <Users className="h-5 w-5 text-green-500" />}
                    {category === 'Trading' && <TrendingUp className="h-5 w-5 text-purple-500" />}
                    {category === 'Events' && <Calendar className="h-5 w-5 text-orange-500" />}
                    {category === 'Subscription' && <Crown className="h-5 w-5 text-yellow-500" />}
                    {category === 'Milestones' && <Target className="h-5 w-5 text-red-500" />}
                    {category === 'Special' && <Star className="h-5 w-5 text-indigo-500" />}
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-lg border transition-all duration-200 ${
                          achievement.is_earned
                            ? 'bg-green-50 border-green-200 shadow-sm'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`text-2xl ${achievement.is_earned ? '' : 'opacity-50'}`}>
                            {achievement.icon}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-semibold text-sm ${
                                achievement.is_earned ? 'text-green-800' : 'text-gray-700'
                              }`}>
                                {achievement.name}
                              </h4>
                              {achievement.is_earned && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <p className={`text-xs mb-2 ${
                              achievement.is_earned ? 'text-green-700' : 'text-gray-600'
                            }`}>
                              {achievement.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                +{achievement.points} pts
                              </Badge>
                              {achievement.is_earned && achievement.earned_at && (
                                <span className="text-xs text-green-600">
                                  {new Date(achievement.earned_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-green-500" />
                  Available Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availableRewards.length > 0 ? (
                  <div className="space-y-4">
                    {availableRewards.map((reward) => (
                      <div
                        key={reward.id}
                        className={`p-4 rounded-lg border ${
                          reward.can_claim && !reward.is_claimed
                            ? 'bg-green-50 border-green-200'
                            : reward.is_claimed
                            ? 'bg-gray-50 border-gray-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-white border-2 border-current">
                              <Gift className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {reward.reward_value}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Requires {reward.points_required} points
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {reward.is_claimed ? (
                              <Badge variant="secondary">Claimed</Badge>
                            ) : reward.can_claim ? (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                Claim Reward
                              </Button>
                            ) : (
                              <Badge variant="outline">
                                Need {reward.points_required - userPoints.total_points} more points
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rewards Available</h3>
                    <p className="text-gray-600">Keep earning points to unlock rewards!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Points History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pointsHistory.length > 0 ? (
                  <div className="space-y-3">
                    {pointsHistory.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {entry.achievement ? (
                            <span className="text-xl">{entry.achievement.icon}</span>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-300"></div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {entry.action_type === 'achievement_earned' && entry.achievement
                                ? `Earned "${entry.achievement.name}"`
                                : entry.action_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(entry.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`font-semibold ${
                            entry.points_change > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {entry.points_change > 0 ? '+' : ''}{entry.points_change}
                          </span>
                          <p className="text-xs text-gray-500">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Points History</h3>
                    <p className="text-gray-600">Start earning achievements to see your points history!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
