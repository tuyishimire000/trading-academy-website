import { NextRequest, NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth/admin"
import { User, ForumPost } from "@/lib/sequelize/models"
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
    const status = searchParams.get('status') || '' // 'active', 'suspended', 'all'

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

    if (status === 'suspended') {
      where.forum_suspended = true
    } else if (status === 'active') {
      where.forum_suspended = false
    }

    const users = await User.findAndCountAll({
      where,
      include: [{
        model: ForumPost,
        as: 'posts',
        attributes: ['id', 'created_at'],
        where: {
          created_at: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        required: false
      }],
      order: [['created_at', 'DESC']],
      limit,
      offset
    })

    const usersWithStats = users.rows.map(user => {
      const recentPosts = user.posts?.length || 0
      const negativeScore = Math.floor(Math.random() * 100) // Mock AI sentiment score
      
      return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        forum_suspended: user.forum_suspended,
        suspension_reason: user.suspension_reason,
        suspended_at: user.suspended_at,
        created_at: user.created_at,
        recent_posts: recentPosts,
        negative_score: negativeScore,
        risk_level: negativeScore > 70 ? 'high' : negativeScore > 40 ? 'medium' : 'low'
      }
    })

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        total: users.count,
        page,
        limit,
        totalPages: Math.ceil(users.count / limit)
      }
    })
  } catch (error) {
    console.error('User suspensions fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user suspensions' },
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
    const { userId, reason, duration } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const user = await User.findByPk(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate suspension end date
    const suspendedAt = new Date()
    let suspendedUntil = null
    
    if (duration) {
      const durationMs = {
        '1_day': 24 * 60 * 60 * 1000,
        '3_days': 3 * 24 * 60 * 60 * 1000,
        '1_week': 7 * 24 * 60 * 60 * 1000,
        '1_month': 30 * 24 * 60 * 60 * 1000,
        'permanent': null
      }[duration]
      
      if (durationMs) {
        suspendedUntil = new Date(suspendedAt.getTime() + durationMs)
      }
    }

    await user.update({
      forum_suspended: true,
      suspension_reason: reason || 'Violation of community guidelines',
      suspended_at: suspendedAt,
      suspended_until: suspendedUntil
    })

    return NextResponse.json({
      message: 'User suspended successfully',
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        forum_suspended: user.forum_suspended,
        suspension_reason: user.suspension_reason,
        suspended_at: user.suspended_at,
        suspended_until: user.suspended_until
      }
    })
  } catch (error) {
    console.error('User suspension error:', error)
    return NextResponse.json(
      { error: 'Failed to suspend user' },
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
    const { userId, action } = body // action: 'unsuspend' or 'extend'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const user = await User.findByPk(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (action === 'unsuspend') {
      await user.update({
        forum_suspended: false,
        suspension_reason: null,
        suspended_at: null,
        suspended_until: null
      })

      return NextResponse.json({
        message: 'User unsuspended successfully',
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          forum_suspended: false
        }
      })
    } else if (action === 'extend') {
      const { duration } = body
      const currentUntil = user.suspended_until || new Date()
      
      const durationMs = {
        '1_day': 24 * 60 * 60 * 1000,
        '3_days': 3 * 24 * 60 * 60 * 1000,
        '1_week': 7 * 24 * 60 * 60 * 1000,
        '1_month': 30 * 24 * 60 * 60 * 1000,
        'permanent': null
      }[duration]

      const newUntil = durationMs ? new Date(currentUntil.getTime() + durationMs) : null

      await user.update({
        suspended_until: newUntil
      })

      return NextResponse.json({
        message: 'Suspension extended successfully',
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          suspended_until: newUntil
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('User suspension update error:', error)
    return NextResponse.json(
      { error: 'Failed to update user suspension' },
      { status: 500 }
    )
  }
}
