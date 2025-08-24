"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CreditCard, 
  Download, 
  FileText, 
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
  Shield,
  Plus
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PaymentMethod {
  id: string
  payment_type: string
  payment_provider: string
  display_name: string
  masked_data: string
  is_default: boolean
  is_active: boolean
  metadata: any
}

interface SubscriptionHistory {
  id: string
  action_type: string
  previous_plan: string | null
  new_plan: string
  payment_method: string | null
  payment_amount: number | null
  payment_currency: string | null
  payment_status: string | null
  billing_cycle: string
  transaction_id: string | null
  created_at: string
  metadata: any
}

interface BillingStats {
  totalPayments: number
  successfulPayments: number
  failedPayments: number
  totalAmount: number
  averageAmount: number
  lastPaymentDate: string | null
  nextBillingDate: string | null
}

interface UserSubscription {
  id: string
  status: string
  plan: {
    name: string
    display_name: string
    price: number
    billing_cycle: string
  }
  current_period_end: string
}

export function BillingContent() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistory[]>([])
  const [billingStats, setBillingStats] = useState<BillingStats | null>(null)
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("payment-info")
  const { toast } = useToast()

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      setLoading(true)
      
      // Fetch payment methods
      const paymentMethodsResponse = await fetch("/api/user/payment-methods")
      if (paymentMethodsResponse.ok) {
        const paymentMethodsData = await paymentMethodsResponse.json()
        setPaymentMethods(paymentMethodsData.paymentMethods || [])
      }
      
      // Fetch subscription history
      const historyResponse = await fetch("/api/user/billing/history")
      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        setSubscriptionHistory(historyData.history || [])
      }
      
      // Fetch billing stats
      const statsResponse = await fetch("/api/user/billing/stats")
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setBillingStats(statsData.stats)
      }
      
      // Fetch current subscription
      const subscriptionResponse = await fetch("/api/user/subscription")
      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json()
        setUserSubscription(subscriptionData.subscription)
      }
      
    } catch (error) {
      console.error("Failed to fetch billing data:", error)
      toast({
        title: "Error",
        description: "Failed to load billing information",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getPaymentMethodIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'visa':
        return <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
      case 'mastercard':
        return <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
      case 'mtn':
        return <div className="w-8 h-5 bg-yellow-500 rounded text-white text-xs flex items-center justify-center font-bold">MTN</div>
      case 'usdt':
        return <div className="w-8 h-5 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">USDT</div>
      case 'google_pay':
        return <div className="w-8 h-5 bg-black rounded text-white text-xs flex items-center justify-center font-bold">GP</div>
      default:
        return <CreditCard className="w-8 h-5 text-gray-400" />
    }
  }

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case "payment":
        return <CreditCard className="h-4 w-4" />
      case "renewal":
        return <RefreshCw className="h-4 w-4" />
      case "upgrade":
        return <TrendingUp className="h-4 w-4" />
      case "downgrade":
        return <TrendingDown className="h-4 w-4" />
      case "cancellation":
        return <XCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getPaymentStatusColor = (status: string | null) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const downloadInvoice = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/user/billing/invoice/${transactionId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `invoice-${transactionId}.html`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading billing information...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Info</h1>
        </div>
        <Button onClick={fetchBillingData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payment-info">Payment Info</TabsTrigger>
          <TabsTrigger value="payment-history">Payment History</TabsTrigger>
          <TabsTrigger value="manage-payment">Manage Payment Method</TabsTrigger>
        </TabsList>

        <TabsContent value="payment-info" className="space-y-6">
          {/* Next Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Next payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userSubscription && (
                <>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatDate(userSubscription.current_period_end)}
                  </div>
                  <div className="flex items-center space-x-2">
                    {paymentMethods.find(pm => pm.is_default) && (
                      <>
                        {getPaymentMethodIcon(paymentMethods.find(pm => pm.is_default)!.payment_provider)}
                        <span className="text-gray-700">
                          {paymentMethods.find(pm => pm.is_default)!.display_name}
                        </span>
                      </>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-gray-900">Manage payment method</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-gray-900">Redeem gift or promo code</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
                <button 
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  onClick={() => setActiveTab("payment-history")}
                >
                  <span className="text-gray-900">View payment history</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-history" className="space-y-6">
          {/* Current Plan Section */}
          {userSubscription && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Your Monthly Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-gradient-to-r from-purple-400 to-red-400 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{userSubscription.plan.display_name} plan</h3>
                      <p className="text-gray-600">Your next billing date is {formatDate(userSubscription.current_period_end)}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{formatCurrency(userSubscription.plan.price, "USD")}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment History Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Payment History</span>
                <AlertCircle className="h-4 w-4 text-gray-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Payment Method</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Invoice</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptionHistory
                      .filter((record) => record.payment_status === "completed")
                      .map((record) => (
                        <tr key={record.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-900">
                            {formatDate(record.created_at)}
                          </td>
                          <td className="py-3 px-4 text-gray-900">
                            Membership for {formatDate(record.created_at)}
                          </td>
                          <td className="py-3 px-4 text-gray-900">
                            {record.payment_method ? record.payment_method.toUpperCase() : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            {record.transaction_id && (
                              <button
                                onClick={() => downloadInvoice(record.transaction_id!)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                View
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-gray-900">
                            {formatCurrency(record.payment_amount, record.payment_currency)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage-payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-purple-600" />
                <span>Manage payment method</span>
              </CardTitle>
              <p className="text-gray-600">Control how you pay for your membership.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Payment Method */}
              {paymentMethods.find(pm => pm.is_default) && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getPaymentMethodIcon(paymentMethods.find(pm => pm.is_default)!.payment_provider)}
                      <span className="text-gray-900">
                        {paymentMethods.find(pm => pm.is_default)!.display_name}
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </div>
                </div>
              )}

              {/* Change Payment Method Button */}
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Change Payment Method
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
