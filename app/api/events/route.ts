import { NextRequest, NextResponse } from "next/server"
import { Event } from "@/lib/sequelize/models"

export async function GET(request: NextRequest) {
  try {
    const events = await Event.findAll({
      where: {
        status: 'scheduled'
      },
      order: [['start_time', 'ASC']],
      limit: 10
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Events fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
