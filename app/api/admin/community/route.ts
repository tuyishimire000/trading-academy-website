import { NextRequest, NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth/admin"
import { ForumPost, ForumCategory, User } from "@/lib/sequelize/models"
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
    const type = searchParams.get('type') || '' // 'posts' or 'replies'

    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ]
    }
    if (categoryId) {
      where.category_id = categoryId
    }
    if (type === 'posts') {
      where.parent_id = null
    } else if (type === 'replies') {
      where.parent_id = { [Op.ne]: null }
    }

    const posts = await ForumPost.findAndCountAll({
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
      limit,
      offset
    })

    return NextResponse.json({
      posts: posts.rows,
      pagination: {
        total: posts.count,
        page,
        limit,
        totalPages: Math.ceil(posts.count / limit)
      }
    })
  } catch (error) {
    console.error('Admin community fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch community posts' },
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
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    const post = await ForumPost.findByPk(id)
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Delete the post and all its replies
    await ForumPost.destroy({
      where: {
        [Op.or]: [
          { id },
          { parent_id: id }
        ]
      }
    })

    return NextResponse.json({ message: 'Post and replies deleted successfully' })
  } catch (error) {
    console.error('Admin community deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
