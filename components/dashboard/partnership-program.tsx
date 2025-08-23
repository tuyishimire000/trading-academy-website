"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Handshake,
  Share2,
  Users2,
  DollarSign,
  TrendingUp,
  Award,
  Copy,
  ExternalLink,
  CheckCircle,
  Star,
  Gift,
  Target,
  BarChart3,
  Calendar,
  MessageSquare,
  Video,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Linkedin,
  Globe,
  Clock
} from "lucide-react"

export function PartnershipProgram() {
  const [activeTab, setActiveTab] = useState('referral')
  const [copied, setCopied] = useState(false)

  const referralStats = {
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarnings: 240,
    pendingEarnings: 60,
    referralCode: "TRADER2024",
    referralLink: "https://tradingacademy.com/ref/TRADER2024"
  }

  const promotionStats = {
    totalContent: 5,
    totalViews: 15420,
    totalEarnings: 180,
    pendingEarnings: 45,
    engagementRate: 8.5
  }

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralStats.referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralStats.referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partnership Program</h1>
          <p className="text-gray-600">Earn money by referring friends and creating content</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <DollarSign className="h-4 w-4 mr-1" />
          Earn Money
        </Badge>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="referral" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Referral Program
          </TabsTrigger>
          <TabsTrigger value="promotion" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Content Creator Program
          </TabsTrigger>
        </TabsList>

        {/* Referral Program Tab */}
        <TabsContent value="referral" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                    <p className="text-2xl font-bold">{referralStats.totalReferrals}</p>
                  </div>
                  <Users2 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Referrals</p>
                    <p className="text-2xl font-bold">{referralStats.activeReferrals}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold">${referralStats.totalEarnings}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Earnings</p>
                    <p className="text-2xl font-bold">${referralStats.pendingEarnings}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

                     {/* Referral Code & Link Section */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Share2 className="h-5 w-5" />
                 Your Referral Tools
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
               {/* Referral Code */}
               <div>
                 <Label htmlFor="referralCode">Referral Code</Label>
                 <div className="flex items-center gap-2 mt-1">
                   <Input
                     id="referralCode"
                     value={referralStats.referralCode}
                     readOnly
                     className="font-mono text-lg"
                   />
                   <Button
                     onClick={copyReferralCode}
                     variant="outline"
                     size="sm"
                     className="flex items-center gap-2"
                   >
                     {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                     {copied ? 'Copied!' : 'Copy'}
                   </Button>
                 </div>
               </div>

               {/* Referral Link */}
               <div>
                 <Label htmlFor="referralLink">Trackable Referral Link</Label>
                 <div className="flex items-center gap-2 mt-1">
                   <Input
                     id="referralLink"
                     value={referralStats.referralLink}
                     readOnly
                     className="font-mono text-sm"
                   />
                   <Button
                     onClick={copyReferralLink}
                     variant="outline"
                     size="sm"
                     className="flex items-center gap-2"
                   >
                     {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                     {copied ? 'Copied!' : 'Copy'}
                   </Button>
                 </div>
                 <p className="text-xs text-gray-500 mt-1">
                   Share this link to track your referrals automatically
                 </p>
               </div>
               
               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                 <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
                 <ul className="text-sm text-blue-700 space-y-1">
                   <li>• Share your referral link or code with friends</li>
                   <li>• Earn 10% commission on each subscription your referrals make</li>
                   <li>• Track all your referrals automatically through your link</li>
                   <li>• No limit on referrals - earn unlimited!</li>
                 </ul>
               </div>
             </CardContent>
           </Card>
        </TabsContent>

        {/* Content Creator Program Tab */}
        <TabsContent value="promotion" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Content</p>
                    <p className="text-2xl font-bold">{promotionStats.totalContent}</p>
                  </div>
                  <Video className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold">{promotionStats.totalViews.toLocaleString()}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold">${promotionStats.totalEarnings}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                    <p className="text-2xl font-bold">{promotionStats.engagementRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Creator Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  How to Earn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Create Quality Content</p>
                      <p className="text-sm text-gray-600">Share your trading journey, tips, or reviews about Trading Academy</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Include Your Link</p>
                      <p className="text-sm text-gray-600">Add your unique affiliate link in your content</p>
                    </div>
                  </div>
                  
                                     <div className="flex items-start gap-3">
                     <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                       <span className="text-blue-600 text-sm font-bold">3</span>
                     </div>
                     <div>
                       <p className="font-medium">Earn Commissions</p>
                       <p className="text-sm text-gray-600">Earn based on platform performance + 10% commission on referrals</p>
                     </div>
                   </div>
                </div>
              </CardContent>
            </Card>

                         <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Target className="h-5 w-5" />
                   Supported Platforms & Rates
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-3">
                   <div className="p-3 rounded-lg border bg-red-50">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <Youtube className="h-5 w-5 text-red-600" />
                         <span className="text-sm font-medium">YouTube</span>
                       </div>
                       <span className="text-xs text-gray-600">$1 per 1K views</span>
                     </div>
                   </div>
                   <div className="p-3 rounded-lg border bg-pink-50">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <Instagram className="h-5 w-5 text-pink-600" />
                         <span className="text-sm font-medium">Instagram</span>
                       </div>
                       <span className="text-xs text-gray-600">$2 per 1K likes</span>
                     </div>
                   </div>
                   <div className="p-3 rounded-lg border bg-blue-50">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <Twitter className="h-5 w-5 text-blue-600" />
                         <span className="text-sm font-medium">X (Twitter)</span>
                       </div>
                       <span className="text-xs text-gray-600">$1 per 10K impressions</span>
                     </div>
                   </div>
                   <div className="p-3 rounded-lg border bg-black-50">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <span className="text-lg">🎵</span>
                         <span className="text-sm font-medium">TikTok</span>
                       </div>
                       <span className="text-xs text-gray-600">$1 per 10K views</span>
                     </div>
                   </div>
                 </div>
                 <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                   <p className="text-sm text-green-800">
                     <strong>Referral Commission:</strong> Content creators earn the same 10% commission on referrals as regular users.
                   </p>
                 </div>
               </CardContent>
             </Card>
          </div>

          {/* Apply for Content Creator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="h-5 w-5" />
                Apply for Content Creator Program
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                             <p className="text-gray-600">
                 Ready to start earning as a content creator? Apply now to get your unique affiliate link and start creating content about Trading Academy on supported platforms.
               </p>
              <div className="flex gap-3">
                <Button className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Apply Now
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
