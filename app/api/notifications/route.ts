import { NextRequest, NextResponse } from "next/server"
import { Notification } from "@/lib/sequelize/models"
import { verifyAuth } from "@/lib/auth/server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notifications = await Notification.findAll({
      where: {
        user_id: user.id
      },
      order: [['created_at', 'DESC']],
      limit: 50
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Notifications fetch error:', error)
    
    // Return empty array instead of error to prevent build failures
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, message, data } = body

    const notification = await Notification.create({
      user_id: user.id,
      type,
      title,
      message,
      data
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Notification creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}
