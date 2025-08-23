import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth/server"
import { Course, CourseCategory, CourseModule, UserCourseProgress, UserSubscription, SubscriptionPlan } from "@/lib/sequelize/models"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const includeModules = searchParams.get('includeModules') === 'true'

    // Verify user authentication
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const where: any = {
      is_published: true
    }
    if (categoryId) where.category_id = categoryId

    const include = [
      {
        model: CourseCategory,
        as: 'category',
        attributes: ['id', 'name', 'description', 'icon']
      }
    ]

    if (includeModules) {
      include.push({
        model: CourseModule,
        as: 'modules',
        where: { is_published: true },
        required: false,
        attributes: ['id', 'title', 'content_type', 'duration', 'sort_order']
      })
    }

    // Fetch all published courses
    const courses = await Course.findAll({
      where,
      include,
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
    }).catch(() => [])

    // Fetch user's subscription to determine plan access
    const userSubscription = await UserSubscription.findOne({
      where: { user_id: user.id, status: 'active' },
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['name', 'display_name', 'price']
        }
      ]
    }).catch(() => null)

    // Fetch user's course progress
    const userProgress = await UserCourseProgress.findAll({
      where: { user_id: user.id },
      attributes: ['course_id', 'status', 'progress_percentage', 'last_accessed']
    }).catch(() => [])

    // Create a map of user progress for quick lookup
    const progressMap = new Map()
    userProgress.forEach(progress => {
      progressMap.set(progress.course_id, progress.toJSON())
    })

    // Determine user's current plan level
    const userPlanLevel = userSubscription?.plan?.name || 'free'
    
    // Normalize plan names to handle different variations
    const normalizePlanName = (planName: string) => {
      const normalized = planName.toLowerCase().trim()
      if (normalized.includes('free') || normalized === 'free') return 'free'
      if (normalized.includes('pro') || normalized === 'pro') return 'pro'
      if (normalized.includes('premium') || normalized === 'premium') return 'premium'
      return 'free' // default fallback
    }
    
    const normalizedUserPlan = normalizePlanName(userPlanLevel)
    const planHierarchy = {
      'free': 1,
      'premium': 2,
      'pro': 3
    }
    const userPlanValue = planHierarchy[normalizedUserPlan as keyof typeof planHierarchy] || 1
    


    // Process courses with access control and progress
    const processedCourses = courses.map(course => {
      const courseData = course.toJSON()
      const progress = progressMap.get(course.id)
      
      // Determine if user has access to this course
      const normalizedCoursePlan = normalizePlanName(course.required_plan)
      const coursePlanLevel = planHierarchy[normalizedCoursePlan as keyof typeof planHierarchy] || 1
      const hasAccess = userPlanValue >= coursePlanLevel
      


      return {
        ...courseData,
        userProgress: progress ? {
          status: progress.status,
          progress_percentage: progress.progress_percentage,
          last_accessed: progress.last_accessed
        } : null,
        hasAccess,
        userPlanLevel: normalizedUserPlan,
        coursePlanLevel,
        isLocked: !hasAccess
      }
    })

    return NextResponse.json({
      courses: processedCourses,
      userPlan: normalizedUserPlan,
      totalCourses: processedCourses.length,
      accessibleCourses: processedCourses.filter(c => c.hasAccess).length,
      lockedCourses: processedCourses.filter(c => !c.hasAccess).length
    })

  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}
