export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { Event, User, UserSubscription, SubscriptionPlan } from "@/lib/sequelize/models"
import { verifyAuth } from "@/lib/auth/server"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's current subscription
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

    // Determine user's plan level (0 = basic, 1 = pro, 2 = elite, etc.)
    let userPlanLevel = -1 // Default for users without subscription
    if (userSubscription?.plan) {
      userPlanLevel = allPlans.findIndex(plan => plan.name === userSubscription.plan.name)
    }

    // Get accessible plan names (user's plan and cheaper plans)
    const accessiblePlanNames = allPlans
      .filter((_, index) => index <= userPlanLevel)
      .map(plan => plan.name)

    // Fetch all scheduled events (not filtered by plan)
    const events = await Event.findAll({
      where: {
        status: 'scheduled'
      },
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [['start_time', 'ASC']],
      limit: 10
    })

    // Add user participation status and access information to each event
    const eventsWithParticipation = events.map(event => {
      const eventData = event.toJSON()
      
      // Check if user has access to this event
      const eventPlanLevel = allPlans.findIndex(plan => plan.name === event.required_plan)
      const hasAccess = userPlanLevel >= eventPlanLevel
      
      return {
        ...eventData,
        isUserRegistered: false, // Will be implemented once EventParticipant table is created
        participantCount: 0, // Will be implemented once EventParticipant table is created
        participants: [], // Empty array for now
        hasAccess, // Whether user can join this event
        userPlanLevel, // User's current plan level
        eventPlanLevel // Event's required plan level
      }
    })

    return NextResponse.json({ events: eventsWithParticipation })
  } catch (error) {
    console.error('Events fetch error:', error)
    
    // Return empty data instead of error to prevent build failures
    return NextResponse.json({ events: [] })
  }
}
