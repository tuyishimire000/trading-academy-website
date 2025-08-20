"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react"

export default function PaymentSuccessPage() {
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<string>("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const txRef = searchParams.get('tx_ref')
        const status = searchParams.get('status')
        
        if (status === 'successful' && txRef) {
          // Verify payment with Flutterwave
          const response = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ txRef })
          })

          const data = await response.json()
          
          if (data.success) {
            setPaymentStatus('success')
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              router.push('/dashboard')
            }, 3000)
          } else {
            setPaymentStatus('failed')
          }
        } else {
          setPaymentStatus('failed')
        }
      } catch (error) {
        console.error('Payment verification error:', error)
        setPaymentStatus('failed')
      } finally {
        setLoading(false)
      }
    }

    checkPaymentStatus()
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    )
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your subscription has been activated successfully. You'll be redirected to your dashboard shortly.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Access to all premium courses</li>
                <li>• Live trading sessions</li>
                <li>• Community forum access</li>
                <li>• Portfolio tracking tools</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            <p className="text-xs text-gray-500">
              Redirecting automatically in 3 seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-red-600">✕</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Payment Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            We couldn't verify your payment. Please try again or contact support if the issue persists.
          </p>
          
          <div className="flex space-x-3">
            <Link href="/subscription" className="flex-1">
              <Button variant="outline" className="w-full">
                Try Again
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Need Help?</h3>
            <p className="text-sm text-yellow-700">
              If you believe this is an error, please contact our support team with your transaction reference.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

