import { NextRequest, NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth/admin"
import { SubscriptionPlan, CourseCategory } from "@/lib/sequelize/models"

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, error } = await checkAdminAccess(request)
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 })
    }

    // Fetch subscription plans and course categories for settings
    const [subscriptionPlans, courseCategories] = await Promise.all([
      SubscriptionPlan.findAll({
        order: [['created_at', 'ASC']]
      }),
      CourseCategory.findAll({
        order: [['sort_order', 'ASC']]
      })
    ])

    const settings = {
      subscriptionPlans,
      courseCategories,
      systemInfo: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: 'MySQL',
        features: [
          'User Management',
          'Course Management',
          'Event Management',
          'Community Forum',
          'Portfolio Tracking',
          'Analytics Dashboard'
        ]
      }
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Admin settings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAdmin, error } = await checkAdminAccess(request)
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'updateSubscriptionPlan':
        const { id, ...planData } = data
        const plan = await SubscriptionPlan.findByPk(id)
        if (!plan) {
          return NextResponse.json(
            { error: 'Subscription plan not found' },
            { status: 404 }
          )
        }
        await plan.update(planData)
        return NextResponse.json({ plan })

      case 'updateCourseCategory':
        const { id: categoryId, ...categoryData } = data
        const category = await CourseCategory.findByPk(categoryId)
        if (!category) {
          return NextResponse.json(
            { error: 'Course category not found' },
            { status: 404 }
          )
        }
        await category.update(categoryData)
        return NextResponse.json({ category })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Admin settings update error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
