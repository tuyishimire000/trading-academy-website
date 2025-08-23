"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { usePlatformSocialLinks } from "@/lib/hooks/use-platform-social-links"
import { 
  Instagram, 
  Twitter, 
  Youtube, 
  ExternalLink,
  Loader2,
  Music,
  MessageCircle
} from "lucide-react"

const platformIcons = {
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  tiktok: Music, // Using Music icon for TikTok
  discord: MessageCircle
}

const platformColors = {
  instagram: "text-pink-600 hover:text-pink-700",
  twitter: "text-blue-500 hover:text-blue-600",
  youtube: "text-red-600 hover:text-red-700",
  tiktok: "text-black hover:text-gray-800",
  discord: "text-indigo-600 hover:text-indigo-700"
}

export function SocialMediaLinks() {
  const { data, loading, error } = usePlatformSocialLinks()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Follow Us</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading social links...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Follow Us</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              {error || "Unable to load social media links"}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get public social links and Discord link with required_plan = "free"
  const publicSocialLinks = data.links.filter(link => 
    (link.platform !== 'discord' && !link.required_plan) || 
    (link.platform === 'discord' && link.required_plan === 'free')
  )

  if (publicSocialLinks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Follow Us</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No social media links available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Follow Us</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center space-x-4 mb-4">
          {publicSocialLinks.map((link) => {
            const Icon = platformIcons[link.platform as keyof typeof platformIcons] || ExternalLink
            const colorClass = platformColors[link.platform as keyof typeof platformColors] || "text-gray-600 hover:text-gray-700"
            
            return (
              <button
                key={link.id}
                className={`p-3 rounded-full ${colorClass} hover:scale-110 transition-transform duration-200`}
                onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                title={link.name}
              >
                <Icon className="h-6 w-6" />
              </button>
            )
          })}
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Stay updated with our latest trading insights and educational content
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
