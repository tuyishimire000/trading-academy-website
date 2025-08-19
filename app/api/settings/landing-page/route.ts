import { NextRequest, NextResponse } from "next/server"

// Default website settings
const defaultSettings = {
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

export async function GET(request: NextRequest) {
  try {
    // Use global settings if available, otherwise use defaults
    const settings = (global as any).landingPageSettings || defaultSettings
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Landing page settings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch landing page settings' },
      { status: 500 }
    )
  }
}
