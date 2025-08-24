import { UserSubscriptionHistory, UserSubscription, SubscriptionPlan } from "@/lib/sequelize/models"

interface SubscriptionHistoryData {
  userId: string
  subscriptionId: string
  actionType: 'payment' | 'renewal' | 'upgrade' | 'downgrade' | 'cancellation'
  previousPlanId?: string | null
  newPlanId: string
  paymentMethod?: string | null
  paymentAmount?: number | null
  paymentCurrency?: string | null
  paymentStatus?: string | null
  billingCycle: string
  transactionId?: string | null
  gatewayReference?: string | null
  metadata?: any
}

export class SubscriptionHistoryService {
  /**
   * Record a subscription history entry
   */
  static async recordHistory(data: SubscriptionHistoryData) {
    try {
      const historyEntry = await UserSubscriptionHistory.create({
        user_id: data.userId,
        subscription_id: data.subscriptionId,
        action_type: data.actionType,
        previous_plan_id: data.previousPlanId || null,
        new_plan_id: data.newPlanId,
        payment_method: data.paymentMethod || null,
        payment_amount: data.paymentAmount || null,
        payment_currency: data.paymentCurrency || null,
        payment_status: data.paymentStatus || null,
        billing_cycle: data.billingCycle,
        transaction_id: data.transactionId || null,
        gateway_reference: data.gatewayReference || null,
        metadata: data.metadata || null,
        created_at: new Date()
      })

      console.log(`📝 Recorded subscription history: ${data.actionType} for user ${data.userId}`)
      return historyEntry
    } catch (error) {
      console.error('❌ Error recording subscription history:', error)
      throw error
    }
  }

  /**
   * Record a payment action
   */
  static async recordPayment(data: {
    userId: string
    subscriptionId: string
    planId: string
    paymentMethod: string
    paymentAmount: number
    paymentCurrency: string
    paymentStatus: string
    billingCycle: string
    transactionId: string
    gatewayReference?: string
    metadata?: any
  }) {
    return this.recordHistory({
      userId: data.userId,
      subscriptionId: data.subscriptionId,
      actionType: 'payment',
      newPlanId: data.planId,
      paymentMethod: data.paymentMethod,
      paymentAmount: data.paymentAmount,
      paymentCurrency: data.paymentCurrency,
      paymentStatus: data.paymentStatus,
      billingCycle: data.billingCycle,
      transactionId: data.transactionId,
      gatewayReference: data.gatewayReference,
      metadata: data.metadata
    })
  }

  /**
   * Record a renewal action
   */
  static async recordRenewal(data: {
    userId: string
    subscriptionId: string
    planId: string
    paymentMethod?: string
    paymentAmount?: number
    paymentCurrency?: string
    paymentStatus?: string
    billingCycle: string
    transactionId?: string
    gatewayReference?: string
    metadata?: any
  }) {
    return this.recordHistory({
      userId: data.userId,
      subscriptionId: data.subscriptionId,
      actionType: 'renewal',
      previousPlanId: data.planId, // Same plan for renewal
      newPlanId: data.planId,
      paymentMethod: data.paymentMethod,
      paymentAmount: data.paymentAmount,
      paymentCurrency: data.paymentCurrency,
      paymentStatus: data.paymentStatus,
      billingCycle: data.billingCycle,
      transactionId: data.transactionId,
      gatewayReference: data.gatewayReference,
      metadata: data.metadata
    })
  }

  /**
   * Record an upgrade action
   */
  static async recordUpgrade(data: {
    userId: string
    subscriptionId: string
    previousPlanId: string
    newPlanId: string
    paymentMethod?: string
    paymentAmount?: number
    paymentCurrency?: string
    paymentStatus?: string
    billingCycle: string
    transactionId?: string
    gatewayReference?: string
    metadata?: any
  }) {
    return this.recordHistory({
      userId: data.userId,
      subscriptionId: data.subscriptionId,
      actionType: 'upgrade',
      previousPlanId: data.previousPlanId,
      newPlanId: data.newPlanId,
      paymentMethod: data.paymentMethod,
      paymentAmount: data.paymentAmount,
      paymentCurrency: data.paymentCurrency,
      paymentStatus: data.paymentStatus,
      billingCycle: data.billingCycle,
      transactionId: data.transactionId,
      gatewayReference: data.gatewayReference,
      metadata: data.metadata
    })
  }

