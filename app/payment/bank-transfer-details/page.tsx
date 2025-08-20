"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Building2, 
  Copy, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  ExternalLink,
  AlertCircle
} from "lucide-react"

interface TransferDetails {
  transferReference: string
  transferAccount: string
  transferBank: string
  accountExpiration: string
  transferNote: string
  transferAmount: number
}

export default function BankTransferDetailsPage() {
  const [transferDetails, setTransferDetails] = useState<TransferDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Get transfer details from sessionStorage
    const storedDetails = sessionStorage.getItem('bankTransferDetails')
    if (storedDetails) {
      try {
        const details = JSON.parse(storedDetails)
        setTransferDetails(details)
      } catch (error) {
        console.error('Error parsing transfer details:', error)
        toast({
          title: "Error",
          description: "Failed to load transfer details",
          variant: "destructive",
        })
        router.push("/subscription")
      }
    } else {
      toast({
        title: "No Transfer Details",
        description: "No bank transfer details found",
        variant: "destructive",
      })
      router.push("/subscription")
    }
    setLoading(false)
  }, [router, toast])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const formatExpiration = (expiration: string) => {
    try {
      const date = new Date(expiration)
      return date.toLocaleString()
    } catch {
      return expiration
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transfer details...</p>
        </div>
      </div>
    )
  }

  if (!transferDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Transfer Details</h2>
          <p className="text-gray-600 mb-4">No bank transfer details were found.</p>
          <Button onClick={() => router.push("/subscription")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payment
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/subscription")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payment
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bank Transfer Details
            </h1>
            <p className="text-gray-600">
              Please use the details below to complete your bank transfer
            </p>
          </div>
        </div>

        {/* Transfer Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span>Transfer Information</span>
            </CardTitle>
            <CardDescription>
              Complete your payment using these bank transfer details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">Transfer Amount:</span>
                <span className="text-2xl font-bold text-blue-900">
                  ₦{transferDetails.transferAmount?.toLocaleString() || '0'}
                </span>
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Bank Name</p>
                  <p className="font-semibold text-gray-900">{transferDetails.transferBank}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(transferDetails.transferBank, "Bank name")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Account Number</p>
                  <p className="font-mono font-semibold text-gray-900">{transferDetails.transferAccount}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(transferDetails.transferAccount, "Account number")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Transfer Reference</p>
                  <p className="font-mono font-semibold text-gray-900">{transferDetails.transferReference}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(transferDetails.transferReference, "Transfer reference")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Transfer Note</p>
                  <p className="font-semibold text-gray-900">{transferDetails.transferNote}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(transferDetails.transferNote, "Transfer note")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Expiration Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Account Expiration</h4>
                  <p className="text-sm text-yellow-700 mb-2">
                    This virtual account will expire on: <strong>{formatExpiration(transferDetails.accountExpiration)}</strong>
                  </p>
                  <p className="text-sm text-yellow-700">
                    Please complete your transfer before the expiration time to avoid payment issues.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>How to Complete Your Transfer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Open your banking app or visit your bank</p>
                  <p className="text-sm text-gray-600">Use your preferred banking method to initiate a transfer</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">Enter the transfer details</p>
                  <p className="text-sm text-gray-600">Use the bank name, account number, and transfer reference provided above</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">Complete the transfer</p>
                  <p className="text-sm text-gray-600">Ensure the amount matches exactly and include the transfer reference in the note</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <div>
                  <p className="font-medium text-gray-900">Wait for confirmation</p>
                  <p className="text-sm text-gray-600">Your subscription will be activated automatically once the payment is confirmed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            className="flex-1" 
            onClick={() => router.push("/dashboard")}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
          
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              // Clear the stored details
              sessionStorage.removeItem('bankTransferDetails')
              router.push("/subscription")
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payment
          </Button>
        </div>

        {/* Status Badge */}
        <div className="mt-6 text-center">
          <Badge variant="secondary" className="text-sm">
            <Clock className="h-3 w-3 mr-1" />
            Payment Pending - Awaiting Bank Transfer
          </Badge>
        </div>
      </div>
    </div>
  )
}

