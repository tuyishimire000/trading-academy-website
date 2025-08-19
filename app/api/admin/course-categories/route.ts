import { NextRequest, NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth/admin"
import { CourseCategory } from "@/lib/sequelize/models"

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, error } = await checkAdminAccess(request)
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const categories = await CourseCategory.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC'], ['name', 'ASC']]
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Course categories fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course categories' },
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
    const { name, description, icon, sort_order } = body

    const category = await CourseCategory.create({
      name,
      description,
      icon,
      sort_order: sort_order || 0,
      is_active: true
    })

    return NextResponse.json({ 
      category,
      message: 'Course category created successfully! 🎉',
      success: true
    })
  } catch (error) {
    console.error('Course category creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create course category' },
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
    const { id, name, description, icon, sort_order, is_active } = body

    const category = await CourseCategory.findByPk(id)
    if (!category) {
      return NextResponse.json(
        { error: 'Course category not found' },
        { status: 404 }
      )
    }

    await category.update({
      name,
      description,
      icon,
      sort_order,
      is_active
    })

    return NextResponse.json({ 
      category,
      message: 'Course category updated successfully! ✨',
      success: true
    })
  } catch (error) {
    console.error('Course category update error:', error)
    return NextResponse.json(
      { error: 'Failed to update course category' },
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
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    const category = await CourseCategory.findByPk(id)
    if (!category) {
      return NextResponse.json(
        { error: 'Course category not found' },
        { status: 404 }
      )
    }

    await category.destroy()

    return NextResponse.json({ 
      message: 'Course category deleted successfully! 🗑️',
      success: true
    })
  } catch (error) {
    console.error('Course category deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete course category' },
      { status: 500 }
    )
  }
}
