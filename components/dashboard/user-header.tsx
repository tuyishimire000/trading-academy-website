"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/lib/hooks/use-user"
import { useSubscription } from "@/lib/hooks/use-subscription"
import { MessageCircle, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function UserHeader() {
  const { user, loading: userLoading } = useUser()
  const { subscription, loading: subscriptionLoading } = useSubscription()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
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
  const planName = subscription?.subscription_plans?.display_name || "Free"

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case "pro":
        return "bg-blue-100 text-blue-800"
      case "elite":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome back, {firstName}!</h1>
            <p className="text-gray-600 text-sm sm:text-base">Continue your trading journey</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <Badge variant="secondary" className={`text-xs sm:text-sm ${getPlanColor(planName)}`}>
              {planName} Member
            </Badge>
            <div className="flex space-x-2 w-full sm:w-auto">
              <Button className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none text-sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Join Discord
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
