import { NextRequest, NextResponse } from "next/server"
import { PlatformSocialLinks } from "@/lib/sequelize/models"
import { verifyAuth } from "@/lib/auth/server"

export async function GET(request: NextRequest) {
  try {
    // Get user's subscription plan if authenticated
    let userPlan = null
    try {
      const user = await verifyAuth(request)
      if (user) {
        // Fetch user's subscription
        const { UserSubscription, SubscriptionPlan } = await import("@/lib/sequelize/models")
        const subscription = await UserSubscription.findOne({
          where: { user_id: user.id, status: "active" },
          include: [{ model: SubscriptionPlan, as: "plan" }]
        })
        
        if (subscription?.plan) {
          userPlan = subscription.plan.name
        }
      }
    } catch (error) {
      // User not authenticated, continue without plan filtering
      console.log("User not authenticated, showing public social links only")
    }

    // Build query
    const whereClause: any = {
      is_active: true
    }

    // If user has a plan, show all links they can access
    // If no plan, only show links without required_plan (public links)
    if (!userPlan) {
      whereClause.required_plan = null
    }

    const socialLinks = await PlatformSocialLinks.findAll({
      where: whereClause,
      order: [["sort_order", "ASC"], ["platform", "ASC"]],
      attributes: [
        "id", "platform", "name", "url", "description", 
        "required_plan", "is_active", "sort_order"
      ]
    })

    // Group links by platform
    const groupedLinks = socialLinks.reduce((acc, link) => {
      if (!acc[link.platform]) {
        acc[link.platform] = []
      }
      acc[link.platform].push(link)
      return acc
    }, {} as Record<string, any[]>)

    return NextResponse.json({
      success: true,
      data: {
        links: socialLinks,
        grouped: groupedLinks,
        userPlan: userPlan
      }
    })

  } catch (error) {
    console.error("Error fetching platform social links:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch platform social links" },
      { status: 500 }
    )
  }
}