  /**
   * Record a downgrade action
   */
  static async recordDowngrade(data: {
    userId: string
    subscriptionId: string
    previousPlanId: string
    newPlanId: string
    paymentMethod?: string
    paymentAmount?: number
    paymentCurrency?: string
    paymentStatus?: string
    billingCycle: string
    transactionId?: string
    gatewayReference?: string
    metadata?: any
  }) {
    return this.recordHistory({
      userId: data.userId,
      subscriptionId: data.subscriptionId,
      actionType: 'downgrade',
      previousPlanId: data.previousPlanId,
      newPlanId: data.newPlanId,
      paymentMethod: data.paymentMethod,
      paymentAmount: data.paymentAmount,
      paymentCurrency: data.paymentCurrency,
      paymentStatus: data.paymentStatus,
      billingCycle: data.billingCycle,
      transactionId: data.transactionId,
      gatewayReference: data.gatewayReference,
      metadata: data.metadata
    })
  }

  /**
   * Record a cancellation action
   */
  static async recordCancellation(data: {
    userId: string
    subscriptionId: string
    planId: string
    metadata?: any
  }) {
    return this.recordHistory({
      userId: data.userId,
      subscriptionId: data.subscriptionId,
      actionType: 'cancellation',
      previousPlanId: data.planId,
      newPlanId: data.planId,
      billingCycle: 'monthly', // Default, should be updated based on actual billing cycle
      metadata: data.metadata
    })
  }

  /**
   * Get user's subscription history
   */
  static async getUserHistory(userId: string, limit?: number) {
    try {
      const history = await UserSubscriptionHistory.findAll({
        where: { user_id: userId },
        include: [
          {
            model: SubscriptionPlan,
            as: "previousPlan",
            attributes: ["display_name"]
          },
          {
            model: SubscriptionPlan,
            as: "newPlan",
            attributes: ["display_name"]
          }
        ],
        order: [["created_at", "DESC"]],
        limit: limit || undefined
      })

      return history
    } catch (error) {
      console.error('❌ Error fetching user subscription history:', error)
      throw error
    }
  }

  /**
   * Get billing statistics for a user
   */
  static async getUserBillingStats(userId: string) {
    try {
      const history = await UserSubscriptionHistory.findAll({
        where: { 
          user_id: userId,
          payment_amount: {
            [require('sequelize').Op.not]: null
          }
        },
        order: [["created_at", "DESC"]]
      })

      const totalPayments = history.length
      const successfulPayments = history.filter(p => p.payment_status === "completed").length
      const failedPayments = history.filter(p => p.payment_status === "failed").length
      
      const totalAmount = history
        .filter(p => p.payment_status === "completed" && p.payment_amount)
        .reduce((sum, p) => sum + (p.payment_amount || 0), 0)
      
      const averageAmount = successfulPayments > 0 ? totalAmount / successfulPayments : 0

      // Get last payment date
      const lastPayment = history
        .filter(p => p.payment_status === "completed")
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

      // Get next billing date from current subscription
      const currentSubscription = await UserSubscription.findOne({
        where: { 
          user_id: userId,
          status: "active"
        },
        order: [["created_at", "DESC"]]
      })

      return {
        totalPayments,
        successfulPayments,
        failedPayments,
        totalAmount,
        averageAmount,
        lastPaymentDate: lastPayment?.created_at.toISOString() || null,
        nextBillingDate: currentSubscription?.current_period_end?.toISOString() || null
      }
    } catch (error) {
      console.error('❌ Error fetching user billing stats:', error)
      throw error
    }
  }
}
