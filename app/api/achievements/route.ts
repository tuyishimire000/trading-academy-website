export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { Achievement, UserAchievement, User } from "@/lib/sequelize/models"
import { verifyAuth } from "@/lib/auth/server"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const achievements = await Achievement.findAll({
      where: {
        is_active: true
      },
      include: [
        {
          model: UserAchievement,
          as: 'userAchievements',
          where: { user_id: user.id },
          required: false
        }
      ],
      order: [['created_at', 'ASC']]
    })

    return NextResponse.json(achievements)
  } catch (error) {
    console.error('Achievements fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}
