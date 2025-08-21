import { NextRequest, NextResponse } from 'next/server'
import { stripeService } from '@/lib/services/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency, customerEmail, customerName, description, metadata } = body

    // Validate required fields
    if (!amount || !currency || !customerEmail || !customerName || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create payment intent
    const result = await stripeService.createPaymentIntent({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      customerEmail,
      customerName,
      description,
      metadata
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        paymentIntentId: result.paymentIntentId,
        clientSecret: result.clientSecret,
        message: result.message,
        requiresAction: result.requiresAction,
        nextAction: result.nextAction
      })
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Stripe create payment intent error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
