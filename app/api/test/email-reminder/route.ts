import { NextRequest, NextResponse } from "next/server"
import { User, UserSubscription, SubscriptionPlan } from "@/lib/sequelize/models"
import { SubscriptionScheduler } from "@/lib/services/scheduler"

export async function POST(request: NextRequest) {
  try {
    const { action, email } = await request.json()
    
    switch (action) {
      case "setup-test-subscription":
        console.log("🧪 Setting up test subscription for email reminder...")
        
        // Get user by email or first user if no email provided
        let targetUser
        if (email) {
          targetUser = await User.findOne({
            where: { email: email }
          })
          if (!targetUser) {
            return NextResponse.json(
              { success: false, error: `User with email ${email} not found` },
              { status: 404 }
            )
          }
        } else {
          targetUser = await User.findOne({
            order: [["created_at", "ASC"]]
          })
          if (!targetUser) {
            return NextResponse.json(
              { success: false, error: "No users found in database" },
              { status: 404 }
            )
          }
        }
        
        // Get a premium plan (not free)
        const premiumPlan = await SubscriptionPlan.findOne({
          where: { 
            name: { [require('sequelize').Op.ne]: 'free' }
          }
        })
        
        if (!premiumPlan) {
          return NextResponse.json(
            { success: false, error: "No premium plans found in database" },
            { status: 404 }
          )
        }
        
        // Create a test subscription that expires in 5 days
        const now = new Date()
        const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)
        
        // Check if user already has an active subscription
        const existingSubscription = await UserSubscription.findOne({
          where: { 
            user_id: targetUser.id,
            status: "active"
          }
        })
        
        if (existingSubscription) {
          // Update existing subscription to expire in 5 days
          await existingSubscription.update({
            current_period_end: fiveDaysFromNow,
            updated_at: now
          })
          
          console.log(`✅ Updated existing subscription for user ${targetUser.email} to expire in 5 days`)
        } else {
          // Create new test subscription
          await UserSubscription.create({
            user_id: targetUser.id,
            plan_id: premiumPlan.id,
            status: "active",
            current_period_start: now,
            current_period_end: fiveDaysFromNow,
            created_at: now,
            updated_at: now
          })
          
          console.log(`✅ Created test subscription for user ${targetUser.email} to expire in 5 days`)
        }
        
        return NextResponse.json({
          success: true,
          message: "Test subscription created successfully",
          user: {
            id: targetUser.id,
            email: targetUser.email,
            firstName: targetUser.first_name,
            lastName: targetUser.last_name
          },
          plan: {
            name: premiumPlan.name,
            displayName: premiumPlan.display_name,
            price: premiumPlan.price
          },
          expiresAt: fiveDaysFromNow.toISOString()
        })

      case "test-reminder":
        console.log("🧪 Testing email reminder for test subscription...")
        
        // Run the reminder check
        await SubscriptionScheduler.sendExpirationReminders()
        
        return NextResponse.json({
          success: true,
          message: "Email reminder test completed"
        })

      case "cleanup-test":
        console.log("🧪 Cleaning up test subscriptions...")
        
        // Get user by email or first user if no email provided
        let userToClean
        if (email) {
          userToClean = await User.findOne({
            where: { email: email }
          })
          if (!userToClean) {
            return NextResponse.json(
              { success: false, error: `User with email ${email} not found` },
              { status: 404 }
            )
          }
        } else {
          userToClean = await User.findOne({
            order: [["created_at", "ASC"]]
          })
          if (!userToClean) {
            return NextResponse.json(
              { success: false, error: "No users found" },
              { status: 404 }
            )
          }
        }
        
        // Delete test subscriptions for this user
        const deletedCount = await UserSubscription.destroy({
          where: { user_id: userToClean.id }
        })
        
        return NextResponse.json({
          success: true,
          message: `Cleaned up ${deletedCount} test subscriptions`,
          userEmail: userToClean.email
        })

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action. Use: setup-test-subscription, test-reminder, cleanup-test" },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error("❌ Test error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    // Get user by email or first user if no email provided
    let targetUser
    if (email) {
      targetUser = await User.findOne({
        where: { email: email },
        include: [{
          model: UserSubscription,
          as: "subscriptions",
          include: [{
            model: SubscriptionPlan,
            as: "plan"
          }]
        }]
      })
      
      if (!targetUser) {
        return NextResponse.json({
          success: false,
          error: `User with email ${email} not found`
        })
      }
    } else {
      targetUser = await User.findOne({
        order: [["created_at", "ASC"]],
        include: [{
          model: UserSubscription,
          as: "subscriptions",
          include: [{
            model: SubscriptionPlan,
            as: "plan"
          }]
        }]
      })
      
      if (!targetUser) {
        return NextResponse.json({
          success: false,
          error: "No users found in database"
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "User and subscription info",
      user: {
        id: targetUser.id,
        email: targetUser.email,
        firstName: targetUser.first_name,
        lastName: targetUser.last_name,
        createdAt: targetUser.created_at
      },
      subscriptions: targetUser.subscriptions?.map(sub => ({
        id: sub.id,
        status: sub.status,
        planName: sub.plan?.name,
        planDisplayName: sub.plan?.display_name,
        planPrice: sub.plan?.price,
        currentPeriodStart: sub.current_period_start,
        currentPeriodEnd: sub.current_period_end,
        createdAt: sub.created_at
      })) || []
    })

  } catch (error) {
    console.error("❌ Error fetching user info:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch user info",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
