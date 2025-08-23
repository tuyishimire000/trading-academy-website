import { NextRequest, NextResponse } from "next/server"
import { UserCourseProgress, Course } from "@/lib/sequelize/models"
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
    const { courseId, moduleId, progressPercentage } = body

    const [progress, created] = await UserCourseProgress.findOrCreate({
      where: {
        user_id: user.id,
        course_id: courseId
      },
      defaults: {
        progress_percentage: progressPercentage,
        status: progressPercentage === 100 ? 'completed' : progressPercentage > 0 ? 'in_progress' : 'not_started',
        last_accessed: new Date()
      }
    })

    if (!created) {
      await progress.update({
        progress_percentage: progressPercentage,
        status: progressPercentage === 100 ? 'completed' : progressPercentage > 0 ? 'in_progress' : 'not_started',
        last_accessed: new Date()
      })
    }

    return NextResponse.json({ progress })
  } catch (error) {
    console.error('User progress update error:', error)
    return NextResponse.json(
      { error: 'Failed to update user progress' },
      { status: 500 }
    )
  }
}
