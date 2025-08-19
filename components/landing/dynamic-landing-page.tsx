"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MobileNav } from "@/components/mobile-nav"
import { DynamicPricing } from "@/components/home/dynamic-pricing"
import { DynamicCourses } from "@/components/home/dynamic-courses"
import { EnvCheck } from "@/components/env-check"
import { Users, BookOpen, Shield, Award, BarChart3, Target, Clock, DollarSign } from "lucide-react"

interface WebsiteSettings {
  branding: {
    websiteName: string
    logo: string
    favicon: string
    tagline: string
  }
  landingPage: {
    theme: {
      primaryColor: string
      secondaryColor: string
      accentColor: string
      backgroundColor: string
      textColor: string
    }
    layout: {
      hero: { order: number; visible: boolean }
      features: { order: number; visible: boolean }
      testimonials: { order: number; visible: boolean }
      pricing: { order: number; visible: boolean }
      about: { order: number; visible: boolean }
      contact: { order: number; visible: boolean }
    }
    content: {
      hero: {
        title: string
        subtitle: string
        ctaText: string
        ctaLink: string
      }
      features: {
        title: string
        subtitle: string
      }
      testimonials: {
        title: string
        subtitle: string
      }
      pricing: {
        title: string
        subtitle: string
      }
      about: {
        title: string
        subtitle: string
      }
      contact: {
        title: string
        subtitle: string
      }
    }
  }
}

