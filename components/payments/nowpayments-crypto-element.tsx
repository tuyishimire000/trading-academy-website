"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { 
  Coins, 
  Shield, 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Clock,
  Zap,
  QrCode
} from "lucide-react"
import { Currency, PriceEstimate, PaymentResponse } from "@/lib/services/nowpayments"
import QRCode from 'qrcode'

interface NOWPaymentsCryptoElementProps {
  amount: number
  currency: string
  customerEmail: string
  customerName: string
  subscriptionId: string
  onSuccess: (paymentData: any) => void
  onError: (error: string) => void
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
}

// Fallback currencies for when API is not configured
const fallbackCurrencies: Currency[] = [
  { code: 'btc', name: 'Bitcoin', enabled: true },
  { code: 'eth', name: 'Ethereum', enabled: true },
  { code: 'usdttrc20', name: 'Tether (TRC20)', enabled: true },
  { code: 'usdterc20', name: 'Tether (ERC20)', enabled: true },
  { code: 'usdc', name: 'USD Coin', enabled: true },
  { code: 'trx', name: 'TRON', enabled: true },
  { code: 'sol', name: 'Solana', enabled: true },
  { code: 'ltc', name: 'Litecoin', enabled: true },
]

export default function NOWPaymentsCryptoElement({
  amount,
  currency,
  customerEmail,
  customerName,
  subscriptionId,
  onSuccess,
  onError,
  isProcessing,
  setIsProcessing
}: NOWPaymentsCryptoElementProps) {
  const { toast } = useToast()
  

  
  const [currencies, setCurrencies] = useState<Currency[]>(fallbackCurrencies)
  const [selectedCrypto, setSelectedCrypto] = useState<string>("")
  const [priceEstimate, setPriceEstimate] = useState<PriceEstimate | null>(null)
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<string>("")
  const [loadingCurrencies, setLoadingCurrencies] = useState(true)
  const [loadingEstimate, setLoadingEstimate] = useState(false)
  const [loadingPayment, setLoadingPayment] = useState(false)
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")

     // Popular cryptocurrencies for quick selection
   const popularCryptos = [
     { code: 'btc', name: 'Bitcoin', icon: '₿' },
     { code: 'eth', name: 'Ethereum', icon: 'Ξ' },
     { code: 'usdttrc20', name: 'Tether (TRC20)', icon: '₮' },
     { code: 'usdterc20', name: 'Tether (ERC20)', icon: '₮' },
     { code: 'usdc', name: 'USD Coin', icon: '💲' },
     { code: 'trx', name: 'TRON', icon: '⚡' },
     { code: 'sol', name: 'Solana', icon: '◎' },
     { code: 'ltc', name: 'Litecoin', icon: 'Ł' },
   ]

     // Load available currencies on component mount
   useEffect(() => {
     loadCurrencies()
   }, [])

     // Load available cryptocurrencies
   const loadCurrencies = async () => {
     try {
       setLoadingCurrencies(true)
       const response = await fetch('/api/payments/nowpayments/currencies')
       const data = await response.json()
       
       if (response.ok) {
         // Ensure we have a valid array
         const currenciesArray = Array.isArray(data.currencies) ? data.currencies : []
         
                   // Filter to only allow specific cryptocurrencies with exact matches
          const allowedCurrencies = ['usdc', 'btc', 'eth', 'trx', 'sol', 'ltc']
          const usdtVariants = ['usdttrc20', 'usdterc20']
          
          const filteredCurrencies = currenciesArray.filter(currency => {
            const code = currency.code.toLowerCase()
            // Check for exact matches for most currencies
            if (allowedCurrencies.includes(code)) {
              return true
            }
            // Special handling for USDT - only allow specific variants
            if (usdtVariants.includes(code)) {
              return true
            }
            return false
          })
         
         setCurrencies(filteredCurrencies)
         
                   if (filteredCurrencies.length === 0) {
            setCurrencies(fallbackCurrencies)
            toast({
              title: "Warning",
              description: "No supported currencies returned from API. Using demo mode.",
              variant: "default",
            })
          }
       } else {
         throw new Error(data.error || 'Failed to load currencies')
       }
     } catch (error) {
       console.error('Error loading currencies:', error)
       // Use fallback currencies when API fails
       setCurrencies(fallbackCurrencies)
       toast({
         title: "Warning",
         description: "Using demo cryptocurrencies. Configure NOWPayments API for full functionality.",
         variant: "default",
       })
     } finally {
       setLoadingCurrencies(false)
     }
   }

     // Get price estimate when cryptocurrency is selected
   useEffect(() => {
           if (selectedCrypto && amount > 0) {
        // Always try to get real price estimate first
        getPriceEstimate()
      }
   }, [selectedCrypto, amount])

       // Get price estimate from NOWPayments
  const getPriceEstimate = async () => {
    if (!selectedCrypto || amount <= 0) {
      return
    }

    try {
      setLoadingEstimate(true)
      const response = await fetch('/api/payments/nowpayments/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency_from: currency.toLowerCase(),
          currency_to: selectedCrypto,
          is_fixed_rate: false
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setPriceEstimate(data.estimate)
             } else {
         // Fallback to mock estimate if API fails
        const mockEstimate: PriceEstimate = {
          currency_from: currency.toLowerCase(),
          currency_to: selectedCrypto,
          amount_from: amount.toString(),
          amount_to: (amount * 0.000025).toString(), // Mock BTC rate
          estimated_amount: (amount * 0.000025).toString(),
          rate: '0.000025',
          valid_until: new Date(Date.now() + 300000).toISOString() // 5 minutes from now
        }
        setPriceEstimate(mockEstimate)
        toast({
          title: "Warning",
          description: "Using estimated rates. Real-time rates may vary.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error('Error getting price estimate:', error)
      // Fallback to mock estimate
      const mockEstimate: PriceEstimate = {
        currency_from: currency.toLowerCase(),
        currency_to: selectedCrypto,
        amount_from: amount.toString(),
        amount_to: (amount * 0.000025).toString(),
        estimated_amount: (amount * 0.000025).toString(),
        rate: '0.000025',
        valid_until: new Date(Date.now() + 300000).toISOString()
      }
      setPriceEstimate(mockEstimate)
      toast({
        title: "Warning",
        description: "Using estimated rates. Real-time rates may vary.",
        variant: "default",
      })
    } finally {
      setLoadingEstimate(false)
    }
  }

  // Create payment
  const createPayment = async () => {
    if (!selectedCrypto || !priceEstimate) {
      toast({
        title: "Error",
        description: "Please select a cryptocurrency first.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoadingPayment(true)
      setIsProcessing(true)

      const ipnCallbackUrl = `http://localhost:3000/api/webhooks/nowpayments`
      
      const response = await fetch('/api/payments/nowpayments/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_amount: amount,
          price_currency: currency.toLowerCase(),
          pay_currency: selectedCrypto,
          pay_amount: parseFloat(priceEstimate.estimated_amount),
          ipn_callback_url: ipnCallbackUrl,
          order_id: subscriptionId,
          order_description: `Trading Academy Subscription - ${customerName}`,
          customer_email: customerEmail,
          customer_name: customerName,
          is_fixed_rate: false
        }),
      })

             const data = await response.json()
       
       if (response.ok) {
         
         setPaymentResponse(data.payment)
         setPaymentStatus(data.payment.payment_status)
         
                   // Generate QR code for the payment address
          if (data.payment.pay_address) {
            generateQRCode(data.payment.pay_address)
          }
         
         // Start polling for payment status
         startStatusPolling(data.payment.payment_id)
         
         toast({
           title: "Payment Created!",
           description: "Please send the exact amount to the provided address.",
         })
                                 } else {
           // If API fails, show demo payment info
           const demoPayment: PaymentResponse = {
             payment_id: 'demo-' + Date.now(),
             payment_status: 'waiting',
             pay_address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
             price_amount: amount,
             price_currency: currency.toLowerCase(),
             pay_amount: parseFloat(priceEstimate.estimated_amount),
             pay_currency: selectedCrypto,
             order_id: subscriptionId,
             order_description: `Trading Academy Subscription - ${customerName}`,
             customer_email: customerEmail,
             customer_name: customerName,
             created_at: new Date().toISOString(),
             updated_at: new Date().toISOString()
           }
                       setPaymentResponse(demoPayment)
            setPaymentStatus(demoPayment.payment_status)
            
            // Generate QR code for demo address
            generateQRCode(demoPayment.pay_address)
         
         toast({
           title: "Demo Payment Created!",
           description: "This is a demo payment. Configure NOWPayments API for real payments.",
           variant: "default",
         })
       }
                         } catch (error) {
          console.error('Error creating payment:', error)
          // Show demo payment on error
         const demoPayment: PaymentResponse = {
           payment_id: 'demo-' + Date.now(),
           payment_status: 'waiting',
           pay_address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
           price_amount: amount,
           price_currency: currency.toLowerCase(),
           pay_amount: parseFloat(priceEstimate.estimated_amount),
           pay_currency: selectedCrypto,
           order_id: subscriptionId,
           order_description: `Trading Academy Subscription - ${customerName}`,
           customer_email: customerEmail,
           customer_name: customerName,
           created_at: new Date().toISOString(),
           updated_at: new Date().toISOString()
         }
                   setPaymentResponse(demoPayment)
          setPaymentStatus(demoPayment.payment_status)
          
          // Generate QR code for demo address
          generateQRCode(demoPayment.pay_address)
       
       toast({
         title: "Demo Payment Created!",
         description: "This is a demo payment. Configure NOWPayments API for real payments.",
         variant: "default",
       })
    } finally {
      setLoadingPayment(false)
      setIsProcessing(false)
    }
  }

  // Start polling for payment status
  const startStatusPolling = (paymentId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/nowpayments/payment-status?payment_id=${paymentId}`)
        const data = await response.json()
        
        if (response.ok) {
          setPaymentStatus(data.payment.payment_status)
          
          // Check if payment is completed
          if (data.payment.payment_status === 'finished' || data.payment.payment_status === 'confirmed') {
            clearInterval(interval)
            setStatusCheckInterval(null)
            
            toast({
              title: "Payment Successful!",
              description: "Your cryptocurrency payment has been confirmed.",
            })
            
            onSuccess({
              paymentId: data.payment.payment_id,
              status: data.payment.payment_status,
              amount: data.payment.actually_paid || data.payment.pay_amount,
              currency: data.payment.pay_currency
            })
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
      }
    }, 10000) // Check every 10 seconds

    setStatusCheckInterval(interval)
  }

  // Copy address to clipboard
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast({
      title: "Address Copied!",
      description: "Payment address copied to clipboard",
    })
  }

         // Generate QR code for payment address
    const generateQRCode = async (address: string) => {
      try {
        const qrDataUrl = await QRCode.toDataURL(address, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrCodeDataUrl(qrDataUrl)
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'text-yellow-600'
      case 'confirming':
        return 'text-blue-600'
      case 'confirmed':
      case 'finished':
        return 'text-green-600'
      case 'failed':
      case 'expired':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Clock className="h-4 w-4" />
      case 'confirming':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'confirmed':
      case 'finished':
        return <CheckCircle className="h-4 w-4" />
      case 'failed':
      case 'expired':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval)
      }
    }
  }, [statusCheckInterval])

     return (
     <div className="space-y-6">
       {/* Header */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Coins className="h-5 w-5 text-yellow-600" />
          <span className="font-semibold text-yellow-800">Cryptocurrency Payment</span>
                     {currencies === fallbackCurrencies && (
             <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
               Demo Mode
             </span>
           )}
        </div>
        <p className="text-sm text-yellow-700">
          Pay securely with cryptocurrency. We support Bitcoin, Ethereum, USDT, and many other cryptocurrencies.
                     {currencies === fallbackCurrencies && (
             <span className="block mt-1 text-orange-700">
               ⚠️ Demo mode: Configure NOWPayments API for real payments
             </span>
           )}
        </p>
      </div>

             {/* Cryptocurrency Selection */}
       <div className="space-y-4">
         <Label>Select Cryptocurrency</Label>
         
         {/* Selected Crypto Display */}
         {selectedCrypto && (
           <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
             <div className="flex items-center space-x-2">
               <Coins className="h-4 w-4 text-blue-600" />
               <span className="text-sm font-medium text-blue-800">
                 Selected: {selectedCrypto.toUpperCase()}
               </span>
               <span className="text-xs text-blue-600">
                 ({currencies.find(c => c.code.toLowerCase() === selectedCrypto.toLowerCase())?.name || selectedCrypto})
               </span>
             </div>
           </div>
         )}
         
         {loadingCurrencies ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading cryptocurrencies...</span>
          </div>
        ) : (
          <>
                         {/* Available Cryptocurrencies */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
               {currencies
                 .filter(c => c && c.enabled)
                 .sort((a, b) => a.name.localeCompare(b.name))
                 .map((currency) => (
                   <button
                     key={currency.code}
                     onClick={() => setSelectedCrypto(currency.code)}
                     className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                       selectedCrypto === currency.code
                         ? 'border-yellow-500 bg-yellow-50 shadow-md'
                         : 'border-gray-200 hover:border-gray-300'
                     }`}
                   >
                     <div className="text-lg mb-1">
                       {currency.code === 'btc' ? '₿' : 
                        currency.code === 'eth' ? 'Ξ' : 
                        currency.code.startsWith('usdt') ? '₮' : 
                        currency.code === 'usdc' ? '💲' : 
                        currency.code === 'trx' ? '⚡' : 
                        currency.code === 'sol' ? '◎' : 
                        currency.code === 'ltc' ? 'Ł' : '🪙'}
                     </div>
                     <div className="text-xs font-medium text-gray-700">{currency.name}</div>
                     <div className="text-xs text-gray-500 uppercase">{currency.code}</div>
                   </button>
                 ))}
             </div>
          </>
        )}
      </div>

      {/* Price Estimate */}
      {selectedCrypto && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Price Estimate</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={getPriceEstimate}
              disabled={loadingEstimate}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loadingEstimate ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {loadingEstimate ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="ml-2">Getting price estimate...</span>
            </div>
          ) : priceEstimate ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Amount to Pay:</span>
                  <div className="font-semibold text-lg">
                    ${amount.toFixed(2)} {currency.toUpperCase()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Crypto Amount:</span>
                  <div className="font-semibold text-lg text-yellow-600">
                    {parseFloat(priceEstimate.estimated_amount).toFixed(8)} {selectedCrypto.toUpperCase()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Exchange Rate:</span>
                  <div className="font-medium">
                    1 {currency.toUpperCase()} = {parseFloat(priceEstimate.rate).toFixed(8)} {selectedCrypto.toUpperCase()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Valid Until:</span>
                  <div className="font-medium">
                    {new Date(priceEstimate.valid_until).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-4 text-gray-500">
              Click "Refresh" to get the latest price estimate
            </div>
          )}
        </div>
      )}

             {/* Payment Creation */}
       {selectedCrypto && priceEstimate && !paymentResponse && (
         <div className="space-y-4">
           <Button
             onClick={createPayment}
             disabled={loadingPayment || isProcessing}
             className="w-full h-12 text-lg bg-yellow-500 hover:bg-yellow-600"
           >
             {loadingPayment ? (
               <>
                 <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                 Creating Payment...
               </>
             ) : (
               <>
                 <Zap className="mr-2 h-5 w-5" />
                 Pay with {selectedCrypto.toUpperCase()}
               </>
             )}
           </Button>
         </div>
       )}

      {/* Payment Details */}
      {paymentResponse && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Payment Created Successfully!</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment ID:</span>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {paymentResponse.payment_id}
                </code>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <div className={`flex items-center space-x-1 ${getStatusColor(paymentStatus)}`}>
                  {getStatusIcon(paymentStatus)}
                  <span className="text-sm font-medium capitalize">{paymentStatus}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Amount to Send:</span>
                <span className="font-semibold text-yellow-600">
                  {paymentResponse.pay_amount.toFixed(8)} {paymentResponse.pay_currency.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

                     {/* Payment Address */}
           <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
             <div className="flex items-center justify-between mb-2">
               <Label className="text-sm font-medium">Payment Address:</Label>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => copyAddress(paymentResponse.pay_address)}
               >
                 <Copy className="h-4 w-4" />
               </Button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-white border border-gray-300 rounded p-3">
                 <code className="text-sm break-all">{paymentResponse.pay_address}</code>
               </div>
               
                                {qrCodeDataUrl ? (
                   <div className="flex flex-col items-center space-y-2">
                     <div className="bg-white border border-gray-300 rounded p-3">
                       <img 
                         src={qrCodeDataUrl} 
                         alt="Payment QR Code" 
                         className="w-32 h-32"
                       />
                     </div>
                     <div className="flex items-center space-x-2 text-sm text-gray-600">
                       <QrCode className="h-4 w-4" />
                       <span>Scan to pay</span>
                     </div>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center space-y-2">
                     <div className="bg-white border border-gray-300 rounded p-3 w-32 h-32 flex items-center justify-center">
                       <div className="text-center">
                         <div className="text-gray-400 text-xs">QR Code</div>
                         <div className="text-gray-300 text-xs">Not Generated</div>
                       </div>
                     </div>
                     <div className="flex items-center space-x-2 text-sm text-gray-500">
                       <QrCode className="h-4 w-4" />
                       <span>QR Code not available</span>
                     </div>
                   </div>
                 )}
             </div>
             
             <p className="text-xs text-gray-500 mt-2">
               Send exactly {paymentResponse.pay_amount.toFixed(8)} {paymentResponse.pay_currency.toUpperCase()} to this address
             </p>
           </div>

          {/* Payment Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-800">Payment Instructions</h4>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Send the exact amount shown above to the payment address</li>
                  <li>• Use the correct network for your selected cryptocurrency</li>
                  <li>• Payment will be confirmed within 1-3 network confirmations</li>
                  <li>• Your subscription will be activated automatically once confirmed</li>
                  <li>• Do not send from exchanges - use your personal wallet</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Status Monitoring */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Payment Status:</span>
              <div className={`flex items-center space-x-1 ${getStatusColor(paymentStatus)}`}>
                {getStatusIcon(paymentStatus)}
                <span className="text-sm font-medium capitalize">{paymentStatus}</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Status is automatically checked every 10 seconds. You can close this page and return later.
            </div>
          </div>
        </div>
      )}

      {/* Security Information */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-green-800">Secure Cryptocurrency Payment</h4>
            <ul className="text-sm text-green-700 mt-2 space-y-1">
              <li>• Powered by NOWPayments - trusted by thousands of businesses</li>
              <li>• Real-time exchange rates and price estimates</li>
              <li>• Automatic payment confirmation and status monitoring</li>
              <li>• Support for 100+ cryptocurrencies</li>
              <li>• Secure blockchain transactions</li>
              <li>• No personal data required for crypto payments</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Powered by NOWPayments */}
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <Shield className="h-4 w-4" />
        <span>Powered by NOWPayments</span>
        <a
          href="https://nowpayments.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}
