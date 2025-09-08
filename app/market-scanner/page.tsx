'use client'
export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Search } from 'lucide-react'

export default function MarketScannerPage() {
  const router = useRouter()
  const [colorTheme, setColorTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Sync color theme with current document theme on client
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    setColorTheme(isDark ? 'dark' : 'light')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.push('/dashboard?section=trading-tools')} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Trading Tools</span>
          </Button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <Search className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Market Scanner</h1>
            <p className="text-gray-600 dark:text-gray-400">Scan Forex, Crypto, and Stocks using TradingView screener</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Screeners</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="forex" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="forex">Forex</TabsTrigger>
                <TabsTrigger value="crypto">Crypto</TabsTrigger>
                <TabsTrigger value="stocks">Stocks</TabsTrigger>
              </TabsList>

              <TabsContent value="forex" className="pt-4">
                <div className="w-full">
                  <iframe
                    title="Forex Screener"
                    src={`https://s.tradingview.com/embed-widget/screener/?locale=en#%7B%22defaultColumn%22%3A%22overview%22%2C%22defaultScreen%22%3A%22top_gainers%22%2C%22showToolbar%22%3Atrue%2C%22market%22%3A%22forex%22%2C%22isTransparent%22%3Atrue%2C%22colorTheme%22%3A%22${colorTheme}%22%7D`}
                    style={{ width: '100%', height: 620, border: 0 }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="crypto" className="pt-4">
                <div className="w-full">
                  <iframe
                    title="Crypto Screener"
                    src={`https://s.tradingview.com/embed-widget/screener/?locale=en#%7B%22defaultColumn%22%3A%22overview%22%2C%22defaultScreen%22%3A%22top_gainers%22%2C%22showToolbar%22%3Atrue%2C%22market%22%3A%22crypto%22%2C%22isTransparent%22%3Atrue%2C%22colorTheme%22%3A%22${colorTheme}%22%7D`}
                    style={{ width: '100%', height: 620, border: 0 }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="stocks" className="pt-4">
                <div className="w-full">
                  <iframe
                    title="Stock Screener"
                    src={`https://s.tradingview.com/embed-widget/screener/?locale=en#%7B%22defaultColumn%22%3A%22overview%22%2C%22defaultScreen%22%3A%22top_gainers%22%2C%22showToolbar%22%3Atrue%2C%22market%22%3A%22america%22%2C%22isTransparent%22%3Atrue%2C%22colorTheme%22%3A%22${colorTheme}%22%7D`}
                    style={{ width: '100%', height: 620, border: 0 }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


