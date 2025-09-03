"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useUser } from "@/lib/hooks/use-user"
import { useSubscription } from "@/lib/hooks/use-subscription"
import { MessageCircle, LogOut, Crown, Star, ArrowUp, Check, X, Lock } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useDisconnect } from "wagmi"

interface SubscriptionPlan {
  id: string
  name: string
  display_name: string
  description: string
  price: number
  billing_cycle: string
  features: {
    features: string[]
  }
}

export function UserHeader() {
  const { user, loading: userLoading } = useUser()
  const { subscription, loading: subscriptionLoading } = useSubscription()
  const [allPlans, setAllPlans] = useState<SubscriptionPlan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [discordLink, setDiscordLink] = useState<string | null>(null)
  const [loadingDiscord, setLoadingDiscord] = useState(false)
  const router = useRouter()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true)
      try {
        const response = await fetch("/api/subscription-plans")
        if (response.ok) {
          const data = await response.json()
          setAllPlans(data.plans || [])
        }
      } catch (error) {
        console.error("Error fetching plans:", error)
      } finally {
        setLoadingPlans(false)
      }
    }

    const fetchDiscordLink = async () => {
      if (!subscription?.plan?.name) return
      
      setLoadingDiscord(true)
      try {
        const response = await fetch("/api/platform-social-links")
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data.links) {
            // Find Discord link that matches user's current plan
            const userPlan = subscription.plan.name
            const matchingDiscordLink = data.data.links.find((link: any) => 
              link.platform === 'discord' && link.required_plan === userPlan
            )
            
            if (matchingDiscordLink) {
              setDiscordLink(matchingDiscordLink.url)
            } else {
              // Fallback to free Discord link if no matching plan found
              const freeDiscordLink = data.data.links.find((link: any) => 
                link.platform === 'discord' && link.required_plan === 'free'
              )
              setDiscordLink(freeDiscordLink?.url || null)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching Discord link:", error)
      } finally {
        setLoadingDiscord(false)
      }
    }

    fetchPlans()
    fetchDiscordLink()
  }, [subscription?.plan?.name])

  const handleSignOut = async () => {
    // Sign out from the application
    await fetch("/api/auth/signout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  if (userLoading || subscriptionLoading) {
    return (
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  const firstName = user?.user_metadata?.first_name || "User"
  const currentPlan = subscription?.plan
  const currentPlanName = currentPlan?.display_name || "Free"
  const currentPlanPrice = currentPlan?.price || 0

  // Find the most expensive plan
  const mostExpensivePlan = allPlans.reduce((max, plan) => 
    plan.price > max.price ? plan : max, 
    allPlans[0] || { price: 0 }
  )

  // Check if user has the most expensive plan
  const hasMostExpensivePlan = currentPlanPrice >= mostExpensivePlan.price

  // Check if user can upgrade (has a plan that's not the most expensive)
  const canUpgrade = currentPlanPrice < mostExpensivePlan.price

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "pro":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "elite":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "basic":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "elite":
        return <Crown className="h-3 w-3" />
      case "pro":
        return <Star className="h-3 w-3" />
      default:
        return null
    }
  }

  const handleUpgrade = (planId: string) => {
    router.push(`/subscription?planId=${planId}`)
    setShowUpgradeDialog(false)
  }

  const handleDiscordClick = () => {
    if (discordLink && currentPlanName !== "Free") {
      window.open(discordLink, '_blank', 'noopener,noreferrer')
    }
  }

  const isFreePlan = currentPlanName === "Free"

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Trading Academy
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">Master the Art of Trading</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`text-xs sm:text-sm border ${getPlanColor(currentPlanName)}`}>
                {getPlanIcon(currentPlanName)}
                {currentPlanName} Member
              </Badge>
              
              {canUpgrade && (
                <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 hover:from-amber-500 hover:to-orange-600"
                    >
                      <ArrowUp className="h-3 w-3 mr-1" />
                      Upgrade
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-amber-500" />
                        Upgrade Your Plan
                      </DialogTitle>
                      <DialogDescription>
                        Unlock more features and maximize your trading potential
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {allPlans
                        .filter(plan => plan.price > currentPlanPrice)
                        .sort((a, b) => a.price - b.price)
                        .map((plan) => (
                          <Card key={plan.id} className="relative">
                            {plan.price === mostExpensivePlan.price && (
                              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                                <Crown className="h-3 w-3 mr-1" />
                                Best Value
                              </Badge>
                            )}
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2">
                                {plan.display_name}
                                {plan.price === mostExpensivePlan.price && (
                                  <Crown className="h-4 w-4 text-amber-500" />
                                )}
                              </CardTitle>
                              <p className="text-sm text-gray-600">{plan.description}</p>
                              <div className="text-2xl font-bold text-gray-900">
                                ${plan.price}
                                <span className="text-sm font-normal text-gray-500">
                                  /{plan.billing_cycle}
                                </span>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <ul className="space-y-2 mb-4">
                                {plan.features?.features?.slice(0, 3).map((feature: string, index: number) => (
                                  <li key={index} className="flex items-center text-sm">
                                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                    {feature}
                                  </li>
                                ))}
                                {plan.features?.features?.length > 3 && (
                                  <li className="text-sm text-gray-500">
                                    +{plan.features.features.length - 3} more features
                                  </li>
                                )}
                              </ul>
                              <Button 
                                onClick={() => handleUpgrade(plan.id)}
                                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white"
                              >
                                Upgrade to {plan.display_name}
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            <div className="flex space-x-2 w-full sm:w-auto">
              <ThemeToggle />
              <Button 
                className={`flex-1 sm:flex-none text-sm ${
                  isFreePlan 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
                onClick={handleDiscordClick}
                disabled={isFreePlan || loadingDiscord}
                title={isFreePlan ? "Upgrade to access VIP Discord" : "Join VIP Discord"}
              >
                {loadingDiscord ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : isFreePlan ? (
                  <Lock className="h-4 w-4 mr-2" />
                ) : (
                  <MessageCircle className="h-4 w-4 mr-2" />
                )}
                Join VIP Discord
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="bg-transparent">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
