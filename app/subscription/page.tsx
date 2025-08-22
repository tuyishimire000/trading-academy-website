"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { PAYMENT_METHODS_CONFIG } from "@/lib/services/payment"
import { detectCardType, validateCardNumber, validateExpiryDate, validateCVV, getCardTypeColor } from "@/lib/utils/card-utils"
import StripeCardElement from "@/components/payments/stripe-card-element"
import NOWPaymentsCryptoElement from "@/components/payments/nowpayments-crypto-element"
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
  ArrowUp,
  Loader2,
  Coins,
  Copy,
  ExternalLink,
  AlertTriangle
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
  const [userData, setUserData] = useState<any>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [paymentFormData, setPaymentFormData] = useState<any>({})
  const [processingPayment, setProcessingPayment] = useState(false)
  const [upgradePlan, setUpgradePlan] = useState<any>(null)
  const [isUpgrade, setIsUpgrade] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
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
    
    const fetchUserData = async () => {
      try {
        // Fetch authenticated user data
        const userResponse = await fetch("/api/auth/me")
        const userData = await userResponse.json()
        
        if (userResponse.ok && userData.user) {
          console.log("User data:", userData.user)
          setUserData(userData.user)
        } else {
          console.error("Failed to fetch user data:", userData)
          // Redirect to login if not authenticated
          router.push("/auth/signin")
          return
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error)
        router.push("/auth/signin")
        return
      }
    }

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

    const handleUpgradePlan = async () => {
      const planId = searchParams.get('planId')
      if (planId) {
        try {
          const response = await fetch("/api/subscription-plans")
          if (response.ok) {
            const data = await response.json()
            const plan = data.plans.find((p: any) => p.id === planId)
            if (plan) {
              setUpgradePlan(plan)
              setIsUpgrade(true)
              toast({
                title: "Upgrade Plan Selected",
                description: `You're upgrading to ${plan.display_name} for $${plan.price}/${plan.billing_cycle}`,
              })
            }
          }
        } catch (error) {
          console.error("Error fetching upgrade plan:", error)
        }
      }
    }

    fetchUserData().then(() => {
      fetchUserSubscription().then(() => {
        handleUpgradePlan()
      })
    })
  }, [mounted, router, searchParams, toast])

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

    setPaymentFormData((prev: any) => ({
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
        // Validate customer information for crypto payments
        const customerName = paymentFormData.customerName || `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim()
        const customerEmail = paymentFormData.customerEmail || userData?.email
        
        if (!customerName || !customerEmail) {
          toast({
            title: "Error",
            description: "Please fill in your name and email address",
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
      case "stripe":
      case "google_pay":
      case "apple_pay":
        // These methods don't require additional form validation (handled by respective services)
        break
      case "opay":
        if (!paymentFormData.phoneNumber) {
          toast({
            title: "Error",
            description: "Please enter your Nigerian phone number for OPay payment",
            variant: "destructive",
          })
          return false
        }
        
        // Validate Nigerian phone number format
        const nigerianPhoneRegex = /^\+234[0-9]{10}$/
        if (!nigerianPhoneRegex.test(paymentFormData.phoneNumber.replace(/\s/g, ""))) {
          toast({
            title: "Error",
            description: "Please enter a valid Nigerian phone number with +234 country code",
            variant: "destructive",
          })
          return false
        }
        break
      case "card":
        if (!paymentFormData.cardNumber || !paymentFormData.expiryDate || !paymentFormData.cvv || !paymentFormData.cardholderName) {
          toast({
            title: "Error",
            description: "Please fill in all card details",
            variant: "destructive",
          })
          return false
        }
        
        // Validate card number using Luhn algorithm
        const cardNumber = paymentFormData.cardNumber.replace(/\s/g, "")
        if (!validateCardNumber(cardNumber)) {
          toast({
            title: "Error",
            description: "Please enter a valid card number",
            variant: "destructive",
          })
          return false
        }
        
        // Enhanced card type validation with more comprehensive patterns
        const detectedCardType = paymentFormData.cardType
        if (!detectedCardType) {
          toast({
            title: "Error",
            description: "Please enter a valid card number from a supported network",
            variant: "destructive",
          })
          return false
        }
        
        // Validate expiry date using utility function
        if (!validateExpiryDate(paymentFormData.expiryDate)) {
          toast({
            title: "Error",
            description: "Please enter a valid expiry date in MM/YY format",
            variant: "destructive",
          })
          return false
        }
        
        // Validate CVV using utility function
        const cardTypeInfo = detectCardType(cardNumber)
        if (!validateCVV(paymentFormData.cvv, cardTypeInfo || undefined)) {
          const expectedLength = cardTypeInfo?.cvvLength || 3
          toast({
            title: "Error",
            description: `Please enter a valid ${expectedLength}-digit CVV for ${detectedCardType}`,
            variant: "destructive",
          })
          return false
        }
        
        // Validate cardholder name
        if (paymentFormData.cardholderName.trim().length < 2) {
          toast({
            title: "Error",
            description: "Please enter a valid cardholder name",
            variant: "destructive",
          })
          return false
        }
        
        // Additional validation for specific card types
        if (detectedCardType === 'American Express' && cardNumber.length !== 15) {
          toast({
            title: "Error",
            description: "American Express cards must have 15 digits",
            variant: "destructive",
          })
          return false
        }
        
        if (detectedCardType === 'Diners Club' && cardNumber.length !== 14) {
          toast({
            title: "Error",
            description: "Diners Club cards must have 14 digits",
            variant: "destructive",
          })
          return false
        }
        
        break
    }
    return true
  }

  const handleCompletePayment = async () => {
    // Skip form validation for Stripe and Crypto since they're handled by their respective components
    if (selectedPaymentMethod !== "stripe" && selectedPaymentMethod !== "crypto" && !validateForm()) return

    // Skip processing for Stripe and Crypto as they're handled by their respective components
    if (selectedPaymentMethod === "stripe" || selectedPaymentMethod === "crypto") {
      toast({
        title: "Info",
        description: `Please complete your payment using the secure ${selectedPaymentMethod === "stripe" ? "Stripe" : "NOWPayments"} form above.`,
      })
      return
    }

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
           } else if (selectedPaymentMethod === "google_pay") {
             // Google Pay payment initiated
             toast({
               title: "Google Pay Payment Initiated!",
               description: data.message || "Please complete your payment on the next page.",
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
           } else if (selectedPaymentMethod === "apple_pay") {
             // Apple Pay payment initiated
             toast({
               title: "Apple Pay Payment Initiated!",
               description: data.message || "Please complete your payment on the next page.",
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
           } else if (selectedPaymentMethod === "opay") {
             // OPay payment initiated
             toast({
               title: "OPay Payment Initiated!",
               description: data.message || "Please complete your payment on the next page.",
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
           } else if (selectedPaymentMethod === "card") {
             // Card payment initiated
             toast({
               title: "Card Payment Initiated!",
               description: data.message || "Please complete your payment on the next page.",
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
          <NOWPaymentsCryptoElement
            onSuccess={async (paymentData: any) => {
              // Handle successful NOWPayments payment
              toast({
                title: "Payment Successful!",
                description: "Your cryptocurrency payment has been confirmed.",
              })
              router.push("/dashboard")
            }}
            onError={(error: string) => {
              toast({
                title: "Payment Failed",
                description: error,
                variant: "destructive",
              })
            }}
            amount={Math.round((isUpgrade && upgradePlan ? upgradePlan.price : userSubscription?.plan?.price || 9.99) )} // Convert to cents, fallback to $9.99
            currency="usd"
            customerEmail={paymentFormData.customerEmail || userData?.email || ""}
            customerName={paymentFormData.customerName || `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim() || ""}
            subscriptionId={userSubscription?.id || ""}
            isProcessing={processingPayment}
            setIsProcessing={setProcessingPayment}
          />
        )
      case "stripe":
        return (
          <StripeCardElement
            onSuccess={async (paymentIntent: any) => {
              // Handle successful Stripe payment
              toast({
                title: "Payment Successful!",
                description: "Your subscription has been activated.",
              })
              router.push("/dashboard")
            }}
            onError={(error: string) => {
              toast({
                title: "Payment Failed",
                description: error,
                variant: "destructive",
              })
            }}
            amount={Math.round((isUpgrade && upgradePlan ? upgradePlan.price : userSubscription?.plan?.price || 0) * 100)} // Convert to cents
            currency="usd"
            customerEmail={paymentFormData.customerEmail || ""}
            customerName={paymentFormData.customerName || ""}
            subscriptionId={userSubscription?.id || ""}
            isProcessing={processingPayment}
            setIsProcessing={setProcessingPayment}
          />
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
                     setPaymentFormData((prev: any) => ({
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Card Payment</span>
              </div>
              <p className="text-sm text-blue-700">
                Pay securely with your credit or debit card. We support Visa, Mastercard, American Express, Discover, and more.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={paymentFormData.cardNumber || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '')
                      
                      // Use utility function for card type detection
                      const cardTypeInfo = detectCardType(value)
                      const cardType = cardTypeInfo?.type || ''
                      
                      // Format card number based on detected type
                      const formatted = cardTypeInfo ? 
                        value.replace(/(\d{4})(?=\d)/g, '$1 ') : 
                        value.replace(/(\d{4})(?=\d)/g, '$1 ')
                      
                      handleInputChange("cardNumber", formatted)
                      handleInputChange("cardType", cardType)
                    }}
                    maxLength={19}
                    className="pr-12"
                  />
                  {paymentFormData.cardType && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded border shadow-sm">
                        <CreditCard className={`h-4 w-4 ${getCardTypeColor(paymentFormData.cardType)}`} />
                        <span className="text-xs font-medium text-gray-700">
                          {paymentFormData.cardType}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                {paymentFormData.cardType && (
                  <p className="text-xs text-green-600 flex items-center space-x-1">
                    <Shield className="h-3 w-3" />
                    <span>Detected: {paymentFormData.cardType}</span>
                  </p>
                )}
                {paymentFormData.cardNumber && !paymentFormData.cardType && (
                  <p className="text-xs text-orange-600 flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>Card type not recognized</span>
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="text"
                    placeholder="MM/YY"
                    value={paymentFormData.expiryDate || ""}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '')
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4)
                      }
                      handleInputChange("expiryDate", value)
                    }}
                    maxLength={5}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <div className="relative">
                    <Input
                      id="cvv"
                      type="password"
                      placeholder="•••"
                      value={paymentFormData.cvv || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        // Use utility function to get CVV length based on card type
                        const maxLength = paymentFormData.cardType === 'American Express' ? 4 : 3
                        if (value.length <= maxLength) {
                          handleInputChange("cvv", value)
                        }
                      }}
                      maxLength={4}
                      className="pr-10"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center space-x-1">
                    <Shield className="h-3 w-3" />
                    <span>CVV is masked for security • {paymentFormData.cardType === 'American Express' ? '4 digits' : '3 digits'}</span>
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  type="text"
                  placeholder="John Doe"
                  value={paymentFormData.cardholderName || ""}
                  onChange={(e) => handleInputChange("cardholderName", e.target.value)}
                />
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Amount to Pay:</span>
                <span className="text-lg font-bold text-gray-900">
                  ${formatPrice(userSubscription?.plan?.price)}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">Currency:</span>
                <span className="text-lg font-bold text-gray-600">USD</span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-800">Secure Payment</h4>
                  <ul className="text-sm text-green-700 mt-2 space-y-1">
                    <li>• Your card details are encrypted and secure</li>
                    <li>• We support Visa, Mastercard, American Express, Discover, and more</li>
                    <li>• 3D Secure authentication may be required</li>
                    <li>• Payment processing is PCI DSS compliant</li>
                    <li>• No card details are stored on our servers</li>
                    <li>• CVV is masked for enhanced security</li>
                    <li>• Real-time card type detection for better UX</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Secure card payment processing</span>
            </div>
          </div>
        )

      case "google_pay":
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Google Pay</span>
              </div>
              <p className="text-sm text-green-700">
                Pay securely with Google Pay. You'll be redirected to complete your payment securely.
              </p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Amount to Pay:</span>
                <span className="text-lg font-bold text-gray-900">
                  ${formatPrice(userSubscription?.plan?.price)}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">Currency:</span>
                <span className="text-lg font-bold text-green-600">USD</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-800">Payment Instructions</h4>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Click "Pay Now" to proceed with Google Pay</li>
                    <li>• You'll be redirected to Google Pay's secure payment page</li>
                    <li>• Complete your payment using your Google Pay account</li>
                    <li>• Payment will be processed securely</li>
                    <li>• You'll be redirected back after successful payment</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Secure Google Pay payment processing</span>
            </div>
          </div>
        )

      case "apple_pay":
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="h-5 w-5 text-gray-600" />
                <span className="font-semibold text-gray-800">Apple Pay</span>
              </div>
              <p className="text-sm text-gray-700">
                Pay securely with Apple Pay. You'll be redirected to complete your payment securely.
              </p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Amount to Pay:</span>
                <span className="text-lg font-bold text-gray-900">
                  ${formatPrice(userSubscription?.plan?.price)}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">Currency:</span>
                <span className="text-lg font-bold text-gray-600">USD</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-800">Payment Instructions</h4>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Click "Pay Now" to proceed with Apple Pay</li>
                    <li>• You'll be redirected to Apple Pay's secure payment page</li>
                    <li>• Complete your payment using your Apple Pay account</li>
                    <li>• Payment will be processed securely</li>
                    <li>• You'll be redirected back after successful payment</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Secure Apple Pay payment processing</span>
            </div>
          </div>
        )

      case "opay":
        return (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Phone className="h-5 w-5 text-orange-600" />
                <span className="font-semibold text-orange-800">OPay</span>
              </div>
              <p className="text-sm text-orange-700">
                Pay securely with OPay wallet. <strong>Available exclusively for Nigerian users.</strong> You'll be redirected to complete your payment securely.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+2348012345678"
                value={paymentFormData.phoneNumber || ""}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Enter your Nigerian phone number with country code (+234)
              </p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Amount to Pay:</span>
                <span className="text-lg font-bold text-gray-900">
                  ₦{formatPrice(userSubscription?.plan?.price)}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">Currency:</span>
                <span className="text-lg font-bold text-orange-600">NGN (Nigerian Naira)</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-800">Payment Instructions</h4>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Click "Pay Now" to proceed with OPay</li>
                    <li>• You'll be redirected to OPay's secure payment page</li>
                    <li>• Log into your OPay account to authorize the payment</li>
                    <li>• Payment will be processed securely</li>
                    <li>• You'll be redirected back after successful payment</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Important Notice</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    OPay is available exclusively for Nigerian users and transactions in Nigerian Naira (NGN) only. 
                    Please ensure you have an active OPay wallet account.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Secure OPay payment processing</span>
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
                    {/* Customer Information */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-lg mb-4">Customer Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="customerName">Full Name</Label>
                          <Input
                            id="customerName"
                            type="text"
                            placeholder="Enter your full name"
                            value={paymentFormData.customerName || `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim() || ""}
                            onChange={(e) => handleInputChange("customerName", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="customerEmail">Email Address</Label>
                          <Input
                            id="customerEmail"
                            type="email"
                            placeholder="Enter your email address"
                            value={paymentFormData.customerEmail || userData?.email || ""}
                            onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                    
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
                {isUpgrade && upgradePlan && (
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowUp className="h-4 w-4 text-amber-600" />
                      <span className="font-semibold text-amber-800">Plan Upgrade</span>
                    </div>
                    <div className="text-sm text-amber-700">
                      Upgrading from <strong>{userSubscription?.plan?.display_name || 'Current Plan'}</strong> to <strong>{upgradePlan.display_name}</strong>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-semibold">
                    {isUpgrade && upgradePlan ? upgradePlan.display_name : (userSubscription?.plan?.display_name || userSubscription?.plan?.name || 'Unknown Plan')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Billing Cycle:</span>
                  <span className="font-semibold capitalize">
                    {isUpgrade && upgradePlan ? upgradePlan.billing_cycle : (userSubscription?.plan?.billing_cycle || 'monthly')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-amber-600 font-semibold">
                    {isUpgrade ? 'Upgrade Payment Required' : 'Payment Required'}
                  </span>
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
                       ${formatPrice(isUpgrade && upgradePlan ? upgradePlan.price : userSubscription?.plan?.price)}
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
                      Pay ${formatPrice(isUpgrade && upgradePlan ? upgradePlan.price : userSubscription?.plan?.price)}
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
