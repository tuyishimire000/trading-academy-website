"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MobileNav } from "@/components/mobile-nav"
import { DynamicPricing } from "@/components/home/dynamic-pricing"
import { DynamicCourses } from "@/components/home/dynamic-courses"
import { EnvCheck } from "@/components/env-check"
import { Users, BookOpen, Shield, Award, BarChart3, Target, Clock, DollarSign, TrendingUp, Zap, Globe, Rocket } from "lucide-react"
import { EnhancedHero } from "./enhanced-hero"
import { EnhancedFeatures } from "./enhanced-features"

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

  // Show loading state while fetching settings
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-900">
        <div className="flex items-center justify-center h-screen">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin animation-delay-500"></div>
          </div>
        </div>
      </div>
    )
  }

  // Provide default settings if none are loaded
  const currentSettings = settings || {
    branding: {
      websiteName: "Trading Academy",
      logo: "/logo.png",
      favicon: "/favicon.ico",
      tagline: "Master the Art of Trading"
    },
    landingPage: {
      theme: {
        primaryColor: "#3b82f6",
        secondaryColor: "#1e40af",
        accentColor: "#f59e0b",
        backgroundColor: "#ffffff",
        textColor: "#1f2937"
      },
      layout: {
        hero: { order: 1, visible: true },
        features: { order: 2, visible: true },
        testimonials: { order: 3, visible: true },
        pricing: { order: 4, visible: true },
        about: { order: 5, visible: true },
        contact: { order: 6, visible: true }
      },
      content: {
        hero: {
          title: "Master the Art of Trading",
          subtitle: "Learn from experts and build your trading skills with our comprehensive courses",
          ctaText: "Get Started",
          ctaLink: "/signup"
        },
        features: {
          title: "Why Choose Trading Academy",
          subtitle: "Everything you need to succeed in trading"
        },
        testimonials: {
          title: "What Our Students Say",
          subtitle: "Success stories from our community"
        },
        pricing: {
          title: "Choose Your Plan",
          subtitle: "Flexible pricing options for every trader"
        },
        about: {
          title: "About Trading Academy",
          subtitle: "Your journey to trading success starts here"
        },
        contact: {
          title: "Get in Touch",
          subtitle: "Have questions? We're here to help"
        }
      }
    }
  }

  if (!settings) {
    // Fallback to default content
    return <DefaultLandingPage />
  }

  // Create CSS variables for theme colors with safety checks
  const themeStyles = {
    "--primary-color": currentSettings.landingPage?.theme?.primaryColor || "#3b82f6",
    "--secondary-color": currentSettings.landingPage?.theme?.secondaryColor || "#1e40af",
    "--accent-color": currentSettings.landingPage?.theme?.accentColor || "#f59e0b",
    "--background-color": currentSettings.landingPage?.theme?.backgroundColor || "#ffffff",
    "--text-color": currentSettings.landingPage?.theme?.textColor || "#1f2937",
  } as React.CSSProperties

  // Sort sections by order with safety checks
  const sections = Object.entries(currentSettings.landingPage?.layout || {
    hero: { order: 1, visible: true },
    features: { order: 2, visible: true },
    testimonials: { order: 3, visible: true },
    pricing: { order: 4, visible: true },
    about: { order: 5, visible: true },
    contact: { order: 6, visible: true }
  })
    .filter(([_, config]) => config?.visible !== false)
    .sort(([_, a], [__, b]) => (a?.order || 0) - (b?.order || 0))

  return (
    <div className="flex flex-col min-h-screen bg-slate-900" style={themeStyles}>
      {/* Enhanced Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-md text-white sticky top-0 z-50">
        <Link className="flex items-center justify-center group" href="/">
          <span 
            className="text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent group-hover:from-amber-300 group-hover:to-orange-400 transition-all duration-300"
            style={{ color: currentSettings.landingPage?.theme?.accentColor || "#f59e0b" }}
          >
                         {currentSettings.branding?.websiteName || "Trading Academy"}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-4 lg:gap-6">
          {[
            { href: "#about", label: "About Trading" },
            { href: "#courses", label: "Courses" },
            { href: "#features", label: "Features" },
            { href: "/features-demo", label: "Demo" },
            { href: "#pricing", label: "Pricing" },
            { href: "/login", label: "Login" }
          ].map((link, index) => (
            <Link 
              key={index}
              className="text-sm font-medium hover:text-amber-400 transition-all duration-300 relative group"
              href={link.href}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}
          <Link href="/signup">
            <Button 
              size="sm" 
              className="relative group text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-amber-500/25"
              style={{ 
                backgroundColor: currentSettings.landingPage?.theme?.accentColor || "#f59e0b",
                borderColor: currentSettings.landingPage?.theme?.accentColor || "#f59e0b"
              }}
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
              return <EnhancedHero key="hero" settings={currentSettings} />
            case 'features':
              return <EnhancedFeatures key="features" settings={currentSettings} />
            case 'testimonials':
              return (
                <section key="testimonials" className="py-20 md:py-32 bg-gradient-to-b from-slate-800 to-slate-900">
                  <div className="container px-4 md:px-6 mx-auto">
                    <div className="text-center mb-16">
                      <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        {currentSettings.content?.testimonials?.title || "What Our Students Say"}
                      </h2>
                      <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        {currentSettings.content?.testimonials?.subtitle || "Success stories from our community"}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {[
                        {
                          name: "Sarah Johnson",
                          role: "Professional Trader",
                          content: "This platform transformed my trading career. The AI insights are incredibly accurate!",
                          rating: 5
                        },
                        {
                          name: "Michael Chen",
                          role: "Day Trader",
                          content: "The risk management tools saved me thousands. Highly recommended for serious traders.",
                          rating: 5
                        },
                        {
                          name: "Emma Rodriguez",
                          role: "Crypto Investor",
                          content: "Best trading academy I've found. The community and support are outstanding.",
                          rating: 5
                        }
                      ].map((testimonial, index) => (
                        <Card key={index} className="relative group bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/10 transition-all duration-500 hover:scale-105">
                          <CardContent className="p-6">
                            <div className="flex mb-4">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <span key={i} className="text-amber-400">★</span>
                              ))}
                            </div>
                            <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                            <div>
                              <div className="font-semibold text-white">{testimonial.name}</div>
                              <div className="text-sm text-gray-400">{testimonial.role}</div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </section>
              )
            case 'pricing':
              return (
                <section key="pricing" id="pricing" className="py-20 md:py-32 bg-gradient-to-b from-slate-900 to-slate-800">
                  <div className="container px-4 md:px-6 mx-auto">
                    <div className="text-center mb-16">
                      <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        {currentSettings.content?.pricing?.title || "Choose Your Plan"}
                      </h2>
                      <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        {currentSettings.content?.pricing?.subtitle || "Flexible pricing options for every trader"}
                      </p>
                    </div>
                    <DynamicPricing />
                  </div>
                </section>
              )
            case 'about':
              return (
                <section key="about" id="about" className="py-20 md:py-32 bg-gradient-to-b from-slate-800 to-slate-900">
                  <div className="container px-4 md:px-6 mx-auto">
                    <div className="text-center mb-16">
                      <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        {currentSettings.content?.about?.title || "About Trading Academy"}
                      </h2>
                      <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        {currentSettings.content?.about?.subtitle || "Your journey to trading success starts here"}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                      <div className="space-y-6">
                        <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20">
                          <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
                          <p className="text-gray-300 leading-relaxed">
                            To democratize trading education and provide cutting-edge tools that empower individuals to achieve financial freedom through intelligent trading strategies.
                          </p>
                        </div>
                        
                        <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20">
                          <h3 className="text-2xl font-bold text-white mb-4">Why Choose Us</h3>
                          <ul className="space-y-3 text-gray-300">
                            <li className="flex items-center">
                              <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                              AI-powered trading insights
                            </li>
                            <li className="flex items-center">
                              <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                              Comprehensive risk management
                            </li>
                            <li className="flex items-center">
                              <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                              Real-time market analysis
                            </li>
                            <li className="flex items-center">
                              <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                              Expert-led courses and mentorship
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <div className="w-full h-96 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-2xl border border-white/20 backdrop-blur-sm flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                              <TrendingUp className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Trading Excellence</h3>
                            <p className="text-gray-300">Join thousands of successful traders</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )
            case 'contact':
              return (
                <section key="contact" id="contact" className="py-20 md:py-32 bg-gradient-to-b from-slate-900 to-black">
                  <div className="container px-4 md:px-6 mx-auto">
                    <div className="text-center mb-16">
                      <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        {currentSettings.content?.contact?.title || "Get in Touch"}
                      </h2>
                      <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        {currentSettings.content?.contact?.subtitle || "Have questions? We're here to help"}
                      </p>
                    </div>
                    
                    <div className="max-w-2xl mx-auto">
                      <div className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-4">Get in Touch</h3>
                            <div className="space-y-4 text-gray-300">
                              <p>Ready to start your trading journey?</p>
                              <p>Our team is here to help you succeed.</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <Link href="/signup">
                              <Button className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-105">
                                Start Trading Now
                              </Button>
                            </Link>
                            <Link href="/login">
                              <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 font-semibold py-3 rounded-lg transition-all duration-300 bg-white/5">
                                Login to Dashboard
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )
            default:
              return null
          }
        })}
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-black/50 backdrop-blur-md border-t border-white/10">
        <div className="container px-4 md:px-6 mx-auto py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">{currentSettings.branding?.websiteName || "Trading Academy"}</h3>
              <p className="text-gray-400 text-sm">
                Empowering traders with cutting-edge technology and expert education.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#features" className="hover:text-amber-400 transition-colors">Features</Link></li>
                <li><Link href="#courses" className="hover:text-amber-400 transition-colors">Courses</Link></li>
                <li><Link href="#pricing" className="hover:text-amber-400 transition-colors">Pricing</Link></li>
                <li><Link href="/features-demo" className="hover:text-amber-400 transition-colors">Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/login" className="hover:text-amber-400 transition-colors">Login</Link></li>
                <li><Link href="/signup" className="hover:text-amber-400 transition-colors">Sign Up</Link></li>
                <li><Link href="#contact" className="hover:text-amber-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-amber-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-amber-400 transition-colors">Risk Disclosure</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 {currentSettings.branding?.websiteName || "Trading Academy"}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Default Landing Page Component (unchanged for fallback)
function DefaultLandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-md text-white sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="/">
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Trading Aura Trading Academy
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
              className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black"
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

        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Master the Art of Trading
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of successful traders using our AI-powered platform and expert-led courses
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-full"
                >
                  Start Trading Now
                </Button>
              </Link>
              <Link href="/features-demo">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-4 text-lg font-semibold border-2 border-white/30 text-white hover:bg-white/10 rounded-full bg-white/5"
                >
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-32 bg-gradient-to-b from-slate-900 to-slate-800">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Advanced Trading Features
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Everything you need to succeed in the markets
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <DynamicCourses />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-32 bg-gradient-to-b from-slate-800 to-slate-900">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Choose Your Plan
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Start with our free plan and upgrade as you grow
              </p>
            </div>
            <DynamicPricing />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-md border-t border-white/10">
        <div className="container px-4 md:px-6 mx-auto py-12">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Trading Aura Trading Academy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
