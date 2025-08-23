import { NextRequest, NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth/admin"
import {
  User,
  Course,
  CourseModule,
  UserCourseProgress,
  Event,
  Notification,
  ForumPost,
  PortfolioPosition,
  PortfolioTrade,
  UserSubscription,
  SubscriptionPlan
} from "@/lib/sequelize/models"
import { Op } from "sequelize"

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, error } = await checkAdminAccess(request)
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 })
    }

    // Get date ranges for analytics
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)

    // Generate date labels for the last 6 months
    const generateDateLabels = () => {
      const labels = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))
      }
      return labels
    }

    const dateLabels = generateDateLabels()

    // Fetch comprehensive analytics data
    const [
      totalUsers,
      newUsersThisMonth,
      totalCourses,
      totalModules,
      totalEvents,
      totalPosts,
      totalSubscriptions,
      activeSubscriptions,
      totalPortfolioPositions,
      totalTrades,
      userProgressStats,
      subscriptionStats,
      monthlyUserGrowth,
      monthlyRevenue,
      monthlyCourseParticipation,
      forumSentiment
    ] = await Promise.all([
      // Basic counts
      User.count(),
      User.count({
        where: {
          created_at: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      }),
      Course.count(),
      CourseModule.count(),
      Event.count({ where: { status: 'scheduled' } }),
      ForumPost.count(),
      UserSubscription.count(),
      UserSubscription.count({ where: { status: 'active' } }),
      PortfolioPosition.count(),
      PortfolioTrade.count(),

      // User progress statistics
      UserCourseProgress.findAll({
        attributes: [
          [UserCourseProgress.sequelize.fn('AVG', UserCourseProgress.sequelize.col('user_course_progress.progress_percentage')), 'avgProgress'],
          [UserCourseProgress.sequelize.fn('COUNT', UserCourseProgress.sequelize.col('user_course_progress.id')), 'totalProgress']
        ]
      }),

      // Subscription plan statistics
      SubscriptionPlan.findAll({
        include: [{
          model: UserSubscription,
          as: 'subscriptions',
          attributes: []
        }],
        attributes: [
          'name',
          'display_name',
          'price',
          [UserSubscription.sequelize.fn('COUNT', UserSubscription.sequelize.col('subscriptions.id')), 'subscriberCount']
        ],
        group: ['subscription_plans.id', 'subscription_plans.name', 'subscription_plans.display_name', 'subscription_plans.price']
      }),

      // Monthly user growth data
      User.findAll({
        attributes: [
          [User.sequelize.fn('DATE_FORMAT', User.sequelize.col('users.created_at'), '%Y-%m'), 'month'],
          [User.sequelize.fn('COUNT', User.sequelize.col('users.id')), 'count']
        ],
        where: {
          created_at: {
            [Op.gte]: sixMonthsAgo
          }
        },
        group: [User.sequelize.fn('DATE_FORMAT', User.sequelize.col('users.created_at'), '%Y-%m')],
        order: [[User.sequelize.fn('DATE_FORMAT', User.sequelize.col('users.created_at'), '%Y-%m'), 'ASC']]
      }),

      // Monthly revenue data - we'll calculate this differently since UserSubscription doesn't have amount
      UserSubscription.findAll({
        include: [{
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['price']
        }],
        attributes: [
          [UserSubscription.sequelize.fn('DATE_FORMAT', UserSubscription.sequelize.col('user_subscriptions.created_at'), '%Y-%m'), 'month'],
          [UserSubscription.sequelize.fn('COUNT', UserSubscription.sequelize.col('user_subscriptions.id')), 'subscriptionCount']
        ],
        where: {
          created_at: {
            [Op.gte]: sixMonthsAgo
          },
          status: 'active'
        },
        group: [UserSubscription.sequelize.fn('DATE_FORMAT', UserSubscription.sequelize.col('user_subscriptions.created_at'), '%Y-%m')],
        order: [[UserSubscription.sequelize.fn('DATE_FORMAT', UserSubscription.sequelize.col('user_subscriptions.created_at'), '%Y-%m'), 'ASC']]
      }),

      // Monthly course participation data
      UserCourseProgress.findAll({
        attributes: [
          [UserCourseProgress.sequelize.fn('DATE_FORMAT', UserCourseProgress.sequelize.col('user_course_progress.last_accessed'), '%Y-%m'), 'month'],
          [UserCourseProgress.sequelize.fn('COUNT', UserCourseProgress.sequelize.col('user_course_progress.id')), 'participations'],
          [UserCourseProgress.sequelize.fn('AVG', UserCourseProgress.sequelize.col('user_course_progress.progress_percentage')), 'avgProgress']
        ],
        where: {
          last_accessed: {
            [Op.gte]: sixMonthsAgo
          }
        },
        group: [UserCourseProgress.sequelize.fn('DATE_FORMAT', UserCourseProgress.sequelize.col('user_course_progress.last_accessed'), '%Y-%m')],
        order: [[UserCourseProgress.sequelize.fn('DATE_FORMAT', UserCourseProgress.sequelize.col('user_course_progress.last_accessed'), '%Y-%m'), 'ASC']]
      }),

      // Forum sentiment analysis (mock data for now, will be replaced with AI integration)
      ForumPost.findAll({
        attributes: [
          [ForumPost.sequelize.fn('DATE_FORMAT', ForumPost.sequelize.col('forum_posts.created_at'), '%Y-%m'), 'month'],
          [ForumPost.sequelize.fn('COUNT', ForumPost.sequelize.col('forum_posts.id')), 'totalPosts']
        ],
        where: {
          created_at: {
            [Op.gte]: sixMonthsAgo
          }
        },
        group: [ForumPost.sequelize.fn('DATE_FORMAT', ForumPost.sequelize.col('forum_posts.created_at'), '%Y-%m')],
        order: [[ForumPost.sequelize.fn('DATE_FORMAT', ForumPost.sequelize.col('forum_posts.created_at'), '%Y-%m'), 'ASC']]
      })
    ])

    // Process monthly user growth data
    const userGrowthData = dateLabels.map(label => {
      const monthData = monthlyUserGrowth.find((item: any) => {
        const itemMonth = new Date(item.getDataValue('month') + '-01')
        return itemMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) === label
      })
      return {
        month: label,
        users: parseInt(monthData?.getDataValue('count') || '0')
      }
    })

    // Process monthly revenue data
    const revenueData = dateLabels.map(label => {
      const monthData = monthlyRevenue.find((item: any) => {
        const itemMonth = new Date(item.getDataValue('month') + '-01')
        return itemMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) === label
      })
      
      // Calculate revenue based on subscription plans
      let calculatedRevenue = 0
      if (monthData) {
        const subscriptionCount = parseInt(monthData.getDataValue('subscriptionCount') || '0')
        // For now, use average subscription price - in real implementation, you'd calculate per plan
        const avgSubscriptionPrice = 49.99 // Average of Basic ($0), Premium ($29.99), Pro ($99.99)
        calculatedRevenue = subscriptionCount * avgSubscriptionPrice
      }
      
      return {
        month: label,
        revenue: calculatedRevenue
      }
    })

    // Process monthly course participation data
    const courseParticipationData = dateLabels.map(label => {
      const monthData = monthlyCourseParticipation.find((item: any) => {
        const itemMonth = new Date(item.getDataValue('month') + '-01')
        return itemMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) === label
      })
      return {
        month: label,
        participations: parseInt(monthData?.getDataValue('participations') || '0'),
        avgProgress: parseFloat(monthData?.getDataValue('avgProgress') || '0')
      }
    })

    // Process forum sentiment data (mock sentiment analysis)
    const sentimentData = dateLabels.map(label => {
      const monthData = forumSentiment.find((item: any) => {
        const itemMonth = new Date(item.getDataValue('month') + '-01')
        return itemMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) === label
      })
      const totalPosts = parseInt(monthData?.getDataValue('totalPosts') || '0')
      
      // Mock sentiment analysis (will be replaced with AI integration)
      const positivePosts = Math.floor(totalPosts * 0.6) // 60% positive
      const negativePosts = Math.floor(totalPosts * 0.2) // 20% negative
      const neutralPosts = totalPosts - positivePosts - negativePosts // 20% neutral
      
      return {
        month: label,
        totalPosts,
        positive: positivePosts,
        negative: negativePosts,
        neutral: neutralPosts,
        sentimentScore: ((positivePosts - negativePosts) / totalPosts * 100) || 0
      }
    })

    // Calculate additional metrics
    const avgProgress = userProgressStats[0]?.getDataValue('avgProgress') || 0
    const totalProgressEntries = userProgressStats[0]?.getDataValue('totalProgress') || 0

    // Format subscription stats
    const subscriptionPlanStats = subscriptionStats.map((plan: any) => ({
      name: plan.name,
      displayName: plan.display_name,
      price: parseFloat(plan.price || 0),
      subscriberCount: parseInt(plan.getDataValue('subscriberCount') || '0')
    }))

    // Calculate total revenue
    const totalRevenue = subscriptionPlanStats.reduce((total, plan) => {
      return total + (plan.price * plan.subscriberCount)
    }, 0)

    const analytics = {
      overview: {
        totalUsers,
        newUsersThisMonth,
        totalCourses,
        totalModules,
        totalEvents,
        totalPosts,
        totalSubscriptions,
        activeSubscriptions,
        totalPortfolioPositions,
        totalTrades,
        totalRevenue: totalRevenue.toFixed(2)
      },
      userEngagement: {
        averageProgress: parseFloat(avgProgress).toFixed(2),
        totalProgressEntries,
        activeUsersPercentage: ((activeSubscriptions / totalUsers) * 100).toFixed(2)
      },
      subscriptionPlans: subscriptionPlanStats,
      charts: {
        userGrowth: userGrowthData,
        revenueGrowth: revenueData,
        courseParticipation: courseParticipationData,
        forumSentiment: sentimentData
      },
      recentActivity: {
        newUsers: newUsersThisMonth,
        activeSubscriptions,
        totalPosts
      }
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Admin analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
