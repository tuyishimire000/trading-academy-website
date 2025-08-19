"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, ExternalLink, RefreshCw } from "lucide-react"
import { useState } from "react"

interface TradingViewChartProps {
  symbol?: string
  interval?: string
}

export function TradingViewChart({ symbol = "EURUSD", interval = "1D" }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [currentSymbol, setCurrentSymbol] = useState(symbol)
  const [currentInterval, setCurrentInterval] = useState(interval)
  const [isLoading, setIsLoading] = useState(false)

  const symbols = [
    { value: "EURUSD", label: "EUR/USD" },
    { value: "GBPUSD", label: "GBP/USD" },
    { value: "USDJPY", label: "USD/JPY" },
    { value: "AUDUSD", label: "AUD/USD" },
    { value: "USDCAD", label: "USD/CAD" },
    { value: "NZDUSD", label: "NZD/USD" },
    { value: "USDCHF", label: "USD/CHF" },
    { value: "EURGBP", label: "EUR/GBP" },
    { value: "EURJPY", label: "EUR/JPY" },
    { value: "GBPJPY", label: "GBP/JPY" }
  ]

  const intervals = [
    { value: "1", label: "1 minute" },
    { value: "5", label: "5 minutes" },
    { value: "15", label: "15 minutes" },
    { value: "30", label: "30 minutes" },
    { value: "60", label: "1 hour" },
    { value: "240", label: "4 hours" },
    { value: "1D", label: "1 day" },
    { value: "1W", label: "1 week" },
    { value: "1M", label: "1 month" }
  ]

  useEffect(() => {
    let script: HTMLScriptElement | null = null

    if (typeof window !== 'undefined' && window.TradingView) {
      loadTradingViewWidget()
    } else {
      // Load TradingView widget script
      script = document.createElement('script')
      script.src = 'https://s3.tradingview.com/tv.js'
      script.async = true
      script.onload = () => {
        if (window.TradingView) {
          loadTradingViewWidget()
        }
      }
      script.onerror = () => {
        console.error('Failed to load TradingView widget')
        setIsLoading(false)
      }
      document.head.appendChild(script)
    }

    // Cleanup function
    return () => {
      if (script && document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [currentSymbol, currentInterval])

  const loadTradingViewWidget = () => {
    if (!chartContainerRef.current || !window.TradingView) {
      console.error('TradingView widget or container not available')
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      // Clear previous chart
      chartContainerRef.current.innerHTML = ''

      const widget = new window.TradingView.widget({
      autosize: true,
      symbol: `FX:${currentSymbol}`,
      interval: currentInterval,
      timezone: 'Etc/UTC',
      theme: 'light',
      style: '1',
      locale: 'en',
      toolbar_bg: '#f1f3f6',
      enable_publishing: false,
      allow_symbol_change: false,
      container_id: chartContainerRef.current.id,
      studies: [
        'RSI@tv-basicstudies',
        'MACD@tv-basicstudies'
      ],
      disabled_features: [
        'use_localstorage_for_settings',
        'volume_force_overlay'
      ],
      enabled_features: [
        'study_templates'
      ],
      overrides: {
        'mainSeriesProperties.candleStyle.upColor': '#26a69a',
        'mainSeriesProperties.candleStyle.downColor': '#ef5350',
        'mainSeriesProperties.candleStyle.wickUpColor': '#26a69a',
        'mainSeriesProperties.candleStyle.wickDownColor': '#ef5350'
      }
    })

    // Set loading to false after a short delay to allow the widget to render
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    } catch (error) {
      console.error('Error creating TradingView widget:', error)
      setIsLoading(false)
    }
  }

  const handleSymbolChange = (value: string) => {
    setCurrentSymbol(value)
  }

  const handleIntervalChange = (value: string) => {
    setCurrentInterval(value)
  }

  const openTradingView = () => {
    window.open(`https://www.tradingview.com/chart/?symbol=FX:${currentSymbol}`, '_blank')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Live Market Chart
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={currentSymbol} onValueChange={handleSymbolChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {symbols.map((symbol) => (
                  <SelectItem key={symbol.value} value={symbol.value}>
                    {symbol.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={currentInterval} onValueChange={handleIntervalChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {intervals.map((interval) => (
                  <SelectItem key={interval.value} value={interval.value}>
                    {interval.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={loadTradingViewWidget}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={openTradingView}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading chart...</p>
              </div>
            </div>
          )}
          <div 
            id="tradingview-chart"
            ref={chartContainerRef}
            className="h-96 w-full"
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Add TradingView types to window object
declare global {
  interface Window {
    TradingView: any
  }
}
