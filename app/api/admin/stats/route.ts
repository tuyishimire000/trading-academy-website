import { NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth/admin"
import { User, UserSubscription, Course, Event, SubscriptionPlan, CourseModule, ForumPost, UserProgress } from "@/lib/sequelize/models"
import { Op } from "sequelize"

export async function GET(request: Request) {
  try {
    const { isAdmin, user, error } = await checkAdminAccess(request)
    
    if (!isAdmin || error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get total users
    const totalUsers = await User.count()

    // Get active subscriptions
    const activeSubscriptions = await UserSubscription.count({
      where: { status: 'active' }
    })

    // Get total courses
    const totalCourses = await Course.count({
      where: { is_published: true }
    })

    // Get total modules
    const totalModules = await CourseModule.count()

    // Get total forum posts
    const totalPosts = await ForumPost.count()

    // Calculate average progress from user progress
    const userProgresses = await UserProgress.findAll({
      attributes: ['progress_percentage']
    })
    
    const averageProgress = userProgresses.length > 0 
      ? Math.round(userProgresses.reduce((sum, progress) => sum + (progress.progress_percentage || 0), 0) / userProgresses.length)
      : 0

    // Calculate total revenue from active subscriptions
    const activeSubsWithPlans = await UserSubscription.findAll({
      where: { status: 'active' },
      include: [{
        model: SubscriptionPlan,
        as: 'plan',
        attributes: ['price']
      }]
    })
    
    // Calculate total monthly revenue from active subscriptions
    const totalRevenue = activeSubsWithPlans.reduce((sum, sub: any) => {
      const planPrice = sub.plan?.price || 0
      return sum + planPrice
    }, 0)

    // Get upcoming events
    const upcomingEvents = await Event.count({
      where: {
        status: 'scheduled',
        start_time: {
          [Op.gte]: new Date()
        }
      }
    })

    // Get recent signups (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentSignups = await User.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    })

    // Get subscription breakdown
    const subscriptionBreakdown = await UserSubscription.findAll({
      where: { status: 'active' },
      include: [{
        model: SubscriptionPlan,
        as: 'plan',
        attributes: ['name', 'display_name']
      }]
    })

    const planCounts = subscriptionBreakdown.reduce((acc: any, sub: any) => {
      const planName = sub.plan?.display_name || "Unknown"
      acc[planName] = (acc[planName] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      stats: {
        totalUsers,
        activeSubscriptions,
        totalCourses,
        totalModules,
        totalPosts,
        upcomingEvents,
        recentSignups,
        averageProgress,
        totalRevenue,
        subscriptionBreakdown: planCounts,
      },
    })
  } catch (error) {
    console.error("Admin stats fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
