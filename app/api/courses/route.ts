import { NextRequest, NextResponse } from "next/server"
import { Course, CourseCategory, CourseModule } from "@/lib/sequelize/models"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const includeModules = searchParams.get('includeModules') === 'true'

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
        attributes: ['id', 'title', 'description', 'content_type', 'duration', 'sort_order']
      })
    }

    const courses = await Course.findAll({
      where,
      include,
      order: [['sort_order', 'ASC']]
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error('Courses fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}
