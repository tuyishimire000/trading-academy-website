"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { PAYMENT_METHODS_CONFIG } from "@/lib/services/payment"
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Smartphone,
  Building2,
  Apple,
  Wallet,
  Phone,
  Banknote,
  Shield,
  Lock,
  ArrowLeft,
  Loader2,
  Coins,
  Copy,
  ExternalLink
} from "lucide-react"

type PaymentMethod = {
  id: string
  name: string
  icon: React.ComponentType<any>
  description: string
  color: string
  bgColor: string
}

type UserSubscription = {
  id: string
  status: string
  plan: {
    name: string
    display_name: string
    price: number
    billing_cycle: string
  }
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "crypto",
    name: "Cryptocurrency",
    icon: Coins,
    description: "Pay with USDT, BTC, USDC, TRX and other cryptocurrencies",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 border-yellow-200"
  },
  {
    id: "stripe",
    name: "Stripe",
    icon: CreditCard,
    description: "Secure payment with Stripe (Visa, Mastercard, Amex)",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 border-indigo-200"
  },
  {
    id: "mobile_money",
    name: "Mobile Money",
    icon: Smartphone,
    description: "Pay with MTN, Airtel, or other mobile money services",
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200"
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    icon: Building2,
    description: "Direct bank transfer to our account",
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200"
  },
  {
    id: "card_payment",
    name: "Card Payment",
    icon: CreditCard,
    description: "Pay with Visa, Mastercard, or other cards",
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200"
  },
  {
    id: "google_pay",
    name: "Google Pay",
    icon: Wallet,
    description: "Quick and secure payment with Google Pay",
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200"
  },
  {
    id: "apple_pay",
    name: "Apple Pay",
    icon: Apple,
    description: "Secure payment with Apple Pay",
    color: "text-gray-800",
    bgColor: "bg-gray-50 border-gray-200"
  },
  {
    id: "opay",
    name: "OPay",
    icon: Phone,
    description: "Pay with OPay mobile wallet",
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-200"
  }
]

