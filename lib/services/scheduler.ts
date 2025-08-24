import { User, UserSubscription, SubscriptionPlan } from "@/lib/sequelize/models"
import { Op } from "sequelize"
import { sendEmail } from "./email"

interface SubscriptionWithUser {
  id: string
  user_id: string
  plan_id: string
  status: string
  current_period_start: Date | null
  current_period_end: Date | null
  created_at: Date
  updated_at: Date
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
  }
  plan: {
    id: string
    name: string
    display_name: string
    price: number
    billing_cycle: string
  }
}

export class SubscriptionScheduler {
  /**
   * Check for expired subscriptions and downgrade to free plan
   */
  static async checkExpiredSubscriptions() {
    try {
      console.log("🔍 Checking for expired subscriptions...")
      
      const now = new Date()
      
             // Find all active subscriptions that have expired
       const expiredSubscriptions = await UserSubscription.findAll({
         where: {
           status: "active",
           current_period_end: {
             [Op.lt]: now // Less than current date
           }
         },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "email", "first_name", "last_name"]
          },
          {
            model: SubscriptionPlan,
            as: "plan",
            attributes: ["id", "name", "display_name", "price", "billing_cycle"]
          }
        ]
      })

      console.log(`Found ${expiredSubscriptions.length} expired subscriptions`)

      // Get the free plan
      const freePlan = await SubscriptionPlan.findOne({
        where: { name: "free" }
      })

      if (!freePlan) {
        console.error("❌ Free plan not found in database")
        return
      }

      console.log(`✅ Found free plan: ${freePlan.id} - ${freePlan.name}`)

      // Process each expired subscription
      for (const subscription of expiredSubscriptions) {
        try {
          // Update subscription to expired status
          await subscription.update({
            status: "expired",
            updated_at: now
          })

                               // Create new free subscription
          const newFreeSubscription = await UserSubscription.create({
            user_id: subscription.user_id,
            plan_id: freePlan.id,
            status: "active",
            current_period_start: now,
            current_period_end: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            created_at: now,
            updated_at: now
          })

          console.log(`✅ Created free subscription ${newFreeSubscription.id} for user ${subscription.user.email}`)

          // Send expiration notification email
          await this.sendExpirationEmail(subscription as SubscriptionWithUser)

          console.log(`✅ Downgraded user ${subscription.user.email} to free plan`)
        } catch (error) {
          console.error(`❌ Error processing expired subscription for user ${subscription.user_id}:`, error)
        }
      }

      console.log("✅ Expired subscription check completed")
    } catch (error) {
      console.error("❌ Error in checkExpiredSubscriptions:", error)
    }
  }

  /**
   * Check for subscriptions expiring soon and send reminder emails
   */
  static async sendExpirationReminders() {
    try {
      console.log("📧 Checking for subscriptions expiring soon...")
      
      const now = new Date()
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      
             // Find active subscriptions expiring within 7 days
       const expiringSubscriptions = await UserSubscription.findAll({
         where: {
           status: "active",
           current_period_end: {
             [Op.between]: [now, sevenDaysFromNow]
           }
         },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "email", "first_name", "last_name"]
          },
          {
            model: SubscriptionPlan,
            as: "plan",
            attributes: ["id", "name", "display_name", "price", "billing_cycle"]
          }
        ]
      })

      console.log(`Found ${expiringSubscriptions.length} subscriptions expiring soon`)

      // Send reminder emails
      for (const subscription of expiringSubscriptions) {
        try {
          await this.sendExpirationReminderEmail(subscription as SubscriptionWithUser)
          console.log(`📧 Sent reminder email to ${subscription.user.email}`)
        } catch (error) {
          console.error(`❌ Error sending reminder email to ${subscription.user.email}:`, error)
        }
      }

      console.log("✅ Expiration reminder check completed")
    } catch (error) {
      console.error("❌ Error in sendExpirationReminders:", error)
    }
  }

  /**
   * Send expiration notification email
   */
  private static async sendExpirationEmail(subscription: SubscriptionWithUser) {
    const { user, plan } = subscription
    
    const emailData = {
      to: user.email,
      subject: "Your Trading Academy Subscription Has Expired",
      template: "subscription-expired",
                   data: {
        firstName: user.first_name,
        planName: plan.display_name,
        expirationDate: subscription.current_period_end?.toLocaleDateString() || 'Unknown',
        renewalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?renewal=true`
      }
    }

    await sendEmail(emailData)
  }

  /**
   * Send expiration reminder email
   */
  private static async sendExpirationReminderEmail(subscription: SubscriptionWithUser) {
    const { user, plan } = subscription
    
         const daysUntilExpiration = subscription.current_period_end ? 
       Math.ceil((subscription.current_period_end.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0

    const emailData = {
      to: user.email,
      subject: `Your Trading Academy subscription expires in ${daysUntilExpiration} days`,
      template: "subscription-expiring-soon",
                   data: {
        firstName: user.first_name,
        planName: plan.display_name,
        expirationDate: subscription.current_period_end?.toLocaleDateString() || 'Unknown',
        daysUntilExpiration,
        renewalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?renewal=true`
      }
    }

    await sendEmail(emailData)
  }

  /**
   * Run all scheduled tasks
   */
  static async runScheduledTasks() {
    console.log("🚀 Starting scheduled subscription tasks...")
    
    await Promise.all([
      this.checkExpiredSubscriptions(),
      this.sendExpirationReminders()
    ])
    
    console.log("✅ All scheduled tasks completed")
  }
}
