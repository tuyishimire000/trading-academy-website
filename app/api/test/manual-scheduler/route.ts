import { NextRequest, NextResponse } from "next/server"
import { SubscriptionScheduler } from "@/lib/services/scheduler"

export async function POST(request: NextRequest) {
  try {
    const { action, email } = await request.json()
    
    console.log(`🧪 Manual scheduler trigger: ${action}`)
    
    switch (action) {
      case "check-expired":
        console.log("Checking for expired subscriptions...")
        await SubscriptionScheduler.checkExpiredSubscriptions()
        return NextResponse.json({
          success: true,
          message: "Expired subscriptions check completed"
        })
        
      case "send-reminders":
        console.log("Sending expiration reminders...")
        await SubscriptionScheduler.sendExpirationReminders()
        return NextResponse.json({
          success: true,
          message: "Expiration reminders sent"
        })
        
      case "run-all":
        console.log("Running all scheduled tasks...")
        await SubscriptionScheduler.runScheduledTasks()
        return NextResponse.json({
          success: true,
          message: "All scheduled tasks completed"
        })
        
      case "test-specific-user":
        if (!email) {
          return NextResponse.json({
            success: false,
            error: "Email is required for specific user test"
          }, { status: 400 })
        }
        
        console.log(`Testing scheduler for user: ${email}`)
        
        // Import models
        const { User, UserSubscription, SubscriptionPlan } = await import("@/lib/sequelize/models")
        const { Op } = await import("sequelize")
        
        // Find user
        const user = await User.findOne({
          where: { email },
          include: [
            {
              model: UserSubscription,
              as: "subscriptions",
              include: [
                {
                  model: SubscriptionPlan,
                  as: "plan"
                }
              ],
              order: [["created_at", "DESC"]]
            }
          ]
        })
        
        if (!user) {
          return NextResponse.json({
            success: false,
            error: `User with email ${email} not found`
          }, { status: 404 })
        }
        
        const activeSubscription = user.subscriptions?.find(sub => sub.status === "active")
        
        if (!activeSubscription) {
          return NextResponse.json({
            success: false,
            error: "No active subscription found for user"
          }, { status: 404 })
        }
        
        // Check if subscription is expiring soon
        const now = new Date()
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        const isExpiringSoon = activeSubscription.current_period_end && 
          activeSubscription.current_period_end <= sevenDaysFromNow &&
          activeSubscription.current_period_end > now
        
        // Check if subscription is expired
        const isExpired = activeSubscription.current_period_end && 
          activeSubscription.current_period_end < now
        
        return NextResponse.json({
          success: true,
          message: "User subscription analysis completed",
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name
          },
          subscription: {
            id: activeSubscription.id,
            status: activeSubscription.status,
            planName: activeSubscription.plan?.display_name,
            periodEnd: activeSubscription.current_period_end,
            isExpiringSoon,
            isExpired
          },
          schedulerActions: {
            wouldSendReminder: isExpiringSoon,
            wouldDowngrade: isExpired,
            wouldSendExpirationEmail: isExpired
          }
        })
        
      default:
        return NextResponse.json({
          success: false,
          error: "Invalid action. Use: check-expired, send-reminders, run-all, or test-specific-user"
        }, { status: 400 })
    }
    
  } catch (error) {
    console.error("Manual scheduler error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to run scheduler task"
    }, { status: 500 })
  }
}