export default function SubscriptionPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [paymentFormData, setPaymentFormData] = useState<any>({})
  const [processingPayment, setProcessingPayment] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Helper function to safely format price
  const formatPrice = (price: any): string => {
    const numPrice = Number(price)
    if (isNaN(numPrice)) return "0.00"
    return numPrice.toFixed(2)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const fetchUserSubscription = async () => {
      try {
        const response = await fetch("/api/user/subscription")
        const data = await response.json()
        
        console.log("Subscription API response:", data)
        
        if (response.ok && data.subscription) {
          console.log("Plan data:", data.subscription.plan)
          console.log("Price type:", typeof data.subscription.plan?.price)
          console.log("Price value:", data.subscription.plan?.price)
          setUserSubscription(data.subscription)
        } else {
          console.error("No subscription found or API error:", data)
        }
      } catch (error) {
        console.error("Failed to fetch subscription:", error)
      }
    }

    fetchUserSubscription()
  }, [mounted])

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId)
    setPaymentFormData({}) // Reset form data when changing payment method
  }

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value

    // Format card number with spaces
    if (field === "cardNumber") {
      formattedValue = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim()
    }

    // Format expiry date
    if (field === "expiryDate") {
      formattedValue = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2")
    }

    setPaymentFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }))
  }

  const validateForm = () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Error",
        description: "Please select a payment method",
        variant: "destructive",
      })
      return false
    }

        // Validate based on payment method
    switch (selectedPaymentMethod) {
      case "crypto":
        if (!paymentFormData.selectedCrypto) {
          toast({
            title: "Error",
            description: "Please select a cryptocurrency",
            variant: "destructive",
          })
          return false
        }
        break
      case "stripe":
        if (!paymentFormData.cardNumber || !paymentFormData.expiryDate || !paymentFormData.cvv || !paymentFormData.cardholderName) {
          toast({
            title: "Error",
            description: "Please fill in all required fields for Stripe payment",
            variant: "destructive",
          })
          return false
        }
        
        // Basic card validation
        const cardNumber = paymentFormData.cardNumber.replace(/\s/g, "")
        if (cardNumber.length < 13 || cardNumber.length > 19) {
          toast({
            title: "Error",
            description: "Please enter a valid card number",
            variant: "destructive",
          })
          return false
        }
        
        if (paymentFormData.cvv.length < 3 || paymentFormData.cvv.length > 4) {
          toast({
            title: "Error",
            description: "Please enter a valid CVV",
            variant: "destructive",
          })
          return false
        }
        break
             case "mobile_money":
         if (!paymentFormData.phoneNumber || !paymentFormData.provider || !paymentFormData.countryCode || !paymentFormData.network) {
           toast({
             title: "Error",
             description: "Please fill in all required fields for Mobile Money",
             variant: "destructive",
           })
           return false
         }
         
         // Validate phone number format
         const phoneRegex = /^\+?[1-9]\d{1,14}$/
         if (!phoneRegex.test(paymentFormData.phoneNumber.replace(/\s/g, ""))) {
           toast({
             title: "Error",
             description: "Please enter a valid phone number",
             variant: "destructive",
           })
           return false
         }
         break
      case "bank_transfer":
        if (!paymentFormData.accountNumber || !paymentFormData.accountName || !paymentFormData.bankName) {
          toast({
            title: "Error",
            description: "Please fill in all required fields for Bank Transfer",
            variant: "destructive",
          })
          return false
        }
        break
             case "card_payment":
        if (!paymentFormData.cardNumber || !paymentFormData.expiryDate || !paymentFormData.cvv || !paymentFormData.cardholderName) {
          toast({
            title: "Error",
            description: "Please fill in all required fields for Card Payment",
            variant: "destructive",
          })
          return false
        }
        
        // Basic card validation
        const cardNumber2 = paymentFormData.cardNumber.replace(/\s/g, "")
        if (cardNumber2.length < 13 || cardNumber2.length > 19) {
          toast({
            title: "Error",
            description: "Please enter a valid card number",
            variant: "destructive",
          })
          return false
        }
        
        if (paymentFormData.cvv.length < 3 || paymentFormData.cvv.length > 4) {
          toast({
            title: "Error",
            description: "Please enter a valid CVV",
            variant: "destructive",
          })
          return false
        }
        break
      case "google_pay":
      case "apple_pay":
      case "opay":
        // These methods typically don't require additional form data
        break
    }
    return true
  }

  const handleCompletePayment = async () => {
    if (!validateForm()) return

    setProcessingPayment(true)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update subscription status to active
      const response = await fetch("/api/user/subscription/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod: selectedPaymentMethod,
          paymentData: paymentFormData
        }),
      })

             const data = await response.json()
       
       if (response.ok && data.success) {
         if (data.status === "pending") {
           if (selectedPaymentMethod === "mobile_money") {
             // Mobile Money payment initiated
             toast({
               title: "Payment Initiated!",
               description: data.message || "Please check your phone for payment prompt.",
             })
             
             // If there's a payment URL, redirect to it
             if (data.paymentUrl) {
               window.location.href = data.paymentUrl
             } else {
               // Wait a bit then redirect to dashboard (payment will be confirmed via webhook)
               setTimeout(() => {
                 router.push("/dashboard")
               }, 2000)
             }
           } else if (selectedPaymentMethod === "bank_transfer") {
             // Bank transfer initiated - show transfer details
             toast({
               title: "Bank Transfer Initiated!",
               description: "Please use the provided account details to complete your payment.",
             })
             
             // Show bank transfer details modal or redirect to a details page
             if (data.transferDetails) {
               // Store transfer details in sessionStorage for the details page
               sessionStorage.setItem('bankTransferDetails', JSON.stringify(data.transferDetails))
               router.push("/payment/bank-transfer-details")
             } else {
               // Fallback to dashboard
               setTimeout(() => {
                 router.push("/dashboard")
               }, 2000)
             }
           } else {
             // Other pending payments
             toast({
               title: "Payment Initiated!",
               description: data.message || "Payment is being processed.",
             })
             setTimeout(() => {
               router.push("/dashboard")
             }, 2000)
           }
         } else {
           // Payment completed immediately
           toast({
             title: "Payment Successful!",
             description: "Your subscription has been activated. Welcome to Trading Academy!",
           })
           router.push("/dashboard")
         }
       } else {
         throw new Error(data.error || "Failed to activate subscription")
       }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to complete payment",
        variant: "destructive",
      })
    } finally {
      setProcessingPayment(false)
    }
  }

  const renderPaymentForm = () => {
    switch (selectedPaymentMethod) {
      case "crypto":
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Coins className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">Cryptocurrency Payment</span>
              </div>
              <p className="text-sm text-yellow-700">
                Pay securely with cryptocurrency. We accept USDT, BTC, USDC, TRX, and other stable cryptocurrencies.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="selectedCrypto">Select Cryptocurrency</Label>
              <Select 
                value={paymentFormData.selectedCrypto || ""} 
                onValueChange={(value) => handleInputChange("selectedCrypto", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose your cryptocurrency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usdt">USDT (Tether) - Stable</SelectItem>
                  <SelectItem value="usdc">USDC (USD Coin) - Stable</SelectItem>
                  <SelectItem value="btc">BTC (Bitcoin)</SelectItem>
                  <SelectItem value="trx">TRX (TRON)</SelectItem>
                  <SelectItem value="eth">ETH (Ethereum)</SelectItem>
                  <SelectItem value="bnb">BNB (Binance Coin)</SelectItem>
                  <SelectItem value="dai">DAI (Dai) - Stable</SelectItem>
                  <SelectItem value="busd">BUSD (Binance USD) - Stable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mounted && paymentFormData.selectedCrypto && (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Amount to Pay:</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${formatPrice(userSubscription.plan?.price)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">Crypto Amount:</span>
                                         <span className="text-lg font-bold text-yellow-600">
                       {mounted ? (() => {
                         const price = Number(userSubscription.plan?.price || 0)
                         const cryptoRates = {
                           usdt: price,
                           usdc: price,
                           dai: price,
                           busd: price,
                           btc: price / 45000, // Approximate BTC rate
                           trx: price / 0.08, // Approximate TRX rate
                           eth: price / 2500, // Approximate ETH rate
                           bnb: price / 300, // Approximate BNB rate
                         }
                         const rate = cryptoRates[paymentFormData.selectedCrypto as keyof typeof cryptoRates] || price
                         return rate.toFixed(6)
                       })() : "0.000000"} {mounted ? paymentFormData.selectedCrypto?.toUpperCase() : ""}
                     </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Wallet Address:</span>
                      <div className="flex items-center space-x-2">
                                                 <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                           {mounted ? (() => {
                             const addresses = {
                               usdt: "TQn9Y2khDD95J42FQtQTdwVVR93rLXk6L9",
                               usdc: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
                               dai: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
                               busd: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
                               btc: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
                               trx: "TQn9Y2khDD95J42FQtQTdwVVR93rLXk6L9",
                               eth: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
                               bnb: "bnb1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                             }
                             return addresses[paymentFormData.selectedCrypto as keyof typeof addresses] || "Address not available"
                           })() : "Loading..."}
                         </code>
                        <Button
                          variant="ghost"
                          size="sm"
                                                     onClick={() => {
                             if (!mounted) return
                             const address = (() => {
                               const addresses = {
                                 usdt: "TQn9Y2khDD95J42FQtQTdwVVR93rLXk6L9",
                                 usdc: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
                                 dai: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
                                 busd: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
                                 btc: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
                                 trx: "TQn9Y2khDD95J42FQtQTdwVVR93rLXk6L9",
                                 eth: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
                                 bnb: "bnb1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                               }
                               return addresses[paymentFormData.selectedCrypto as keyof typeof addresses] || ""
                             })()
                             navigator.clipboard.writeText(address)
                             toast({
                               title: "Address Copied!",
                               description: "Wallet address copied to clipboard",
                             })
                           }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Network:</span>
                                             <span className="text-sm font-medium text-gray-900">
                         {mounted ? (() => {
                           const networks = {
                             usdt: "TRC20 / ERC20",
                             usdc: "ERC20",
                             dai: "ERC20",
                             busd: "BEP20",
                             btc: "Bitcoin",
                             trx: "TRON",
                             eth: "Ethereum",
                             bnb: "Binance Smart Chain"
                           }
                           return networks[paymentFormData.selectedCrypto as keyof typeof networks] || "Unknown"
                         })() : "Loading..."}
                       </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Transaction Fee:</span>
                                             <span className="text-sm font-medium text-gray-900">
                         {mounted ? (() => {
                           const fees = {
                             usdt: "$1-5",
                             usdc: "$5-15",
                             dai: "$5-15",
                             busd: "$0.5-2",
                             btc: "$2-10",
                             trx: "$0.1-1",
                             eth: "$5-20",
                             bnb: "$0.5-2"
                           }
                           return fees[paymentFormData.selectedCrypto as keyof typeof fees] || "Variable"
                         })() : "Loading..."}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-800">Payment Instructions</h4>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• Send the exact amount shown above to the wallet address</li>
                        <li>• Use the correct network for your selected cryptocurrency</li>
                        <li>• Include a memo/note with your email address for faster processing</li>
                        <li>• Payment will be confirmed within 1-3 network confirmations</li>
                        <li>• Your subscription will be activated automatically once confirmed</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>Secure blockchain payment processing</span>
                </div>
              </div>
            )}
          </div>
        )
      case "stripe":
        return (
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="h-5 w-5 text-indigo-600" />
                <span className="font-semibold text-indigo-800">Stripe Secure Payment</span>
              </div>
              <p className="text-sm text-indigo-700">
                Your payment is processed securely by Stripe. We accept Visa, Mastercard, and American Express.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                type="text"
                placeholder="Name on card"
                value={paymentFormData.cardholderName || ""}
                onChange={(e) => handleInputChange("cardholderName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={paymentFormData.cardNumber || ""}
                onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="text"
                  placeholder="MM/YY"
                  value={paymentFormData.expiryDate || ""}
                  onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  value={paymentFormData.cvv || ""}
                  onChange={(e) => handleInputChange("cvv", e.target.value)}
                  maxLength={4}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Your payment information is encrypted and secure</span>
            </div>
          </div>
        )
             case "mobile_money":
         return (
           <div className="space-y-4">
             <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
               <div className="flex items-center space-x-2 mb-2">
                 <Smartphone className="h-5 w-5 text-green-600" />
                 <span className="font-semibold text-green-800">Mobile Money Payment</span>
               </div>
               <p className="text-sm text-green-700">
                 Pay securely with your mobile money account. You'll receive a payment prompt on your phone.
               </p>
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="provider">Mobile Money Provider</Label>
               <Select 
                 value={paymentFormData.provider || ""} 
                 onValueChange={(value) => {
                   handleInputChange("provider", value)
                   // Auto-fill country code and network based on provider
                   const provider = PAYMENT_METHODS_CONFIG.mobile_money.providers.find(p => p.id === value)
                   if (provider) {
                     setPaymentFormData(prev => ({
                       ...prev,
                       countryCode: provider.countryCode,
                       network: provider.network
                     }))
                   }
                 }}
               >
                 <SelectTrigger>
                   <SelectValue placeholder="Select your mobile money provider" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="MTN">MTN Mobile Money (Ghana)</SelectItem>
                   <SelectItem value="VOD">Vodafone Cash (Ghana)</SelectItem>
                   <SelectItem value="TGO">AirtelTigo Money (Ghana)</SelectItem>
                   <SelectItem value="MPZ">M-Pesa (Kenya)</SelectItem>
                   <SelectItem value="AIRTEL">Airtel Money (Kenya)</SelectItem>
                   <SelectItem value="MPS">M-Pesa (Tanzania)</SelectItem>
                   <SelectItem value="MPU">M-Pesa (Uganda)</SelectItem>
                   <SelectItem value="MPR">M-Pesa (Rwanda)</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="phoneNumber">Phone Number</Label>
               <Input
                 id="phoneNumber"
                 type="tel"
                 placeholder="e.g., +233 24 123 4567"
                 value={paymentFormData.phoneNumber || ""}
                 onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
               />
               <p className="text-xs text-gray-500">
                 Enter your phone number with country code (e.g., +233 for Ghana)
               </p>
             </div>
             
             {paymentFormData.provider && (
               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                 <div className="flex items-start space-x-2">
                   <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                   <div>
                     <h4 className="font-semibold text-blue-800">Payment Instructions</h4>
                     <ul className="text-sm text-blue-700 mt-2 space-y-1">
                       <li>• Ensure your phone is nearby and has network coverage</li>
                       <li>• You'll receive a payment prompt on your phone</li>
                       <li>• Enter your mobile money PIN when prompted</li>
                       <li>• Payment will be processed instantly</li>
                       <li>• You'll receive a confirmation SMS</li>
                     </ul>
                   </div>
                 </div>
               </div>
             )}
             
             <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
               <Shield className="h-4 w-4" />
               <span>Secure mobile money payment processing</span>
             </div>
           </div>
         )

      case "bank_transfer":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Select 
                value={paymentFormData.bankName || ""} 
                onValueChange={(value) => handleInputChange("bankName", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gtb">GT Bank</SelectItem>
                  <SelectItem value="zenith">Zenith Bank</SelectItem>
                  <SelectItem value="access">Access Bank</SelectItem>
                  <SelectItem value="first">First Bank</SelectItem>
                  <SelectItem value="uba">UBA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                type="text"
                placeholder="Enter account number"
                value={paymentFormData.accountNumber || ""}
                onChange={(e) => handleInputChange("accountNumber", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                type="text"
                placeholder="Enter account holder name"
                value={paymentFormData.accountName || ""}
                onChange={(e) => handleInputChange("accountName", e.target.value)}
              />
            </div>
          </div>
        )

      case "card_payment":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                type="text"
                placeholder="Name on card"
                value={paymentFormData.cardholderName || ""}
                onChange={(e) => handleInputChange("cardholderName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={paymentFormData.cardNumber || ""}
                onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="text"
                  placeholder="MM/YY"
                  value={paymentFormData.expiryDate || ""}
                  onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  value={paymentFormData.cvv || ""}
                  onChange={(e) => handleInputChange("cvv", e.target.value)}
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        )

      case "google_pay":
      case "apple_pay":
      case "opay":
        return (
          <div className="text-center py-8">
            <div className="flex items-center justify-center mb-4">
              {selectedPaymentMethod === "google_pay" && <Wallet className="h-12 w-12 text-red-600" />}
              {selectedPaymentMethod === "apple_pay" && <Apple className="h-12 w-12 text-gray-800" />}
              {selectedPaymentMethod === "opay" && <Phone className="h-12 w-12 text-orange-600" />}
            </div>
            <p className="text-gray-600 mb-4">
              You'll be redirected to complete your payment securely.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Secure payment processing</span>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (!userSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading subscription details...</span>
        </div>
      </div>
    )
  }

  // Check if user has a valid subscription with plan details
  if (!userSubscription.plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Subscription Found</h2>
          <p className="text-gray-600 mb-4">You don't have an active subscription plan.</p>
          <div className="space-x-4">
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/signup">
              <Button>
                Choose a Plan
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center mb-4">
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Trading Academy
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
          <p className="text-gray-600">Choose your preferred payment method to activate your subscription</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Select Payment Method</span>
                </CardTitle>
                <CardDescription>
                  Choose how you'd like to pay for your subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon
                    const isSelected = selectedPaymentMethod === method.id
                    return (
                      <button
                        key={method.id}
                        onClick={() => handlePaymentMethodSelect(method.id)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                          isSelected 
                            ? `${method.bgColor} border-2 border-amber-500 shadow-md` 
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-white' : method.bgColor}`}>
                            <Icon className={`h-6 w-6 ${method.color}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{method.name}</h3>
                            <p className="text-sm text-gray-500">{method.description}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {selectedPaymentMethod && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-lg mb-4">Payment Details</h3>
                    {renderPaymentForm()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                                 <div className="flex justify-between items-center">
                   <span className="text-gray-600">Plan:</span>
                   <span className="font-semibold">{userSubscription.plan?.display_name || userSubscription.plan?.name || 'Unknown Plan'}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-gray-600">Billing Cycle:</span>
                   <span className="font-semibold capitalize">{userSubscription.plan?.billing_cycle || 'monthly'}</span>
                 </div>
                                 <div className="flex justify-between items-center">
                   <span className="text-gray-600">Status:</span>
                   <span className="text-amber-600 font-semibold">Payment Required</span>
                 </div>
                 {selectedPaymentMethod && (
                   <div className="flex justify-between items-center">
                     <span className="text-gray-600">Payment Method:</span>
                     <div className="flex items-center space-x-2">
                       {(() => {
                         const method = paymentMethods.find(m => m.id === selectedPaymentMethod)
                         if (!method) return <span className="text-sm">Selected</span>
                         const Icon = method.icon
                         return (
                           <>
                             <Icon className={`h-4 w-4 ${method.color}`} />
                             <span className="text-sm font-medium">{method.name}</span>
                           </>
                         )
                       })()}
                     </div>
                   </div>
                 )}
                                 <div className="border-t pt-4">
                   <div className="flex justify-between items-center text-lg font-bold">
                     <span>Total:</span>
                                           <span className="text-2xl text-amber-600">
                        ${formatPrice(userSubscription.plan?.price)}
                      </span>
                   </div>
                 </div>

                <Button
                  onClick={handleCompletePayment}
                  className="w-full bg-amber-500 hover:bg-amber-600"
                  disabled={!selectedPaymentMethod || processingPayment}
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                                         <>
                       <Lock className="h-4 w-4 mr-2" />
                       Pay ${formatPrice(userSubscription.plan?.price)}
                     </>
                  )}
                </Button>

                <div className="text-center">
                  <Link href="/dashboard">
                    <Button variant="ghost" className="text-sm">
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-green-800">Secure Payment</h4>
                      <p className="text-sm text-green-700">
                        Your payment information is encrypted and secure. We never store your payment details.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
