import { NextRequest, NextResponse } from "next/server"
import { ForumPost, ForumCategory, User } from "@/lib/sequelize/models"
import { verifyAuth } from "@/lib/auth/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const parentId = searchParams.get('parentId')

    const where: any = {}
    if (categoryId) where.category_id = categoryId
    if (parentId) where.parent_id = parentId
    if (!parentId) where.parent_id = null // Only top-level posts

    const posts = await ForumPost.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: ForumCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 50
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Forum posts fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch forum posts' },
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
    const { categoryId, parentId, title, content } = body

    const post = await ForumPost.create({
      user_id: user.id,
      category_id: categoryId,
      parent_id: parentId || null,
      title: title || null,
      content
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Forum post creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create forum post' },
      { status: 500 }
    )
  }
}
