"use client"

import type React from "react"
import { useState, useEffect } from "react"

export const dynamic = 'force-dynamic'
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, AlertCircle, Phone } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [subscriptionPlans, setSubscriptionPlans] = useState([])
  const [selectedPlanId, setSelectedPlanId] = useState(searchParams.get("planId") || "")
  const [isPlanLocked, setIsPlanLocked] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    planId: searchParams.get("planId") || "",
  })

  // Fetch subscription plans on component mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch("/api/subscription-plans")
        const data = await response.json()
        
                 if (response.ok && data.plans) {
           // Filter out plans with empty IDs and log for debugging
           const validPlans = data.plans.filter((plan: any) => plan.id && plan.id.trim() !== '')
           console.log("Fetched plans:", data.plans)
           console.log("Valid plans (with IDs):", validPlans)
           setSubscriptionPlans(validPlans)
          
          // If planId is provided in URL, lock the plan selection
          const planIdFromUrl = searchParams.get("planId")
          console.log("PlanId from URL:", planIdFromUrl)
          
                     if (planIdFromUrl) {
             setSelectedPlanId(planIdFromUrl)
             setFormData(prev => ({ ...prev, planId: planIdFromUrl }))
             setIsPlanLocked(true)
             console.log("Plan locked with ID:", planIdFromUrl)
           } else if (data.plans.length > 0) {
             // Find first valid plan (with non-empty ID)
             const firstValidPlan = data.plans.find((plan: any) => plan.id && plan.id.trim() !== '')
             if (firstValidPlan) {
               setSelectedPlanId(firstValidPlan.id)
               setFormData(prev => ({ ...prev, planId: firstValidPlan.id }))
               console.log("Default plan set:", firstValidPlan.id)
             }
           }
        }
      } catch (error) {
        console.error("Failed to fetch subscription plans:", error)
        toast({
          title: "Error",
          description: "Failed to load subscription plans",
          variant: "destructive",
        })
      }
    }

    fetchPlans()
  }, [searchParams, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    if (!formData.planId) {
      toast({
        title: "Error",
        description: "Please select a subscription plan",
        variant: "destructive",
      })
      return
    }

    console.log("Submitting form with planId:", formData.planId)
    setLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          planId: formData.planId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account")
      }

      if (data.needsEmailVerification) {
        toast({
          title: "Check your email!",
          description: "We've sent you a verification code to complete your registration.",
        })
        // Redirect to email verification page
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
      } else {
        toast({
          title: "Success!",
          description: "Account created successfully!",
        })
        router.push("/dashboard")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number, billingCycle: string) => {
    if (billingCycle === 'lifetime') {
      return `$${price.toFixed(2)} (Lifetime)`
    }
    return `$${price.toFixed(2)}/${billingCycle}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center mb-4 sm:mb-6">
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Prime Aura Trading Academy
            </span>
          </Link>
        </div>

        <Card className="w-full">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl sm:text-2xl text-center">Create Your Account</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              Join thousands of successful traders today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                    className="h-10 pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Enter your phone number with country code (e.g., +1 for US)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan" className="text-sm">
                  Subscription Plan
                  {isPlanLocked && <span className="text-xs text-amber-600 ml-2">(Pre-selected)</span>}
                </Label>
                <Select 
                  value={selectedPlanId || ""} 
                  onValueChange={(value) => {
                    if (value && value.trim() !== '') {
                      setSelectedPlanId(value)
                      setFormData({ ...formData, planId: value })
                    }
                  }}
                  disabled={isPlanLocked}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptionPlans
                      .filter((plan: any) => plan.id && plan.id.trim() !== '') // Filter out plans with empty IDs
                      .map((plan: any) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.display_name || plan.name} - {formatPrice(plan.price, plan.billing_cycle)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {isPlanLocked && (
                  <p className="text-xs text-amber-600">
                    This plan was pre-selected based on your choice from the landing page.
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 h-10 sm:h-11" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account & Subscribe"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-amber-500 hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
