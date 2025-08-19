import { NextRequest, NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth/admin"

// Mock website settings - in production, this would be stored in database
let websiteSettings = {
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

// Function to update both admin and public settings
function updateWebsiteSettings(newSettings: any) {
  websiteSettings = newSettings
  
  // Also update the public landing page settings
  const publicSettings = {
    branding: newSettings.branding,
    landingPage: newSettings.landingPage
  }
  
  // In a real application, you would save this to a database
  // For now, we'll use a global variable that both APIs can access
  global.landingPageSettings = publicSettings
}

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, error } = await checkAdminAccess(request)
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 })
    }

    return NextResponse.json(websiteSettings)
  } catch (error) {
    console.error('Website settings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch website settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { isAdmin, error } = await checkAdminAccess(request)
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const body = await request.json()
    const { branding, landingPage } = body

    // Update branding settings
    if (branding) {
      websiteSettings.branding = {
        ...websiteSettings.branding,
        ...branding
      }
    }

    // Update landing page settings
    if (landingPage) {
      if (landingPage.theme) {
        websiteSettings.landingPage.theme = {
          ...websiteSettings.landingPage.theme,
          ...landingPage.theme
        }
      }
      
      if (landingPage.layout) {
        websiteSettings.landingPage.layout = {
          ...websiteSettings.landingPage.layout,
          ...landingPage.layout
        }
      }
      
      if (landingPage.content) {
        websiteSettings.landingPage.content = {
          ...websiteSettings.landingPage.content,
          ...landingPage.content
        }
      }
    }

    // Update both admin and public settings
    updateWebsiteSettings(websiteSettings)

    return NextResponse.json({
      message: 'Website settings updated successfully',
      settings: websiteSettings
    })
  } catch (error) {
    console.error('Website settings update error:', error)
    return NextResponse.json(
      { error: 'Failed to update website settings' },
      { status: 500 }
    )
  }
}
