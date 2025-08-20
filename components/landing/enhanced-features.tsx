import { BarChart3, Shield, Zap, Globe, Rocket, Target } from "lucide-react"
import { EnhancedFeatureCard } from "./enhanced-feature-card"

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
    content: {
      features: {
        title: string
        subtitle: string
      }
    }
  }
}

export const EnhancedFeatures = ({ settings }: { settings: WebsiteSettings }) => {
  return (
    <div id="features" className="relative py-20 md:py-32 bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {settings.content?.features?.title || "Why Choose Trading Academy"}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {settings.content?.features?.subtitle || "Everything you need to succeed in trading"}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: BarChart3,
              title: "Advanced Analytics",
              description: "Real-time market analysis with AI-powered insights and predictive modeling."
            },
            {
              icon: Shield,
              title: "Risk Management",
              description: "Comprehensive risk assessment tools and automated stop-loss systems."
            },
            {
              icon: Zap,
              title: "Live Trading",
              description: "Execute trades with lightning-fast execution and real-time market data."
            },
            {
              icon: Globe,
              title: "Global Markets",
              description: "Access to forex, stocks, crypto, and commodities from a single platform."
            },
            {
              icon: Rocket,
              title: "AI Trading Bots",
              description: "Automated trading strategies powered by machine learning algorithms."
            },
            {
              icon: Target,
              title: "Portfolio Tracking",
              description: "Monitor your investments with detailed performance analytics and reporting."
            }
          ].map((feature, index) => (
            <EnhancedFeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
