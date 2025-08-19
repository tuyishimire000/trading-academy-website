import { NextRequest, NextResponse } from "next/server"
import { UserProgress, Course, CourseModule } from "@/lib/sequelize/models"
import { verifyAuth } from "@/lib/auth/server"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const progress = await UserProgress.findAll({
      where: {
        user_id: user.id
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description', 'thumbnail_url', 'difficulty_level', 'estimated_duration']
        },
        {
          model: CourseModule,
          as: 'module',
          attributes: ['id', 'title', 'description', 'content_type', 'duration']
        }
      ],
      order: [['updated_at', 'DESC']]
    })

    return NextResponse.json(progress)
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
    const { courseId, moduleId, progressPercentage } = body

    const [progress, created] = await UserProgress.findOrCreate({
      where: {
        user_id: user.id,
        course_id: courseId,
        module_id: moduleId || null
      },
      defaults: {
        progress_percentage: progressPercentage,
        last_accessed_at: new Date()
      }
    })

    if (!created) {
      await progress.update({
        progress_percentage: progressPercentage,
        last_accessed_at: new Date()
      })
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error('User progress update error:', error)
    return NextResponse.json(
      { error: 'Failed to update user progress' },
      { status: 500 }
    )
  }
}
