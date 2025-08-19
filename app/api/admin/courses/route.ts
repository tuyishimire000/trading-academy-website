import { NextRequest, NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth/admin"
import { Course, CourseCategory, CourseModule, UserProgress } from "@/lib/sequelize/models"
import { Op } from "sequelize"

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, error } = await checkAdminAccess(request)
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const status = searchParams.get('status') || ''

    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ]
    }
    if (categoryId && categoryId !== 'all') {
      where.category_id = categoryId
    }
    if (status && status !== 'all') {
      where.is_published = status === 'published'
    }

    const courses = await Course.findAndCountAll({
      where,
      include: [
        {
          model: CourseCategory,
          as: 'category',
          attributes: ['id', 'name', 'icon']
        },
        {
          model: CourseModule,
          as: 'modules',
          attributes: ['id', 'title', 'content_type', 'duration', 'is_published']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    })

    // Get enrollment statistics for each course
    const coursesWithStats = await Promise.all(
      courses.rows.map(async (course) => {
        const enrollmentCount = await UserProgress.count({
          where: { course_id: course.id }
        })

        const avgProgress = await UserProgress.findOne({
          where: { course_id: course.id },
          attributes: [
            [UserProgress.sequelize.fn('AVG', UserProgress.sequelize.col('progress_percentage')), 'avgProgress']
          ]
        })

        return {
          ...course.toJSON(),
          enrollmentCount,
          avgProgress: parseFloat(avgProgress?.getDataValue('avgProgress') || '0').toFixed(2)
        }
      })
    )

    return NextResponse.json({
      courses: coursesWithStats,
      pagination: {
        total: courses.count,
        page,
        limit,
        totalPages: Math.ceil(courses.count / limit)
      }
    })
  } catch (error) {
    console.error('Admin courses fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
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
    const {
      category_id,
      title,
      description,
      thumbnail_url,
      difficulty_level,
      estimated_duration,
      required_plan,
      sort_order,
      is_published
    } = body

    // Validate category_id - if it's "all", "none", or empty, set to null
    const validCategoryId = (category_id && category_id !== 'all' && category_id !== 'none') ? category_id : null

    const course = await Course.create({
      category_id: validCategoryId,
      title,
      description,
      thumbnail_url,
      difficulty_level: difficulty_level || 'beginner',
      estimated_duration,
      required_plan: required_plan || 'basic',
      sort_order: sort_order || 0,
      is_published: is_published || false
    })

    return NextResponse.json({ 
      course,
      message: 'Course created successfully! 🎉',
      success: true
    })
  } catch (error) {
    console.error('Admin course creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { isAdmin, error } = await checkAdminAccess(request)
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const body = await request.json()
    const {
      id,
      category_id,
      title,
      description,
      thumbnail_url,
      difficulty_level,
      estimated_duration,
      required_plan,
      sort_order,
      is_published
    } = body

    const course = await Course.findByPk(id)
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Validate category_id - if it's "all", "none", or empty, set to null
    const validCategoryId = (category_id && category_id !== 'all' && category_id !== 'none') ? category_id : null

    await course.update({
      category_id: validCategoryId,
      title,
      description,
      thumbnail_url,
      difficulty_level,
      estimated_duration,
      required_plan,
      sort_order,
      is_published
    })

    return NextResponse.json({ 
      course,
      message: 'Course updated successfully! ✨',
      success: true
    })
  } catch (error) {
    console.error('Admin course update error:', error)
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { isAdmin, error } = await checkAdminAccess(request)
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    const course = await Course.findByPk(id)
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    await course.destroy()

    return NextResponse.json({ 
      message: 'Course deleted successfully! 🗑️',
      success: true
    })
  } catch (error) {
    console.error('Admin course deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    )
  }
}
