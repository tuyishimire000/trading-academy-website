"use client"

import { useState, useEffect } from 'react'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  CardElementProps
} from '@stripe/react-stripe-js'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { 
  CreditCard, 
  Shield, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from "lucide-react"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeCardFormProps {
  amount: number
  currency: string
  customerEmail: string
  customerName: string
  subscriptionId: string
  onSuccess: (paymentIntent: any) => void
  onError: (error: string) => void
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
}

interface StripeCardElementProps {
  onPaymentSubmit: (paymentData: any) => Promise<void>
  amount: number
  currency: string
  customerEmail: string
  customerName: string
  subscriptionId: string
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
}

// Card input form component using Stripe Elements
function StripeCardForm({ 
  onPaymentSubmit, 
  amount, 
  currency, 
  customerEmail, 
  customerName,
  subscriptionId,
  isProcessing,
  setIsProcessing
}: StripeCardElementProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  
  const [cardError, setCardError] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [billingDetails, setBillingDetails] = useState({
    name: customerName || '',
    email: customerEmail || '',
    phone: ''
  })

  // Stripe Elements styling to match your app
  const cardElementOptions: CardElementProps['options'] = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        letterSpacing: '0.025em',
        fontFamily: 'Source Code Pro, monospace',
        '::placeholder': {
          color: '#aab7c4',
        },
        iconColor: '#666ee8',
      },
      invalid: {
        iconColor: '#ef4444',
        color: '#ef4444',
      },
      complete: {
        iconColor: '#22c55e',
      },
    },
    hidePostalCode: false,
    iconStyle: 'solid' as const,
    placeholder: '1234 1234 1234 1234',
  }

  const handleCardChange = (event: any) => {
    setCardError(event.error ? event.error.message : null)
    setCardComplete(event.complete)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      toast({
        title: "Error",
        description: "Stripe has not loaded yet. Please try again.",
        variant: "destructive",
      })
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      toast({
        title: "Error", 
        description: "Card element not found. Please refresh and try again.",
        variant: "destructive",
      })
      return
    }

    if (!cardComplete) {
      toast({
        title: "Error",
        description: "Please complete all card details.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: billingDetails.name,
          email: billingDetails.email,
          phone: billingDetails.phone,
        },
      })

      if (paymentMethodError) {
        setCardError(paymentMethodError.message || 'An error occurred')
        setIsProcessing(false)
        return
      }

      // Create payment intent on your server
      const response = await fetch('/api/payments/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: currency.toLowerCase(),
          customerEmail: billingDetails.email,
          customerName: billingDetails.name,
          description: `Trading Academy Subscription`,
          metadata: {
            subscription_id: subscriptionId,
            payment_method: 'stripe',
            customer_phone: billingDetails.phone
          }
        }),
      })

      const { clientSecret, error: intentError } = await response.json()

      if (intentError) {
        throw new Error(intentError)
      }

      // Confirm payment
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
      })

      if (confirmError) {
        setCardError(confirmError.message || 'Payment confirmation failed')
        setIsProcessing(false)
        return
      }

      if (paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment Successful!",
          description: "Your subscription has been activated.",
        })
        
        // Call the success callback
        await onPaymentSubmit({
          paymentIntentId: paymentIntent.id,
          paymentMethodId: paymentMethod.id,
          status: 'succeeded'
        })
      }

    } catch (error) {
      console.error('Stripe payment error:', error)
      setCardError(error instanceof Error ? error.message : 'An unexpected error occurred')
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Billing Details */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="billingName">Full Name</Label>
            <Input
              id="billingName"
              type="text"
              placeholder="John Doe"
              value={billingDetails.name}
              onChange={(e) => setBillingDetails(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="billingEmail">Email</Label>
            <Input
              id="billingEmail"
              type="email"
              placeholder="john@example.com"
              value={billingDetails.email}
              onChange={(e) => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="billingPhone">Phone (Optional)</Label>
          <Input
            id="billingPhone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={billingDetails.phone}
            onChange={(e) => setBillingDetails(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
      </div>

      {/* Stripe Card Element */}
      <div className="space-y-4">
        <Label>Card Details</Label>
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-center space-x-2 mb-3">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-700">Credit or Debit Card</span>
          </div>
          
          <div className="stripe-card-element">
            <CardElement
              options={cardElementOptions}
              onChange={handleCardChange}
            />
          </div>
          
          {cardError && (
            <div className="flex items-center space-x-2 mt-3 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{cardError}</span>
            </div>
          )}
          
          {cardComplete && !cardError && (
            <div className="flex items-center space-x-2 mt-3 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Card details are valid</span>
            </div>
          )}
        </div>
      </div>

      {/* Security Information */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-green-800">Secure Payment with Stripe</h4>
            <ul className="text-sm text-green-700 mt-2 space-y-1">
              <li>• Your card details are processed securely by Stripe</li>
              <li>• PCI DSS Level 1 compliant payment processing</li>
              <li>• Real-time card validation and fraud detection</li>
              <li>• 3D Secure authentication when required</li>
              <li>• No card details stored on our servers</li>
              <li>• Bank-level encryption for all transactions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Amount to Pay:</span>
          <span className="text-lg font-bold text-gray-900">
            ${(amount / 100).toFixed(2)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Currency:</span>
          <span className="text-lg font-bold text-gray-600">{currency.toUpperCase()}</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || !cardComplete || isProcessing}
        className="w-full h-12 text-lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-5 w-5" />
            Pay ${(amount / 100).toFixed(2)} Securely
          </>
        )}
      </Button>

      {/* Powered by Stripe */}
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <Shield className="h-4 w-4" />
        <span>Powered by Stripe</span>
      </div>
    </form>
  )
}

// Main component that wraps Stripe Elements provider
export default function StripeCardElement(props: StripeCardFormProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const elementsOptions: StripeElementsOptions = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0570de',
        colorBackground: '#ffffff',
        colorText: '#424770',
        colorDanger: '#df1b41',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
    loader: 'auto',
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading secure payment form...</span>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <StripeCardForm {...props} />
    </Elements>
  )
}
