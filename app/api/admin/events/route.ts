import { NextRequest, NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth/admin"
import { Event, User } from "@/lib/sequelize/models"
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
    const status = searchParams.get('status') || ''
    const eventType = searchParams.get('eventType') || ''

    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ]
    }
    if (status) {
      where.status = status
    }
    if (eventType) {
      where.event_type = eventType
    }

    const events = await Event.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [['start_time', 'ASC']],
      limit,
      offset
    })

    return NextResponse.json({
      events: events.rows,
      pagination: {
        total: events.count,
        page,
        limit,
        totalPages: Math.ceil(events.count / limit)
      }
    })
  } catch (error) {
    console.error('Admin events fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
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
    const {
      title,
      description,
      event_type,
      start_time,
      end_time,
      timezone,
      meeting_url,
      max_participants,
      required_plan,
      instructor_id,
      is_recurring,
      recurrence_pattern,
      status
    } = body

    const event = await Event.create({
      title,
      description,
      event_type,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      timezone: timezone || 'America/New_York',
      meeting_url,
      max_participants,
      required_plan: required_plan || 'basic',
      instructor_id,
      is_recurring: is_recurring || false,
      recurrence_pattern,
      status: status || 'scheduled'
    })

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Admin event creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
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
    const {
      id,
      title,
      description,
      event_type,
      start_time,
      end_time,
      timezone,
      meeting_url,
      max_participants,
      required_plan,
      instructor_id,
      is_recurring,
      recurrence_pattern,
      status
    } = body

    const event = await Event.findByPk(id)
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    await event.update({
      title,
      description,
      event_type,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      timezone,
      meeting_url,
      max_participants,
      required_plan,
      instructor_id,
      is_recurring,
      recurrence_pattern,
      status
    })

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Admin event update error:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
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
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    const event = await Event.findByPk(id)
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    await event.destroy()

    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Admin event deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
