import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth/server"
import { Course, CourseModule, UserCourseProgress, UserModuleProgress, User } from "@/lib/sequelize/models"
import { Op } from "sequelize"

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    // Verify authentication
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const courseId = params.courseId
    const userId = user.id

    // Fetch course with modules
    const course = await Course.findOne({
      where: { 
        id: courseId,
        is_published: true
      },
      include: [
        {
          model: CourseModule,
          as: 'modules',
          where: { is_published: true },
          required: false
        }
      ],
      order: [
        [{ model: CourseModule, as: 'modules' }, 'sort_order', 'ASC']
      ]
    })

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    // Fetch user progress for this course
    const userProgress = await UserCourseProgress.findOne({
      where: { 
        user_id: userId,
        course_id: courseId
      }
    })

    // Check if user has access to this course based on their subscription
    // For now, let's assume all courses are accessible
    // In a real implementation, you'd check the user's subscription plan against course.required_plan
    const hasAccess = true

    // Get modules with completion status
    const moduleIds = course.modules?.map(module => module.id) || []
    const moduleProgress = moduleIds.length > 0 ? await UserModuleProgress.findAll({
      where: {
        user_id: userId,
        course_id: courseId,
        module_id: { [Op.in]: moduleIds }
      }
    }) : []

    const modulesWithProgress = course.modules?.map(module => {
      const progress = moduleProgress.find(p => p.module_id === module.id)
      return {
        id: module.id,
        title: module.title,
        description: module.description,
        content_type: module.content_type,
        content_url: module.content_url,
        duration: module.duration,
        sort_order: module.sort_order,
        is_published: module.is_published,
        is_completed: progress?.is_completed || false
      }
    }) || []

    const courseData = {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail_url: course.thumbnail_url,
      difficulty_level: course.difficulty_level,
      estimated_duration: course.estimated_duration,
      required_plan: course.required_plan,
      modules: modulesWithProgress,
      userProgress: userProgress ? {
        status: userProgress.status,
        progress_percentage: userProgress.progress_percentage,
        last_accessed: userProgress.last_accessed?.toISOString()
      } : null,
      hasAccess
    }

    return NextResponse.json({
      success: true,
      course: courseData
    })

  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch course",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
