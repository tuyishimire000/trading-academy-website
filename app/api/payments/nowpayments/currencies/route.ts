import { NextRequest, NextResponse } from 'next/server'
import nowpaymentsService from '@/lib/services/nowpayments'

export async function GET(request: NextRequest) {
  try {
    const currencies = await nowpaymentsService.getCurrencies()
    
    return NextResponse.json({
      success: true,
      currencies: currencies
    })
  } catch (error) {
    console.error('Error fetching currencies:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch currencies'
      },
      { status: 500 }
    )
  }
}
