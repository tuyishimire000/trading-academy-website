import { NextRequest, NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth/admin"
import { ForumCategory, ForumPost } from "@/lib/sequelize/models"
import { Op } from "sequelize"

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, error } = await checkAdminAccess(request)
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const categories = await ForumCategory.findAll({
      include: [{
        model: ForumPost,
        as: 'posts',
        attributes: ['id']
      }],
      order: [['created_at', 'ASC']]
    })

    const categoriesWithCounts = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      is_active: category.is_active,
      post_count: category.posts?.length || 0,
      created_at: category.created_at,
      updated_at: category.updated_at
    }))

    return NextResponse.json(categoriesWithCounts)
  } catch (error) {
    console.error('Forum categories fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch forum categories' },
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
    const { name, description, color, is_active = true } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Check if slug already exists
    const existingCategory = await ForumCategory.findOne({ where: { slug } })
    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 400 }
      )
    }

    const category = await ForumCategory.create({
      name,
      slug,
      description,
      color: color || '#3b82f6',
      is_active
    })

    return NextResponse.json({
      message: 'Category created successfully',
      category
    }, { status: 201 })
  } catch (error) {
    console.error('Forum category creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create forum category' },
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
    const { id, name, description, color, is_active } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    const category = await ForumCategory.findByPk(id)
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // If name is being updated, check for slug conflicts
    if (name && name !== category.name) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const existingCategory = await ForumCategory.findOne({ 
        where: { 
          slug,
          id: { [Op.ne]: id }
        }
      })
      if (existingCategory) {
        return NextResponse.json(
          { error: 'A category with this name already exists' },
          { status: 400 }
        )
      }
      category.slug = slug
    }

    // Update category
    await category.update({
      name: name || category.name,
      description: description !== undefined ? description : category.description,
      color: color || category.color,
      is_active: is_active !== undefined ? is_active : category.is_active
    })

    return NextResponse.json({
      message: 'Category updated successfully',
      category
    })
  } catch (error) {
    console.error('Forum category update error:', error)
    return NextResponse.json(
      { error: 'Failed to update forum category' },
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

    const category = await ForumCategory.findByPk(id)
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if category has posts
    const postCount = await ForumPost.count({ where: { category_id: id } })
    if (postCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${postCount} posts. Please move or delete the posts first.` },
        { status: 400 }
      )
    }

    await category.destroy()

    return NextResponse.json({
      message: 'Category deleted successfully'
    })
  } catch (error) {
    console.error('Forum category deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete forum category' },
      { status: 500 }
    )
  }
}
