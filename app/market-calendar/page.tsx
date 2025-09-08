'use client'
export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react'

export default function MarketCalendarPage() {
  const router = useRouter()
  const [colorTheme, setColorTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
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
          <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
            <CalendarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Market Calendar</h1>
            <p className="text-gray-600 dark:text-gray-400">Real-time economic events powered by TradingView</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Economic Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full" style={{ height: 650 }}>
              <iframe
                title="TradingView Economic Calendar"
                src={`https://s.tradingview.com/embed-widget/events/?locale=en#%7B%22colorTheme%22%3A%22${colorTheme}%22%2C%22isTransparent%22%3Atrue%2C%22importanceFilter%22%3A%222%22%2C%22defaultCountry%22%3A%22US%2CEU%2CGB%2CCN%2CJP%2CCA%2CAU%22%7D`}
                style={{ width: '100%', height: '100%', border: 0 }}
                loading="lazy"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


