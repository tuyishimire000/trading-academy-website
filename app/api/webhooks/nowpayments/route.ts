import { NextRequest, NextResponse } from 'next/server'
import nowpaymentsService from '@/lib/services/nowpayments'
import { IPNPayload } from '@/lib/services/nowpayments'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-nowpayments-sig')

    // Verify IPN signature
    if (!signature || !nowpaymentsService.verifyIPNSignature(body, signature)) {
      console.error('Invalid IPN signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const payload: IPNPayload = JSON.parse(body)
    
    console.log('NOWPayments IPN received:', {
      payment_id: payload.payment_id,
      status: payload.payment_status,
      order_id: payload.order_id,
      customer_email: payload.customer_email
    })

    // Handle different payment statuses
    switch (payload.payment_status) {
      case 'waiting':
        console.log(`Payment ${payload.payment_id} is waiting for confirmation`)
        break
        
      case 'confirming':
        console.log(`Payment ${payload.payment_id} is being confirmed`)
        break
        
      case 'confirmed':
        console.log(`Payment ${payload.payment_id} has been confirmed`)
        await handlePaymentConfirmed(payload)
        break
        
      case 'finished':
        console.log(`Payment ${payload.payment_id} has been finished`)
        await handlePaymentFinished(payload)
        break
        
      case 'failed':
        console.log(`Payment ${payload.payment_id} has failed`)
        await handlePaymentFailed(payload)
        break
        
      case 'expired':
        console.log(`Payment ${payload.payment_id} has expired`)
        await handlePaymentExpired(payload)
        break
        
      default:
        console.log(`Unknown payment status: ${payload.payment_status}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing NOWPayments webhook:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handlePaymentConfirmed(payload: IPNPayload) {
  try {
    // Update subscription status to confirmed
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/subscription/update-payment-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription_id: payload.order_id,
        payment_id: payload.payment_id,
        status: 'confirmed',
        payment_method: 'nowpayments',
        payment_data: {
          actually_paid: payload.actually_paid,
          pay_currency: payload.pay_currency,
          txid: payload.txid,
          confirmations: payload.payin_confirmations
        }
      }),
    })

    if (!response.ok) {
      console.error('Failed to update subscription status for confirmed payment')
    }
  } catch (error) {
    console.error('Error handling confirmed payment:', error)
  }
}

async function handlePaymentFinished(payload: IPNPayload) {
  try {
    // Activate subscription
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/subscription/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription_id: payload.order_id,
        payment_method: 'nowpayments',
        payment_data: {
          payment_id: payload.payment_id,
          status: 'finished',
          actually_paid: payload.actually_paid,
          pay_currency: payload.pay_currency,
          txid: payload.txid,
          customer_email: payload.customer_email,
          customer_name: payload.customer_name
        }
      }),
    })

    if (!response.ok) {
      console.error('Failed to activate subscription for finished payment')
    } else {
      console.log(`Subscription activated for payment ${payload.payment_id}`)
    }
  } catch (error) {
    console.error('Error handling finished payment:', error)
  }
}

async function handlePaymentFailed(payload: IPNPayload) {
  try {
    // Update subscription status to failed
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/subscription/update-payment-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription_id: payload.order_id,
        payment_id: payload.payment_id,
        status: 'failed',
        payment_method: 'nowpayments',
        payment_data: {
          error: 'Payment failed',
          customer_email: payload.customer_email
        }
      }),
    })

    if (!response.ok) {
      console.error('Failed to update subscription status for failed payment')
    }
  } catch (error) {
    console.error('Error handling failed payment:', error)
  }
}

async function handlePaymentExpired(payload: IPNPayload) {
  try {
    // Update subscription status to expired
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/subscription/update-payment-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription_id: payload.order_id,
        payment_id: payload.payment_id,
        status: 'expired',
        payment_method: 'nowpayments',
        payment_data: {
          error: 'Payment expired',
          customer_email: payload.customer_email
        }
      }),
    })

    if (!response.ok) {
      console.error('Failed to update subscription status for expired payment')
    }
  } catch (error) {
    console.error('Error handling expired payment:', error)
  }
}
