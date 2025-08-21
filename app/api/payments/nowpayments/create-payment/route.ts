import { NextRequest, NextResponse } from 'next/server'
import nowpaymentsService from '@/lib/services/nowpayments'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      price_amount,
      price_currency,
      pay_currency,
      pay_amount,
      ipn_callback_url,
      order_id,
      order_description,
      customer_email,
      customer_name,
      is_fixed_rate
    } = body

    // Validate required fields
    if (!price_amount || !price_currency || !pay_currency) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: price_amount, price_currency, pay_currency'
        },
        { status: 400 }
      )
    }

    const paymentData = {
      price_amount,
      price_currency,
      pay_currency,
      pay_amount,
      ipn_callback_url,
      order_id,
      order_description,
      customer_email,
      customer_name,
      is_fixed_rate
    }

    const payment = await nowpaymentsService.createPayment(paymentData)
    
    return NextResponse.json({
      success: true,
      payment: payment
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment'
      },
      { status: 500 }
    )
  }
}
