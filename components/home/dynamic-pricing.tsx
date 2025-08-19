"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star } from "lucide-react"
import { formatPrice } from "@/lib/utils/format"

interface SubscriptionPlan {
  id: string
  name: string
  display_name: string
  description: string
  price: number
  billing_cycle: string
  features: {
    features: string[]
  }
}

export function DynamicPricing() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        console.log("Fetching subscription plans...")

        const res = await fetch("/api/subscription-plans")
        const json = await res.json()
        if (!res.ok) {
          setError(json.error || "Failed to fetch plans")
          throw new Error(json.error || "Failed to fetch plans")
        }
        const data = json.plans as SubscriptionPlan[]
        if (data && data.length > 0) {
          setPlans(data)
        } else {
          setError("No subscription plans available")
        }
      } catch (err) {
        console.error("Exception fetching plans:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch plans")
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  if (loading) {
    return (
      <section id="pricing" className="w-full py-8 md:py-16 lg:py-24 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8 md:mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="text-center pb-4">
                  <div className="h-6 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded w-24 mx-auto"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="pricing" className="w-full py-8 md:py-16 lg:py-24 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
                Choose Your Plan
              </h2>
              <p className="max-w-[900px] text-gray-500 text-base sm:text-lg md:text-xl px-4">
                Start your trading journey with our flexible plans.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-red-600 text-sm">Error loading plans: {error}</p>
                <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="mt-2">
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (plans.length === 0) {
    return (
      <section id="pricing" className="w-full py-8 md:py-16 lg:py-24 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
                Choose Your Plan
              </h2>
              <p className="max-w-[900px] text-gray-500 text-base sm:text-lg md:text-xl px-4">
                Plans are being set up. Please check back soon!
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="pricing" className="w-full py-8 md:py-16 lg:py-24 bg-gray-50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
              Choose Your Plan
            </h2>
            <p className="max-w-[900px] text-gray-500 text-base sm:text-lg md:text-xl px-4">
              Start your trading journey with our flexible plans. All plans include Discord access and money-back
              guarantee.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-6 py-8 md:py-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <Card
              key={plan.id}
              className={`w-full ${
                plan.name === "pro"
                  ? "border-amber-500 relative"
                  : plan.name === "elite"
                    ? "border-2 border-yellow-400"
                    : ""
              }`}
            >
              {plan.name === "pro" && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-amber-500 text-xs sm:text-sm">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle
                  className={`text-lg sm:text-xl ${plan.name === "elite" ? "flex items-center justify-center gap-2" : ""}`}
                >
                  {plan.display_name}
                  {plan.name === "elite" && <Star className="h-4 w-4 text-yellow-500" />}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div>
                  <span className="text-3xl sm:text-4xl font-bold">{formatPrice(plan.price)}</span>
                  <span className="text-gray-500 text-sm sm:text-base">
                    {plan.billing_cycle === "lifetime" ? "" : `/${plan.billing_cycle}`}
                  </span>
                  {plan.billing_cycle === "lifetime" && <div className="text-sm text-gray-500">One-time payment</div>}
                  {plan.name === "elite" && (
                    <div className="text-xs text-green-600 font-semibold">Save $1,800+ vs Pro yearly</div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features?.features?.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`/signup?plan=${plan.name}`} className="w-full block">
                  <Button
                    className={`w-full ${
                      plan.name === "pro"
                        ? "bg-amber-500 hover:bg-amber-600"
                        : plan.name === "elite"
                          ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                          : "bg-transparent"
                    }`}
                    variant={plan.name === "basic" ? "outline" : "default"}
                  >
                    {plan.name === "elite" ? "Get Lifetime Access" : "Get Started"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
