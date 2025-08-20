import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { flutterwaveService } from "@/lib/services/flutterwave"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('verif-hash')

    // Verify webhook signature (optional but recommended for security)
    if (process.env.FLUTTERWAVE_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.FLUTTERWAVE_WEBHOOK_SECRET)
        .update(body)
        .digest('hex')

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const event = JSON.parse(body)
    console.log('Flutterwave webhook received:', event)

    // Handle different event types
    switch (event.event) {
      case 'charge.completed':
        await handlePaymentSuccess(event.data)
        break
      
      case 'charge.failed':
        await handlePaymentFailure(event.data)
        break
      
      default:
        console.log('Unhandled webhook event:', event.event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handlePaymentSuccess(data: any) {
  try {
    const { ensureDatabaseConnection } = await import("@/lib/sequelize/index")
    const { UserSubscription } = await import("@/lib/sequelize/models")
    
    await ensureDatabaseConnection()

    // Extract subscription ID from metadata
    const subscriptionId = data.meta?.subscription_id
    if (!subscriptionId) {
      console.error('No subscription ID found in payment metadata')
      return
    }

    // Update subscription status to active
    const subscription = await UserSubscription.findByPk(subscriptionId)
    if (subscription) {
      await subscription.update({
        status: 'active',
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      })

      console.log(`Subscription ${subscriptionId} activated successfully`)
    } else {
      console.error(`Subscription ${subscriptionId} not found`)
    }
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailure(data: any) {
  try {
    console.log('Payment failed:', data)
    // You can implement additional failure handling here
    // Such as sending notification emails, updating subscription status, etc.
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

