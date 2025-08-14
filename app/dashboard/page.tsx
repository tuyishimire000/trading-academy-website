"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CardDescription } from "@/components/ui/card"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { CourseProgress } from "@/components/dashboard/course-progress"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"
import { UserHeader } from "@/components/dashboard/user-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Users, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      try {
        console.log("Dashboard - Checking authentication...")

        // First try to get the current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        console.log("Dashboard - Session check:", {
          hasSession: !!session,
          userId: session?.user?.id,
          error: sessionError?.message,
        })

        if (sessionError) {
          console.error("Dashboard - Session error:", sessionError)
          if (mounted) {
            router.push("/login")
          }
          return
        }

        if (!session) {
          console.log("Dashboard - No session found")
          // Try to refresh the session
          const {
            data: { session: refreshedSession },
            error: refreshError,
          } = await supabase.auth.refreshSession()

          if (refreshError || !refreshedSession) {
            console.log("Dashboard - No session after refresh, redirecting to login")
            if (mounted) {
              router.push("/login")
            }
            return
          }

          console.log("Dashboard - Session refreshed successfully")
          if (mounted) {
            setUser(refreshedSession.user)
          }
        } else {
          console.log("Dashboard - User authenticated:", session.user.email)
          if (mounted) {
            setUser(session.user)
          }
        }
      } catch (error) {
        console.error("Dashboard - Exception:", error)
        if (mounted) {
          router.push("/login")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Dashboard - Auth state change:", event, !!session)

      if (!mounted) return

      if (event === "SIGNED_OUT" || !session) {
        setUser(null)
        router.push("/login")
      } else if (event === "SIGNED_IN" && session) {
        setUser(session.user)
        setLoading(false)
      } else if (event === "TOKEN_REFRESHED" && session) {
        setUser(session.user)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router, supabase.auth])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to access the dashboard</p>
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <CourseProgress />

            {/* Latest Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Latest Content</CardTitle>
                <CardDescription className="text-sm">New materials added this week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">New content is added regularly</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Join our Discord community to get notified about new courses and materials
                  </p>
                  <Button className="bg-[#5865F2] hover:bg-[#4752C4]">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Join Discord
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            <UpcomingEvents />

            {/* Community Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Community Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">
                    Join our Discord community to see the latest discussions and connect with fellow traders.
                  </p>
                  <Button className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Join Discord Server
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
