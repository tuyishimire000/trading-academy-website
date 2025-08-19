import { NextRequest, NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth/admin"
import { CourseModule, Course } from "@/lib/sequelize/models"

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, error } = await checkAdminAccess(request)
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    const modules = await CourseModule.findAll({
      where: { course_id: courseId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ],
      order: [['sort_order', 'ASC']]
    })

    return NextResponse.json({ modules })
  } catch (error) {
    console.error('Course modules fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course modules' },
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
      course_id,
      title,
      description,
      content_type,
      content_url,
      duration,
      sort_order,
      is_published
    } = body

    const module = await CourseModule.create({
      course_id,
      title,
      description,
      content_type: content_type || 'video',
      content_url,
      duration,
      sort_order: sort_order || 0,
      is_published: is_published || false
    })

    return NextResponse.json({ 
      module,
      message: 'Course module created successfully! 🎉',
      success: true
    })
  } catch (error) {
    console.error('Course module creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create course module' },
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
      course_id,
      title,
      description,
      content_type,
      content_url,
      duration,
      sort_order,
      is_published
    } = body

    const module = await CourseModule.findByPk(id)
    if (!module) {
      return NextResponse.json(
        { error: 'Course module not found' },
        { status: 404 }
      )
    }

    await module.update({
      course_id,
      title,
      description,
      content_type,
      content_url,
      duration,
      sort_order,
      is_published
    })

    return NextResponse.json({ 
      module,
      message: 'Course module updated successfully! ✨',
      success: true
    })
  } catch (error) {
    console.error('Course module update error:', error)
    return NextResponse.json(
      { error: 'Failed to update course module' },
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
        { error: 'Module ID is required' },
        { status: 400 }
      )
    }

    const module = await CourseModule.findByPk(id)
    if (!module) {
      return NextResponse.json(
        { error: 'Course module not found' },
        { status: 404 }
      )
    }

    await module.destroy()

    return NextResponse.json({ 
      message: 'Course module deleted successfully! 🗑️',
      success: true
    })
  } catch (error) {
    console.error('Course module deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete course module' },
      { status: 500 }
    )
  }
}
