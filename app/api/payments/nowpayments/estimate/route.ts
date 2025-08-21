import { NextRequest, NextResponse } from 'next/server'
import nowpaymentsService from '@/lib/services/nowpayments'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency_from, currency_to, is_fixed_rate } = body

    // Validate required fields
    if (!amount || !currency_from || !currency_to) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: amount, currency_from, currency_to'
        },
        { status: 400 }
      )
    }

    const estimate = await nowpaymentsService.estimatePrice(
      amount,
      currency_from,
      currency_to,
      is_fixed_rate
    )
    
    return NextResponse.json({
      success: true,
      estimate: estimate
    })
  } catch (error) {
    console.error('Error getting price estimate:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get price estimate'
      },
      { status: 500 }
    )
  }
}
