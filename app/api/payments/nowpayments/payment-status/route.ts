import { NextRequest, NextResponse } from 'next/server'
import nowpaymentsService from '@/lib/services/nowpayments'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('payment_id')

    if (!paymentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing payment_id parameter'
        },
        { status: 400 }
      )
    }

    const payment = await nowpaymentsService.getPaymentStatus(paymentId)
    
    return NextResponse.json({
      success: true,
      payment: payment
    })
  } catch (error) {
    console.error('Error getting payment status:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get payment status'
      },
      { status: 500 }
    )
  }
}
