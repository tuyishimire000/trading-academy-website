import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth/server"
import { Event, User, UserSubscription, SubscriptionPlan } from "@/lib/sequelize/models"

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { eventId } = body

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    // Check if event exists and is available
    const event = await Event.findByPk(eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event.status !== 'scheduled') {
      return NextResponse.json({ error: "Event is not available for registration" }, { status: 400 })
    }

    // Check if user has access to this event based on their subscription
    const userSubscription = await UserSubscription.findOne({
      where: { user_id: user.id },
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['id', 'name', 'price']
        }
      ],
      order: [['created_at', 'DESC']]
    })

    // Get all subscription plans to determine plan hierarchy
    const allPlans = await SubscriptionPlan.findAll({
      attributes: ['id', 'name', 'price'],
      order: [['price', 'ASC']]
    })

    // Determine user's plan level
    let userPlanLevel = -1 // Default for users without subscription
    if (userSubscription?.plan) {
      userPlanLevel = allPlans.findIndex(plan => plan.name === userSubscription.plan.name)
    }

    // Get required plan level for the event
    const requiredPlanLevel = allPlans.findIndex(plan => plan.name === event.required_plan)

    // Check if user has access (user's plan level >= required plan level)
    if (userPlanLevel < requiredPlanLevel) {
      return NextResponse.json({ 
        error: `This event requires a ${event.required_plan} subscription or higher. Your current plan: ${userSubscription?.plan?.name || 'No subscription'}` 
      }, { status: 403 })
    }

    // For now, return a message that the feature is coming soon
    // TODO: Implement once EventParticipant table is created
    return NextResponse.json({ 
      success: true, 
      message: "Event registration feature coming soon!" 
    })

    // Uncomment the following code once EventParticipant table is created:
    /*
    // Check if user is already registered
    const existingParticipant = await EventParticipant.findOne({
      where: {
        event_id: eventId,
        user_id: user.id
      }
    })

    if (existingParticipant) {
      return NextResponse.json({ error: "Already registered for this event" }, { status: 400 })
    }

    // Check if event is full
    if (event.max_participants) {
      const participantCount = await EventParticipant.count({
        where: { event_id: eventId }
      })
      
      if (participantCount >= event.max_participants) {
        return NextResponse.json({ error: "Event is full" }, { status: 400 })
      }
    }

    // Register user for the event
    await EventParticipant.create({
      event_id: eventId,
      user_id: user.id,
      status: 'registered',
      registered_at: new Date()
    })
    */

    return NextResponse.json({ 
      success: true, 
      message: "Successfully registered for event" 
    })

  } catch (error) {
    console.error('Event join error:', error)
    return NextResponse.json(
      { error: 'Failed to join event' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    // For now, return a message that the feature is coming soon
    // TODO: Implement once EventParticipant table is created
    return NextResponse.json({ 
      success: true, 
      message: "Event unregistration feature coming soon!" 
    })

    // Uncomment the following code once EventParticipant table is created:
    /*
    // Remove user from event
    const deleted = await EventParticipant.destroy({
      where: {
        event_id: eventId,
        user_id: user.id
      }
    })

    if (!deleted) {
      return NextResponse.json({ error: "Not registered for this event" }, { status: 404 })
    }
    */

    return NextResponse.json({ 
      success: true, 
      message: "Successfully unregistered from event" 
    })

  } catch (error) {
    console.error('Event unjoin error:', error)
    return NextResponse.json(
      { error: 'Failed to unregister from event' },
      { status: 500 }
    )
  }
}