export function DynamicLandingPage() {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings/landing-page")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  // Always render the same structure on server and client initially
  if (!mounted) {
    return <DefaultLandingPage />
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (!settings) {
    // Fallback to default content
    return <DefaultLandingPage />
  }

  // Create CSS variables for theme colors
  const themeStyles = {
    "--primary-color": settings.landingPage.theme.primaryColor,
    "--secondary-color": settings.landingPage.theme.secondaryColor,
    "--accent-color": settings.landingPage.theme.accentColor,
    "--background-color": settings.landingPage.theme.backgroundColor,
    "--text-color": settings.landingPage.theme.textColor,
  } as React.CSSProperties

  // Sort sections by order
  const sections = Object.entries(settings.landingPage.layout)
    .filter(([_, config]) => config.visible)
    .sort(([_, a], [__, b]) => a.order - b.order)

  return (
    <div className="flex flex-col min-h-screen" style={themeStyles}>
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b bg-black text-white sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="/">
          <span 
            className="text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent"
            style={{ color: settings.landingPage.theme.accentColor }}
          >
            {settings.branding.websiteName}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-4 lg:gap-6">
          <Link className="text-sm font-medium hover:text-amber-400 transition-colors underline-offset-4" href="#about">
            About Trading
          </Link>
          <Link
            className="text-sm font-medium hover:text-amber-400 transition-colors underline-offset-4"
            href="#courses"
          >
            Courses
          </Link>
          <Link
            className="text-sm font-medium hover:text-amber-400 transition-colors underline-offset-4"
            href="#features"
          >
            Features
          </Link>
          <Link
            className="text-sm font-medium hover:text-amber-400 transition-colors underline-offset-4"
            href="/features-demo"
          >
            Demo
          </Link>
          <Link
            className="text-sm font-medium hover:text-amber-400 transition-colors underline-offset-4"
            href="#pricing"
          >
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:text-amber-400 transition-colors underline-offset-4" href="/login">
            Login
          </Link>
          <Link href="/signup">
            <Button 
              size="sm" 
              className="text-black"
              style={{ 
                backgroundColor: settings.landingPage.theme.accentColor,
                borderColor: settings.landingPage.theme.accentColor
              }}
            >
              Get Started
            </Button>
          </Link>
        </nav>

        {/* Mobile Navigation */}
        <MobileNav />
      </header>

      <main className="flex-1">
        {/* Environment Check (Development Only) */}
        <div className="container px-4 md:px-6 mx-auto pt-4">
          <EnvCheck />
        </div>

        {/* Render sections based on order and visibility */}
        {sections.map(([sectionName, config]) => {
          switch (sectionName) {
            case 'hero':
              return (
                <section key="hero" className="w-full py-8 md:py-16 lg:py-24 xl:py-32 bg-gradient-to-br from-green-50 to-blue-50">
                  <div className="container px-4 md:px-6 mx-auto">
                    <div className="flex flex-col items-center space-y-4 text-center">
                      <div className="space-y-2 max-w-4xl">
                        <h1 
                          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tighter leading-tight"
                          style={{ color: settings.landingPage.theme.primaryColor }}
                        >
                          {settings.landingPage.content.hero.title}
                        </h1>
                        <p 
                          className="mx-auto max-w-[700px] text-gray-500 text-base sm:text-lg md:text-xl px-4"
                          style={{ color: settings.landingPage.theme.textColor }}
                        >
                          {settings.landingPage.content.hero.subtitle}
                        </p>
                      </div>
                      <div className="flex flex-col gap-4 mt-8 w-full max-w-md sm:max-w-none sm:flex-col">
                        <Link href={settings.landingPage.content.hero.ctaLink} className="w-full sm:w-auto">
                          <Button 
                            size="lg" 
                            className="w-full sm:w-auto text-black"
                            style={{ 
                              backgroundColor: settings.landingPage.theme.accentColor,
                              borderColor: settings.landingPage.theme.accentColor
                            }}
                          >
                            {settings.landingPage.content.hero.ctaText}
                          </Button>
                        </Link>
                        <Link href="#about" className="w-full sm:w-auto">
                          <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent text-center">
                            Learn About Trading
                          </Button>
                        </Link>
                      </div>

                      {/* Trust Indicators */}
                      <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-8 mt-8 sm:mt-12 text-sm text-gray-600 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>500+ Active Traders</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Award className="h-4 w-4" />
                          <span>98% Success Rate</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Shield className="h-4 w-4" />
                          <span>5+ Years Experience</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )

            case 'about':
              return (
                <section key="about" id="about" className="w-full py-8 md:py-16 lg:py-24 bg-white">
                  <div className="container px-4 md:px-6 mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8 md:mb-12">
                      <h2 
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter"
                        style={{ color: settings.landingPage.theme.primaryColor }}
                      >
                        {settings.landingPage.content.about.title}
                      </h2>
                      <p 
                        className="max-w-[900px] text-gray-500 text-base sm:text-lg md:text-xl px-4"
                        style={{ color: settings.landingPage.theme.textColor }}
                      >
                        {settings.landingPage.content.about.subtitle}
                      </p>
                    </div>

                    <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8 md:mb-12">
                      <Card className="text-center">
                        <CardHeader className="pb-4">
                          <DollarSign className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 mx-auto" />
                          <CardTitle className="text-lg sm:text-xl">Financial Freedom</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 text-sm sm:text-base">
                            Trading offers unlimited earning potential. Many of our students generate consistent monthly income
                            that exceeds their traditional job salaries.
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="text-center">
                        <CardHeader className="pb-4">
                          <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto" />
                          <CardTitle className="text-lg sm:text-xl">Time Freedom</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 text-sm sm:text-base">
                            Markets are open 24/5, giving you the flexibility to trade around your schedule. Work from anywhere
                            with just a laptop and internet connection.
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="text-center md:col-span-2 lg:col-span-1">
                        <CardHeader className="pb-4">
                          <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600 mx-auto" />
                          <CardTitle className="text-lg sm:text-xl">Skill Development</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 text-sm sm:text-base">
                            Trading develops critical thinking, risk management, and analytical skills that are valuable in all
                            areas of life and business.
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Market Statistics */}
                    <div className="bg-gray-50 rounded-lg p-6 sm:p-8">
                      <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">Trading Market Facts</h3>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
                        <div>
                          <div className="text-2xl sm:text-3xl font-bold text-green-600">$7.5T</div>
                          <div className="text-xs sm:text-sm text-gray-600">Daily Forex Volume</div>
                        </div>
                        <div>
                          <div className="text-2xl sm:text-3xl font-bold text-blue-600">24/5</div>
                          <div className="text-xs sm:text-sm text-gray-600">Market Hours</div>
                        </div>
                        <div>
                          <div className="text-2xl sm:text-3xl font-bold text-purple-600">180+</div>
                          <div className="text-xs sm:text-sm text-gray-600">Currency Pairs</div>
                        </div>
                        <div>
                          <div className="text-2xl sm:text-3xl font-bold text-orange-600">$25B</div>
                          <div className="text-xs sm:text-sm text-gray-600">Average Daily Profit</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )

            case 'testimonials':
              return (
                <section key="testimonials" className="w-full py-8 md:py-16 lg:py-24 bg-gray-50">
                  <div className="container px-4 md:px-6 mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8 md:mb-12">
                      <h2 
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter"
                        style={{ color: settings.landingPage.theme.primaryColor }}
                      >
                        {settings.landingPage.content.testimonials.title}
                      </h2>
                      <p 
                        className="max-w-[900px] text-gray-500 text-base sm:text-lg md:text-xl px-4"
                        style={{ color: settings.landingPage.theme.textColor }}
                      >
                        {settings.landingPage.content.testimonials.subtitle}
                      </p>
                    </div>

                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      <Card>
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="font-bold text-green-600 text-sm sm:text-base">SM</span>
                            </div>
                            <div className="ml-3 sm:ml-4">
                              <h4 className="font-semibold text-sm sm:text-base">Sarah M.</h4>
                              <p className="text-xs sm:text-sm text-gray-600">Former Teacher</p>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-4 text-sm sm:text-base">
                            "I went from complete beginner to profitable trader in my first year. The strategies taught here
                            actually work!"
                          </p>
                          <div className="text-green-600 font-semibold text-sm sm:text-base">+9,900% Return</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="font-bold text-blue-600 text-sm sm:text-base">MJ</span>
                            </div>
                            <div className="ml-3 sm:ml-4">
                              <h4 className="font-semibold text-sm sm:text-base">Mike J.</h4>
                              <p className="text-xs sm:text-sm text-gray-600">Software Engineer</p>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-4 text-sm sm:text-base">
                            "Trading now generates significant monthly income. The community support is incredible."
                          </p>
                          <div className="text-green-600 font-semibold text-sm sm:text-base">Consistent Profits</div>
                        </CardContent>
                      </Card>

                      <Card className="md:col-span-2 lg:col-span-1">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="font-bold text-purple-600 text-sm sm:text-base">AL</span>
                            </div>
                            <div className="ml-3 sm:ml-4">
                              <h4 className="font-semibold text-sm sm:text-base">Alex L.</h4>
                              <p className="text-xs sm:text-sm text-gray-600">College Student</p>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-4 text-sm sm:text-base">
                            "Started as a college student with small capital. Now I'm financially independent at 22!"
                          </p>
                          <div className="text-green-600 font-semibold text-sm sm:text-base">Financial Independence</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </section>
              )

            case 'features':
              return (
                <section key="features" id="features" className="w-full py-8 md:py-16 lg:py-24">
                  <div className="container px-4 md:px-6 mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                      <div className="space-y-2">
                        <h2 
                          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter"
                          style={{ color: settings.landingPage.theme.primaryColor }}
                        >
                          {settings.landingPage.content.features.title}
                        </h2>
                        <p 
                          className="max-w-[900px] text-gray-500 text-base sm:text-lg md:text-xl px-4"
                          style={{ color: settings.landingPage.theme.textColor }}
                        >
                          {settings.landingPage.content.features.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="mx-auto grid max-w-5xl items-center gap-6 py-8 md:py-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      <Card>
                        <CardHeader className="pb-4">
                          <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
                          <CardTitle className="text-lg sm:text-xl">Proven Strategies</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-500 text-sm sm:text-base">
                            Learn battle-tested trading strategies used by professional traders. Our methods have generated
                            consistent profits for over 5 years across all market conditions.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-4">
                          <Users className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
                          <CardTitle className="text-lg sm:text-xl">Expert Community</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-500 text-sm sm:text-base">
                            Join our exclusive Discord community with 500+ active traders. Get real-time market alerts, trade
                            ideas, and support from experienced professionals 24/7.
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="md:col-span-2 lg:col-span-1">
                        <CardHeader className="pb-4">
                          <Target className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
                          <CardTitle className="text-lg sm:text-xl">Personalized Mentoring</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-500 text-sm sm:text-base">
                            Get one-on-one guidance from professional traders. Review your trades, refine your strategy, and
                            accelerate your learning with personalized feedback.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </section>
              )

            case 'pricing':
              return <DynamicPricing key="pricing" />

            case 'courses':
              return <DynamicCourses key="courses" />

            case 'contact':
              return (
                <section key="contact" className="w-full py-8 md:py-16 lg:py-24 bg-amber-500">
                  <div className="container px-4 md:px-6 mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                      <div className="space-y-2">
                        <h2 
                          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-white"
                          style={{ color: settings.landingPage.theme.accentColor }}
                        >
                          {settings.landingPage.content.contact.title}
                        </h2>
                        <p 
                          className="mx-auto max-w-[600px] text-amber-100 text-base sm:text-lg md:text-xl px-4"
                          style={{ color: settings.landingPage.theme.textColor }}
                        >
                          {settings.landingPage.content.contact.subtitle}
                        </p>
                      </div>
                      <div className="w-full max-w-md sm:max-w-none">
                        <Link href="/signup" className="w-full sm:w-auto block">
                          <Button 
                            size="lg" 
                            variant="secondary" 
                            className="w-full sm:w-auto"
                            style={{ 
                              backgroundColor: settings.landingPage.theme.accentColor,
                              borderColor: settings.landingPage.theme.accentColor,
                              color: '#000'
                            }}
                          >
                            Start Free Trial
                          </Button>
                        </Link>
                      </div>
                      <p className="text-amber-100 text-sm text-center px-4">
                        30-day money-back guarantee • No setup fees • Cancel anytime
                      </p>
                    </div>
                  </div>
                </section>
              )

            default:
              return null
          }
        })}
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-4 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 text-center sm:text-left">
          © 2024 {settings.branding.websiteName}. All rights reserved.
        </p>
        <nav className="flex gap-4 sm:gap-6 sm:ml-auto justify-center sm:justify-end">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy Policy
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Risk Disclosure
          </Link>
        </nav>
      </footer>
    </div>
  )
}

// Fallback component with default content
function DefaultLandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Trading Academy</h1>
          <p className="text-gray-600">Loading your personalized experience...</p>
        </div>
      </div>
    </div>
  )
}
