import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Award, TrendingUp } from "lucide-react"
import { TradingGraphics } from "./trading-graphics"

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
      hero: {
        title: string
        subtitle: string
        ctaText: string
        ctaLink: string
      }
    }
  }
}

export const EnhancedHero = ({ settings }: { settings: WebsiteSettings }) => {
  return (
    <div className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-amber-500/5 to-transparent"></div>
        </div>
      </div>
      
      {/* Trading Graphics */}
      <TradingGraphics />
      
      <div className="relative container px-4 md:px-6 mx-auto text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-gradient">
            {settings.content?.hero?.title || "Master the Art of Trading"}
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          {settings.content?.hero?.subtitle || "Learn from experts and build your trading skills with our comprehensive courses"}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href={settings.content?.hero?.ctaLink || "/signup"}>
            <Button 
              size="lg" 
              className="relative group px-8 py-4 text-lg font-semibold bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-full shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105 liquid-button"
            >
              <span className="relative z-10">{settings.content?.hero?.ctaText || "Get Started"}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
          </Link>
          
          <Link href="/features-demo">
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-sm bg-white/5"
            >
              Watch Demo
            </Button>
          </Link>
        </div>
        
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Users, value: "10K+", label: "Active Traders" },
            { icon: BookOpen, value: "50+", label: "Courses" },
            { icon: Award, value: "95%", label: "Success Rate" },
            { icon: TrendingUp, value: "$2M+", label: "Profits Generated" }
          ].map((stat, index) => (
            <div 
              key={index}
              className="group p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <stat.icon className="w-8 h-8 text-amber-400 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
