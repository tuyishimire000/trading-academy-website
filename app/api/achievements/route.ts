export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { AchievementService } from "@/lib/services/achievement-service"
import { verifyAuth } from "@/lib/auth/server"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const achievementProgress = await AchievementService.getUserAchievementProgress(user.id)
    const availableRewards = await AchievementService.getAvailableRewards(user.id)

    return NextResponse.json({
      ...achievementProgress,
      availableRewards
    })
  } catch (error) {
    console.error('Achievements fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
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
    const { actionType, actionData } = body

    if (!actionType) {
      return NextResponse.json({ error: 'Action type is required' }, { status: 400 })
    }

    // Check and award achievements based on the action
    const result = await AchievementService.checkAndAwardAchievements(
      user.id,
      actionType,
      actionData
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Achievement check error:', error)
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    )
  }
}
