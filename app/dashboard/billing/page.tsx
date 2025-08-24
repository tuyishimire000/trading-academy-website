"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Minus
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

export default function BillingPage() {
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistory[]>([])
  const [billingStats, setBillingStats] = useState<BillingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      setLoading(true)
      
      // Fetch subscription history
      const historyResponse = await fetch("/api/user/billing/history")
      const historyData = await historyResponse.json()
      
      if (historyResponse.ok) {
        setSubscriptionHistory(historyData.history || [])
      }
      
      // Fetch billing stats
      const statsResponse = await fetch("/api/user/billing/stats")
      const statsData = await statsResponse.json()
      
      if (statsResponse.ok) {
        setBillingStats(statsData.stats)
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

  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case "payment":
        return "bg-blue-100 text-blue-800"
      case "renewal":
        return "bg-green-100 text-green-800"
      case "upgrade":
        return "bg-purple-100 text-purple-800"
      case "downgrade":
        return "bg-orange-100 text-orange-800"
      case "cancellation":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusIcon = (status: string | null) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "refunded":
        return <ArrowDownRight className="h-4 w-4 text-blue-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
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
      hour: "2-digit",
      minute: "2-digit",
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
        a.download = `invoice-${transactionId}.pdf`
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
          <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
          <p className="text-gray-600 mt-1">
            Manage your subscription payments and view billing history
          </p>
        </div>
        <Button onClick={fetchBillingData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Billing Stats */}
          {billingStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{billingStats.totalPayments}</div>
                  <p className="text-xs text-muted-foreground">
                    {billingStats.successfulPayments} successful
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(billingStats.totalAmount, "USD")}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Avg: {formatCurrency(billingStats.averageAmount, "USD")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {billingStats.totalPayments > 0
                      ? Math.round((billingStats.successfulPayments / billingStats.totalPayments) * 100)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {billingStats.failedPayments} failed payments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {billingStats.nextBillingDate
                      ? new Date(billingStats.nextBillingDate).toLocaleDateString()
                      : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last: {billingStats.lastPaymentDate
                      ? new Date(billingStats.lastPaymentDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest subscription and payment activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptionHistory.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${getActionTypeColor(record.action_type)}`}>
                        {getActionTypeIcon(record.action_type)}
                      </div>
                      <div>
                        <p className="font-medium capitalize">
                          {record.action_type.replace("_", " ")}
                        </p>
                        <p className="text-sm text-gray-600">
                          {record.previous_plan ? `${record.previous_plan} → ` : ""}
                          {record.new_plan}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(record.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {record.payment_amount && (
                        <span className="font-medium">
                          {formatCurrency(record.payment_amount, record.payment_currency)}
                        </span>
                      )}
                      {record.payment_status && (
                        <Badge className={getPaymentStatusColor(record.payment_status)}>
                          {record.payment_status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                Complete history of all your subscription payments and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptionHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No payment history found</p>
                  </div>
                ) : (
                  subscriptionHistory.map((record) => (
                    <div key={record.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-full ${getActionTypeColor(record.action_type)}`}>
                            {getActionTypeIcon(record.action_type)}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold capitalize">
                                {record.action_type.replace("_", " ")}
                              </h3>
                              <Badge className={getActionTypeColor(record.action_type)}>
                                {record.action_type}
                              </Badge>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Plan Change:</span>{" "}
                                {record.previous_plan ? (
                                  <>
                                    <span className="text-gray-500">{record.previous_plan}</span>
                                    <ArrowUpRight className="h-3 w-3 inline mx-1" />
                                  </>
                                ) : (
                                  <Minus className="h-3 w-3 inline mx-1" />
                                )}
                                <span className="font-medium">{record.new_plan}</span>
                              </p>
                              
                              {record.payment_method && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Payment Method:</span>{" "}
                                  {record.payment_method.replace("_", " ")}
                                </p>
                              )}
                              
                              {record.transaction_id && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Transaction ID:</span>{" "}
                                  <code className="bg-gray-100 px-1 rounded text-xs">
                                    {record.transaction_id}
                                  </code>
                                </p>
                              )}
                              
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Billing Cycle:</span>{" "}
                                {record.billing_cycle}
                              </p>
                              
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Date:</span>{" "}
                                {formatDate(record.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          {record.payment_amount && (
                            <div className="text-right">
                              <p className="text-lg font-bold">
                                {formatCurrency(record.payment_amount, record.payment_currency)}
                              </p>
                              {record.payment_status && (
                                <div className="flex items-center space-x-1 mt-1">
                                  {getPaymentStatusIcon(record.payment_status)}
                                  <Badge className={getPaymentStatusColor(record.payment_status)}>
                                    {record.payment_status}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {record.transaction_id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadInvoice(record.transaction_id!)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Invoice
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>
                Download your payment invoices and receipts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptionHistory
                  .filter((record) => record.transaction_id && record.payment_status === "completed")
                  .map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                        <div>
                          <p className="font-medium">
                            Invoice #{record.transaction_id}
                          </p>
                          <p className="text-sm text-gray-600">
                            {record.action_type.replace("_", " ")} - {record.new_plan}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(record.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(record.payment_amount, record.payment_currency)}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {record.payment_method?.replace("_", " ")}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => downloadInvoice(record.transaction_id!)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                
                {subscriptionHistory.filter((record) => record.transaction_id && record.payment_status === "completed").length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No invoices available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
