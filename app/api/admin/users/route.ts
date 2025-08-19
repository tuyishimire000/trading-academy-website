import { NextRequest, NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth/admin"
import { User, UserSubscription, SubscriptionPlan } from "@/lib/sequelize/models"
import bcrypt from "bcrypt"
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
    const role = searchParams.get('role') || ''

    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (search) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ]
    }
    if (role) {
      where.is_admin = role === 'admin'
    }

    const users = await User.findAndCountAll({
      where,
      include: [
        {
          model: UserSubscription,
          as: 'subscriptions',
          include: [
            {
              model: SubscriptionPlan,
              as: 'plan',
              attributes: ['name', 'display_name', 'price']
            }
          ]
        }
      ],
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']],
      limit,
      offset
    })

    return NextResponse.json({
      users: users.rows,
      pagination: {
        total: users.count,
        page,
        limit,
        totalPages: Math.ceil(users.count / limit)
      }
    })
  } catch (error) {
    console.error('Admin users fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
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
    const { email, password, first_name, last_name, is_admin } = body

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await User.create({
      email,
      password_hash: hashedPassword,
      first_name,
      last_name,
      is_admin: is_admin || false,
      email_verified_at: new Date()
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_admin: user.is_admin,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('Admin user creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
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
    const { id, email, first_name, last_name, is_admin, password } = body

    const user = await User.findByPk(id)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user fields
    const updateData: any = {
      email,
      first_name,
      last_name,
      is_admin
    }

    // Only update password if provided
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10)
    }

    await user.update(updateData)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_admin: user.is_admin,
        updated_at: user.updated_at
      }
    })
  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
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
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const user = await User.findByPk(id)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent deleting the last admin
    if (user.is_admin) {
      const adminCount = await User.count({ where: { is_admin: true } })
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last admin user' },
          { status: 400 }
        )
      }
    }

    await user.destroy()

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Admin user deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
