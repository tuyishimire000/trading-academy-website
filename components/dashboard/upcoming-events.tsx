"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEvents } from "@/lib/hooks/use-events"
import { useSubscription } from "@/lib/hooks/use-subscription"
import { formatDateTime } from "@/lib/utils/format"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Users, BookOpen, ExternalLink, UserCheck, UserPlus, Loader2, Lock, ArrowUp, Crown, Check } from "lucide-react"

export function UpcomingEvents() {
  const { events, loading } = useEvents()
  const [joiningEvents, setJoiningEvents] = useState<Set<string>>(new Set())
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [selectedRequiredPlan, setSelectedRequiredPlan] = useState<string>("")
  const [availablePlans, setAvailablePlans] = useState<any[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const { toast } = useToast()
  const { subscription } = useSubscription()
  const router = useRouter()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "live_session":
        return <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
      case "webinar":
        return <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
      case "workshop":
        return <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
      default:
        return <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
    }
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "live_session":
        return "bg-green-100"
      case "webinar":
        return "bg-blue-100"
      case "workshop":
        return "bg-purple-100"
      default:
        return "bg-gray-100"
    }
  }

  // Helper function to get plan display name
  const getPlanDisplayName = (planName: string) => {
    const planNames: { [key: string]: string } = {
      'basic': 'Basic',
      'pro': 'Pro',
      'elite': 'Elite'
    }
    return planNames[planName] || planName
  }

  // Handle upgrade button click
  const handleUpgrade = async (requiredPlan: string) => {
    setSelectedRequiredPlan(requiredPlan)
    setLoadingPlans(true)
    setShowUpgradeDialog(true)
    
    try {
      // Fetch all plans to find available upgrade options
      const response = await fetch("/api/subscription-plans")
      if (response.ok) {
        const data = await response.json()
        // Find the required plan for this event
        const eventRequiredPlan = data.plans.find((plan: any) => plan.name === requiredPlan)
        const requiredPlanPrice = eventRequiredPlan?.price || 0
        
        // Filter plans that meet or exceed the event's required plan level
        const upgradePlans = data.plans
          .filter((plan: any) => plan.price >= requiredPlanPrice)
          .sort((a: any, b: any) => a.price - b.price)
        
        setAvailablePlans(upgradePlans)
      } else {
        toast({
          title: "Error",
          description: "Failed to load upgrade options",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load upgrade options",
        variant: "destructive",
      })
    } finally {
      setLoadingPlans(false)
    }
  }

  // Handle plan selection from modal
  const handlePlanSelection = (plan: any) => {
    setShowUpgradeDialog(false)
    router.push(`/subscription?planId=${plan.id}`)
  }

  const handleJoinEvent = async (eventId: string) => {
    setJoiningEvents(prev => new Set(prev).add(eventId))
    
    try {
      const response = await fetch("/api/events/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Coming Soon!",
          description: data.message || "Event registration feature is coming soon!",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to join event",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join event",
        variant: "destructive",
      })
    } finally {
      setJoiningEvents(prev => {
        const newSet = new Set(prev)
        newSet.delete(eventId)
        return newSet
      })
    }
  }

  const handleLeaveEvent = async (eventId: string) => {
    setJoiningEvents(prev => new Set(prev).add(eventId))
    
    try {
      const response = await fetch(`/api/events/join?eventId=${eventId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Coming Soon!",
          description: data.message || "Event unregistration feature is coming soon!",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to leave event",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave event",
        variant: "destructive",
      })
    } finally {
      setJoiningEvents(prev => {
        const newSet = new Set(prev)
        newSet.delete(eventId)
        return newSet
      })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Upcoming Events
            </CardTitle>
            {subscription?.subscription_plans && (
              <Badge variant="outline" className="text-xs">
                Your Plan: {getPlanDisplayName(subscription.subscription_plans.name)}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-4">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No upcoming events</p>
            </div>
          ) : (
            events.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-start space-x-3 group">
                <div className={`p-1 rounded flex-shrink-0 ${getEventColor(event.event_type)}`}>
                  {getEventIcon(event.event_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-xs sm:text-sm truncate">{event.title}</p>
                        {event.isUserRegistered && (
                          <Badge variant="secondary" className="text-xs">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Joined
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{formatDateTime(event.start_time)}</p>
                      {event.instructor && (
                        <p className="text-xs text-gray-500">
                          Instructor: {event.instructor.first_name} {event.instructor.last_name}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={event.hasAccess ? "default" : "secondary"} 
                          className={`text-xs ${event.hasAccess ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}
                        >
                          {getPlanDisplayName(event.required_plan)} Plan Required
                          {event.hasAccess ? (
                            <span className="ml-1">✓</span>
                          ) : (
                            <span className="ml-1">🔒</span>
                          )}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {event.participantCount} participants
                        </Badge>
                        {event.max_participants && (
                          <span className="text-xs text-gray-500">
                            Max: {event.max_participants}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-2">
                      {event.isUserRegistered ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => handleLeaveEvent(event.id)}
                          disabled={joiningEvents.has(event.id)}
                        >
                          {joiningEvents.has(event.id) ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <UserCheck className="h-3 w-3 mr-1" />
                              Leave
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => event.hasAccess ? handleJoinEvent(event.id) : handleUpgrade(event.required_plan)}
                          disabled={joiningEvents.has(event.id)}
                          variant={event.hasAccess ? "default" : "outline"}
                          className={`text-xs ${event.hasAccess ? '' : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 hover:from-amber-500 hover:to-orange-600'}`}
                        >
                          {joiningEvents.has(event.id) ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : event.hasAccess ? (
                            <>
                              <UserPlus className="h-3 w-3 mr-1" />
                              Join
                            </>
                          ) : (
                            <>
                              <ArrowUp className="h-3 w-3 mr-1" />
                              Upgrade
                            </>
                          )}
                        </Button>
                      )}
                      {event.meeting_url && event.isUserRegistered && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs"
                          onClick={() => window.open(event.meeting_url, "_blank")}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUp className="h-5 w-5 text-amber-500" />
            Upgrade to Access Premium Events
          </DialogTitle>
          <DialogDescription>
            Upgrade your plan to access exclusive events and unlock more premium content
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-amber-600" />
              <span className="font-semibold text-amber-800">Event Access</span>
            </div>
            <p className="text-sm text-amber-700">
              This event requires a <strong>{getPlanDisplayName(selectedRequiredPlan)}</strong> plan or higher. 
              Upgrade now to join this and other premium events!
            </p>
          </div>

          {loadingPlans ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              <span className="ml-2 text-gray-600">Loading upgrade options...</span>
            </div>
          ) : availablePlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePlans.map((plan) => (
                <Card key={plan.id} className="border-amber-200 bg-amber-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {plan.name === 'elite' ? (
                        <Crown className="h-4 w-4 text-amber-500" />
                      ) : (
                        <ArrowUp className="h-4 w-4 text-amber-500" />
                      )}
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
                      onClick={() => handlePlanSelection(plan)}
                      className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white"
                    >
                      Upgrade to {plan.display_name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No upgrade options available at the moment.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
