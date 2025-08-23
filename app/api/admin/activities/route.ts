import { NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth/admin"
import { User, UserCourseProgress, UserSubscription, Event, ForumPost, Course, SubscriptionPlan } from "@/lib/sequelize/models"
import { Op } from "sequelize"

export async function GET(request: Request) {
  try {
    const { isAdmin, user, error } = await checkAdminAccess(request)
    
    if (!isAdmin || error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get recent activities from the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const activities = []

    // Recent user registrations
    const recentUsers = await User.findAll({
      where: {
        created_at: {
          [Op.gte]: sevenDaysAgo
        }
      },
      order: [['created_at', 'DESC']],
      limit: 5
    })

    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user_registration',
        title: 'New user registered',
        description: `${user.first_name || 'User'} ${user.last_name || ''} joined the platform`,
        timestamp: user.created_at,
        user: user.email
      })
    })

    // Recent course progress
          const recentProgress = await UserCourseProgress.findAll({
        where: {
          last_accessed: {
            [Op.gte]: sevenDaysAgo
          },
          progress_percentage: 100
        },
        include: [
          { model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] },
          { model: Course, as: 'course', attributes: ['title'] }
        ],
        order: [['last_accessed', 'DESC']],
        limit: 5
      })

    recentProgress.forEach(progress => {
      activities.push({
        id: `progress-${progress.id}`,
        type: 'course_completed',
        title: 'Course completed',
        description: `${progress.User?.first_name || 'User'} completed ${progress.Course?.title}`,
        timestamp: progress.last_accessed,
        user: progress.User?.email
      })
    })

    // Recent subscriptions
    const recentSubscriptions = await UserSubscription.findAll({
      where: {
        created_at: {
          [Op.gte]: sevenDaysAgo
        },
        status: 'active'
      },
      include: [
        { model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] },
        { model: SubscriptionPlan, as: 'plan', attributes: ['display_name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    })

    recentSubscriptions.forEach(subscription => {
      activities.push({
        id: `subscription-${subscription.id}`,
        type: 'new_subscription',
        title: 'New subscription',
        description: `${subscription.User?.first_name || 'User'} subscribed to ${subscription.SubscriptionPlan?.display_name}`,
        timestamp: subscription.created_at,
        user: subscription.User?.email
      })
    })

    // Recent forum posts
    const recentPosts = await ForumPost.findAll({
      where: {
        created_at: {
          [Op.gte]: sevenDaysAgo
        },
        parent_id: null // Only main posts, not replies
      },
      include: [
        { model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    })

    recentPosts.forEach(post => {
      activities.push({
        id: `post-${post.id}`,
        type: 'forum_post',
        title: 'New forum post',
        description: `${post.User?.first_name || 'User'} created a new post: ${post.title}`,
        timestamp: post.created_at,
        user: post.User?.email
      })
    })

    // Recent events
    const recentEvents = await Event.findAll({
      where: {
        created_at: {
          [Op.gte]: sevenDaysAgo
        }
      },
      include: [
        { model: User, as: 'instructor', attributes: ['first_name', 'last_name', 'email'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    })

    recentEvents.forEach(event => {
      activities.push({
        id: `event-${event.id}`,
        type: 'new_event',
        title: 'New event scheduled',
        description: `${event.instructor?.first_name || 'Instructor'} scheduled: ${event.title}`,
        timestamp: event.created_at,
        user: event.instructor?.email
      })
    })

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Return top 10 most recent activities
    return NextResponse.json({
      activities: activities.slice(0, 10)
    })
  } catch (error) {
    console.error("Admin activities fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
