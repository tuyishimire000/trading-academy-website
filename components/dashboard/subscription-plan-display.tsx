"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useSubscription } from "@/lib/hooks/use-subscription"
import { Crown, Star, ArrowUp, Check, Calendar, Zap, Shield, Users } from "lucide-react"
import { useRouter } from "next/navigation"

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

export function SubscriptionPlanDisplay() {
  const { subscription, loading } = useSubscription()
  const [allPlans, setAllPlans] = useState<SubscriptionPlan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const router = useRouter()

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

    fetchPlans()
  }, [])

  if (loading || loadingPlans) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentPlan = subscription?.plan
  const currentPlanName = currentPlan?.display_name || "Free"
  const currentPlanPrice = currentPlan?.price || 0
  const currentPlanFeatures = currentPlan?.features?.features || []

  // Find the most expensive plan
  const mostExpensivePlan = allPlans.reduce((max, plan) => 
    plan.price > max.price ? plan : max, 
    allPlans[0] || { price: 0 }
  )

  // Check if user has the most expensive plan
  const hasMostExpensivePlan = currentPlanPrice >= mostExpensivePlan.price

  // Check if user can upgrade (has a plan that's not the most expensive)
  const canUpgrade = currentPlanPrice < mostExpensivePlan.price

  // Get available upgrade plans
  const upgradePlans = allPlans
    .filter(plan => plan.price > currentPlanPrice)
    .sort((a, b) => a.price - b.price)

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "elite":
        return <Crown className="h-5 w-5 text-amber-500" />
      case "pro":
        return <Star className="h-5 w-5 text-blue-500" />
      default:
        return <Shield className="h-5 w-5 text-green-500" />
    }
  }

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "elite":
        return "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
      case "pro":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
      case "basic":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleUpgrade = (planId: string) => {
    router.push(`/subscription?planId=${planId}`)
    setShowUpgradeDialog(false)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getPlanIcon(currentPlanName)}
            Your Subscription Plan
          </CardTitle>
          {hasMostExpensivePlan && (
            <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
              <Crown className="h-3 w-3 mr-1" />
              Premium Member
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Plan Details */}
        <div className="p-4 rounded-lg border bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{currentPlanName}</h3>
            <Badge className={getPlanColor(currentPlanName)}>
              ${currentPlanPrice}/{currentPlan?.billing_cycle || 'month'}
            </Badge>
          </div>
          
          <p className="text-gray-600 text-sm mb-4">
            {currentPlan?.description || "Your current subscription plan"}
          </p>

          {/* Plan Features */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Your Features:</h4>
            <ul className="space-y-1">
              {currentPlanFeatures.slice(0, 5).map((feature: string, index: number) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
              {currentPlanFeatures.length > 5 && (
                <li className="text-sm text-gray-500">
                  +{currentPlanFeatures.length - 5} more features
                </li>
              )}
            </ul>
          </div>

          {/* Subscription Dates */}
          {subscription?.current_period_start && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Started: {formatDate(subscription.current_period_start)}</span>
                </div>
                {subscription?.current_period_end && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Renews: {formatDate(subscription.current_period_end)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Upgrade Section */}
        {canUpgrade && upgradePlans.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <h4 className="font-medium text-gray-900">Upgrade Your Plan</h4>
            </div>
            
            <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white"
                >
                  <ArrowUp className="h-4 w-4 mr-2" />
                  View Upgrade Options
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-500" />
                    Upgrade Your Plan
                  </DialogTitle>
                  <DialogDescription>
                    Unlock more features and maximize your trading potential. Choose the plan that best fits your needs.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {upgradePlans.map((plan) => (
                    <Card key={plan.id} className="relative">
                      {plan.price === mostExpensivePlan.price && (
                        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                          <Crown className="h-3 w-3 mr-1" />
                          Best Value
                        </Badge>
                      )}
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getPlanIcon(plan.name)}
                          {plan.display_name}
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
                          {plan.features?.features?.slice(0, 4).map((feature: string, index: number) => (
                            <li key={index} className="flex items-center text-sm">
                              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                          {plan.features?.features?.length > 4 && (
                            <li className="text-sm text-gray-500">
                              +{plan.features.features.length - 4} more features
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
          </div>
        )}

        {/* Premium Member Benefits */}
        {hasMostExpensivePlan && (
          <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-amber-600" />
              <h4 className="font-medium text-amber-900">Premium Member Benefits</h4>
            </div>
            <p className="text-sm text-amber-800">
              You have access to all premium features including exclusive content, priority support, and advanced trading tools.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

