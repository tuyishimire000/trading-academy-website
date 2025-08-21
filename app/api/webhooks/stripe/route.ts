import { NextRequest, NextResponse } from 'next/server'
import { stripeService } from '@/lib/services/stripe'
import { verifyAuth } from '@/lib/auth'
import { UserSubscription, SubscriptionPlan } from '@/lib/sequelize/models'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const event = stripeService.verifyWebhookSignature(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    console.log('Stripe webhook event:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object)
        break

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  try {
    console.log('Payment succeeded:', paymentIntent.id)

    // Extract subscription ID from metadata
    const subscriptionId = paymentIntent.metadata?.subscription_id
    if (!subscriptionId) {
      console.error('No subscription ID found in payment intent metadata')
      return
    }

    // Find the subscription
    const subscription = await UserSubscription.findByPk(subscriptionId)
    if (!subscription) {
      console.error('Subscription not found:', subscriptionId)
      return
    }

    // Update subscription status to active
    await subscription.update({
      status: 'active',
      payment_status: 'paid',
      payment_method: 'stripe',
      payment_reference: paymentIntent.id,
      paid_at: new Date(),
      current_period_start: new Date(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    })

    console.log('Subscription activated:', subscriptionId)
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  try {
    console.log('Payment failed:', paymentIntent.id)

    const subscriptionId = paymentIntent.metadata?.subscription_id
    if (!subscriptionId) {
      console.error('No subscription ID found in payment intent metadata')
      return
    }

    // Update subscription status to failed
    const subscription = await UserSubscription.findByPk(subscriptionId)
    if (subscription) {
      await subscription.update({
        status: 'failed',
        payment_status: 'failed',
        payment_reference: paymentIntent.id
      })
    }

    console.log('Subscription marked as failed:', subscriptionId)
  } catch (error) {
    console.error('Error handling payment intent failed:', error)
  }
}

async function handlePaymentIntentCanceled(paymentIntent: any) {
  try {
    console.log('Payment canceled:', paymentIntent.id)

    const subscriptionId = paymentIntent.metadata?.subscription_id
    if (!subscriptionId) {
      console.error('No subscription ID found in payment intent metadata')
      return
    }

    // Update subscription status to canceled
    const subscription = await UserSubscription.findByPk(subscriptionId)
    if (subscription) {
      await subscription.update({
        status: 'canceled',
        payment_status: 'canceled',
        payment_reference: paymentIntent.id
      })
    }

    console.log('Subscription marked as canceled:', subscriptionId)
  } catch (error) {
    console.error('Error handling payment intent canceled:', error)
  }
}

async function handleChargeRefunded(charge: any) {
  try {
    console.log('Charge refunded:', charge.id)

    // Handle refund logic if needed
    // This could involve updating subscription status or creating refund records
  } catch (error) {
    console.error('Error handling charge refunded:', error)
  }
}
