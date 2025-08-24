import { NextRequest, NextResponse } from "next/server"
import { UserCourseProgress, UserModuleProgress, Course, CourseModule } from "@/lib/sequelize/models"
import { verifyAuth } from "@/lib/auth/server"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const progress = await UserCourseProgress.findAll({
      where: {
        user_id: user.id
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description', 'thumbnail_url', 'difficulty_level', 'estimated_duration']
        }
      ],
      order: [['last_accessed', 'DESC']]
    })

    return NextResponse.json({ progress })
  } catch (error) {
    console.error('User progress fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user progress' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { courseId, moduleId, action, progressPercentage } = body

    if (action === 'complete_module' && moduleId) {
      // Handle module completion
      const [moduleProgress, created] = await UserModuleProgress.findOrCreate({
        where: {
          user_id: user.id,
          course_id: courseId,
          module_id: moduleId
        },
        defaults: {
          is_completed: true,
          completed_at: new Date(),
          last_accessed: new Date()
        }
      })

      if (!created) {
        await moduleProgress.update({
          is_completed: true,
          completed_at: new Date(),
          last_accessed: new Date()
        })
      }

      // Update overall course progress
      const completedModules = await UserModuleProgress.count({
        where: {
          user_id: user.id,
          course_id: courseId,
          is_completed: true
        }
      })

      const totalModules = await CourseModule.count({
        where: {
          course_id: courseId,
          is_published: true
        }
      })

      const newProgressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0

      const [courseProgress, courseCreated] = await UserCourseProgress.findOrCreate({
        where: {
          user_id: user.id,
          course_id: courseId
        },
        defaults: {
          progress_percentage: newProgressPercentage,
          status: newProgressPercentage === 100 ? 'completed' : 'in_progress',
          last_accessed: new Date()
        }
      })

      if (!courseCreated) {
        await courseProgress.update({
          progress_percentage: newProgressPercentage,
          status: newProgressPercentage === 100 ? 'completed' : 'in_progress',
          last_accessed: new Date()
        })
      }

      return NextResponse.json({ 
        success: true,
        moduleProgress,
        courseProgress,
        completedModules,
        totalModules,
        progressPercentage: newProgressPercentage
      })
    } else {
      // Handle general progress update
      const [progress, created] = await UserCourseProgress.findOrCreate({
        where: {
          user_id: user.id,
          course_id: courseId
        },
        defaults: {
          progress_percentage: progressPercentage || 0,
          status: progressPercentage === 100 ? 'completed' : progressPercentage > 0 ? 'in_progress' : 'not_started',
          last_accessed: new Date()
        }
      })

      if (!created) {
        await progress.update({
          progress_percentage: progressPercentage || 0,
          status: progressPercentage === 100 ? 'completed' : progressPercentage > 0 ? 'in_progress' : 'not_started',
          last_accessed: new Date()
        })
      }

      return NextResponse.json({ success: true, progress })
    }
  } catch (error) {
    console.error('User progress update error:', error)
    return NextResponse.json(
      { error: 'Failed to update user progress' },
      { status: 500 }
    )
  }
}
