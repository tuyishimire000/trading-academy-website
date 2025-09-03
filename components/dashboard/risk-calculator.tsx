'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calculator, TrendingUp, DollarSign, AlertTriangle, ArrowLeft } from 'lucide-react'

interface CurrencyPair {
  symbol: string
  name: string
  baseCurrency: string
  quoteCurrency: string
  pipValue: number
  minLot: number
  maxLot: number
}

interface CalculationResult {
  pipValue: number
  pipValueUSD: number
  pipValueEUR: number
  pipValueGBP: number
  marginRequired: number
  riskAmount: number
  profitTarget: number
  stopLoss: number
}

const CURRENCY_PAIRS: CurrencyPair[] = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', baseCurrency: 'EUR', quoteCurrency: 'USD', pipValue: 0.0001, minLot: 0.01, maxLot: 100 },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', baseCurrency: 'GBP', quoteCurrency: 'USD', pipValue: 0.0001, minLot: 0.01, maxLot: 100 },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', baseCurrency: 'USD', quoteCurrency: 'JPY', pipValue: 0.01, minLot: 0.01, maxLot: 100 },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', baseCurrency: 'USD', quoteCurrency: 'CHF', pipValue: 0.0001, minLot: 0.01, maxLot: 100 },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', baseCurrency: 'AUD', quoteCurrency: 'USD', pipValue: 0.0001, minLot: 0.01, maxLot: 100 },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', baseCurrency: 'USD', quoteCurrency: 'CAD', pipValue: 0.0001, minLot: 0.01, maxLot: 100 },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', baseCurrency: 'NZD', quoteCurrency: 'USD', pipValue: 0.0001, minLot: 0.01, maxLot: 100 },
  { symbol: 'EUR/GBP', name: 'Euro / British Pound', baseCurrency: 'EUR', quoteCurrency: 'GBP', pipValue: 0.0001, minLot: 0.01, maxLot: 100 },
  { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen', baseCurrency: 'EUR', quoteCurrency: 'JPY', pipValue: 0.01, minLot: 0.01, maxLot: 100 },
  { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', baseCurrency: 'GBP', quoteCurrency: 'JPY', pipValue: 0.01, minLot: 0.01, maxLot: 100 },
  { symbol: 'XAU/USD', name: 'Gold / US Dollar', baseCurrency: 'XAU', quoteCurrency: 'USD', pipValue: 0.01, minLot: 0.01, maxLot: 100 },
  { symbol: 'XAG/USD', name: 'Silver / US Dollar', baseCurrency: 'XAG', quoteCurrency: 'USD', pipValue: 0.001, minLot: 0.01, maxLot: 100 },
]

const DEPOSIT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
]

export function RiskCalculator() {
  const router = useRouter()
  const [selectedPair, setSelectedPair] = useState<CurrencyPair>(CURRENCY_PAIRS[0])
  const [depositCurrency, setDepositCurrency] = useState('USD')
  const [tradeSize, setTradeSize] = useState('1.00')
  const [pipAmount, setPipAmount] = useState('10')
  const [leverage, setLeverage] = useState('100')
  const [accountBalance, setAccountBalance] = useState('10000')
  const [riskPercentage, setRiskPercentage] = useState('2')
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null)

  const handleBackToCalculator = () => {
    router.push('/dashboard?section=trading-tools')
  }

  // Mock exchange rates (in real app, these would come from API)
  const exchangeRates = {
    'EUR/USD': 1.0850,
    'GBP/USD': 1.2650,
    'USD/JPY': 148.50,
    'USD/CHF': 0.8750,
    'AUD/USD': 0.6550,
    'USD/CAD': 1.3550,
    'NZD/USD': 0.6050,
    'EUR/GBP': 0.8575,
    'EUR/JPY': 161.12,
    'GBP/JPY': 187.85,
    'XAU/USD': 2030.50,
    'XAG/USD': 23.45,
  }

  const calculatePipValue = () => {
    if (!selectedPair || !tradeSize || !pipAmount) return

    const lotSize = parseFloat(tradeSize)
    const pips = parseFloat(pipAmount)
    const currentRate = exchangeRates[selectedPair.symbol as keyof typeof exchangeRates] || 1

    // Calculate pip value based on currency pair
    let pipValue: number
    if (selectedPair.quoteCurrency === 'JPY' || selectedPair.baseCurrency === 'JPY') {
      // For JPY pairs, pip value is different
      pipValue = (0.01 / currentRate) * lotSize * 100000
    } else {
      // For other pairs
      pipValue = (0.0001 / currentRate) * lotSize * 100000
    }

    // Calculate pip value in USD (base calculation)
    let pipValueUSD: number
    if (selectedPair.quoteCurrency === 'USD') {
      // If quote currency is USD, pip value is already in USD
      pipValueUSD = pipValue
    } else if (selectedPair.baseCurrency === 'USD') {
      // If base currency is USD, convert using exchange rate
      pipValueUSD = pipValue * currentRate
    } else {
      // For cross pairs, convert to USD using appropriate rate
      pipValueUSD = pipValue * currentRate
    }

    // Calculate pip value in different currencies
    const pipValueEUR = pipValueUSD / (exchangeRates['EUR/USD'] || 1)
    const pipValueGBP = pipValueUSD / (exchangeRates['GBP/USD'] || 1)

    // Calculate margin required
    const marginRequired = (lotSize * 100000 * currentRate) / parseFloat(leverage)

    // Calculate risk amount based on account balance and risk percentage
    const riskAmount = (parseFloat(accountBalance) * parseFloat(riskPercentage)) / 100

    // Calculate profit target and stop loss based on risk
    const profitTarget = riskAmount / pipValueUSD * pips
    const stopLoss = riskAmount / pipValueUSD * pips

    setCalculationResult({
      pipValue,
      pipValueUSD,
      pipValueEUR,
      pipValueGBP,
      marginRequired,
      riskAmount,
      profitTarget,
      stopLoss,
    })
  }

  useEffect(() => {
    calculatePipValue()
  }, [selectedPair, depositCurrency, tradeSize, pipAmount, leverage, accountBalance, riskPercentage])

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CHF: 'CHF ',
      CAD: 'C$',
      AUD: 'A$',
      NZD: 'NZ$',
    }
    
    if (currency === 'JPY') {
      return `${symbols[currency] || ''}${amount.toFixed(0)}`
    }
    return `${symbols[currency] || ''}${amount.toFixed(2)}`
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={handleBackToCalculator}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Trading Tools</span>
        </Button>
      </div>

      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
          <Calculator className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Risk Calculator</h1>
          <p className="text-gray-600 dark:text-gray-400">Calculate pip values, margins, and risk management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Calculator Inputs</span>
            </CardTitle>
            <CardDescription>Enter your trade parameters to calculate risk metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Currency Pair Selection */}
            <div className="space-y-2">
              <Label htmlFor="currency-pair">Currency Pair</Label>
              <Select value={selectedPair.symbol} onValueChange={(value) => {
                const pair = CURRENCY_PAIRS.find(p => p.symbol === value)
                if (pair) setSelectedPair(pair)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency pair" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_PAIRS.map((pair) => (
                    <SelectItem key={pair.symbol} value={pair.symbol}>
                      <div className="flex items-center justify-between w-full">
                        <span>{pair.symbol}</span>
                        <span className="text-sm text-gray-500">{pair.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deposit Currency */}
            <div className="space-y-2">
              <Label htmlFor="deposit-currency">Deposit Currency</Label>
              <Select value={depositCurrency} onValueChange={setDepositCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select deposit currency" />
                </SelectTrigger>
                <SelectContent>
                  {DEPOSIT_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Trade Size */}
            <div className="space-y-2">
              <Label htmlFor="trade-size">Trade Size (Lots)</Label>
              <Input
                id="trade-size"
                type="number"
                step="0.01"
                min={selectedPair.minLot}
                max={selectedPair.maxLot}
                value={tradeSize}
                onChange={(e) => setTradeSize(e.target.value)}
                placeholder="1.00"
              />
              <p className="text-xs text-gray-500">
                Min: {selectedPair.minLot} | Max: {selectedPair.maxLot}
              </p>
            </div>

            {/* Pip Amount */}
            <div className="space-y-2">
              <Label htmlFor="pip-amount">Number of Pips</Label>
              <Input
                id="pip-amount"
                type="number"
                value={pipAmount}
                onChange={(e) => setPipAmount(e.target.value)}
                placeholder="10"
              />
            </div>

            {/* Leverage */}
            <div className="space-y-2">
              <Label htmlFor="leverage">Leverage</Label>
              <Input
                id="leverage"
                type="number"
                value={leverage}
                onChange={(e) => setLeverage(e.target.value)}
                placeholder="100"
              />
            </div>

            {/* Account Balance */}
            <div className="space-y-2">
              <Label htmlFor="account-balance">Account Balance ({depositCurrency})</Label>
              <Input
                id="account-balance"
                type="number"
                value={accountBalance}
                onChange={(e) => setAccountBalance(e.target.value)}
                placeholder="10000"
              />
            </div>

            {/* Risk Percentage */}
            <div className="space-y-2">
              <Label htmlFor="risk-percentage">Risk Percentage (%)</Label>
              <Input
                id="risk-percentage"
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                value={riskPercentage}
                onChange={(e) => setRiskPercentage(e.target.value)}
                placeholder="2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Calculation Results</span>
            </CardTitle>
            <CardDescription>Your calculated risk metrics and pip values</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {calculationResult ? (
              <>
                {/* Pip Values */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Pip Values</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <div className="text-sm text-blue-600 dark:text-blue-400">Pip Value (USD)</div>
                      <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                        ${calculationResult.pipValueUSD.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <div className="text-sm text-green-600 dark:text-green-400">Pip Value (EUR)</div>
                      <div className="text-xl font-bold text-green-900 dark:text-green-100">
                        €{calculationResult.pipValueEUR.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                      <div className="text-sm text-purple-600 dark:text-purple-400">Pip Value (GBP)</div>
                      <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
                        £{calculationResult.pipValueGBP.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                      <div className="text-sm text-orange-600 dark:text-orange-400">Total Pip Value</div>
                      <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                        ${(calculationResult.pipValue * parseFloat(pipAmount)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Management */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Risk Management</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <div className="text-sm text-red-600 dark:text-red-400">Risk Amount</div>
                      <div className="text-xl font-bold text-red-900 dark:text-red-100">
                        {formatCurrency(calculationResult.riskAmount, depositCurrency)}
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                      <div className="text-sm text-yellow-600 dark:text-yellow-400">Margin Required</div>
                      <div className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
                        {formatCurrency(calculationResult.marginRequired, depositCurrency)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profit/Loss Scenarios */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Profit/Loss Scenarios</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <div className="text-sm text-green-600 dark:text-green-400">Profit Target ({pipAmount} pips)</div>
                      <div className="text-xl font-bold text-green-900 dark:text-green-100">
                        {formatCurrency(calculationResult.profitTarget, depositCurrency)}
                      </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <div className="text-sm text-red-600 dark:text-red-400">Stop Loss ({pipAmount} pips)</div>
                      <div className="text-xl font-bold text-red-900 dark:text-red-100">
                        {formatCurrency(calculationResult.stopLoss, depositCurrency)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Rate Display */}
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current {selectedPair.symbol} Rate</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {exchangeRates[selectedPair.symbol as keyof typeof exchangeRates]?.toFixed(5) || 'N/A'}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Enter your trade parameters to see calculations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Information Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span>How to Use</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Understanding Pip Values</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• A pip is the smallest price move in forex trading</li>
                <li>• For most pairs: 1 pip = 0.0001</li>
                <li>• For JPY pairs: 1 pip = 0.01</li>
                <li>• Standard lot = 100,000 units</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Risk Management Tips</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Never risk more than 1-2% of your account</li>
                <li>• Use stop losses to limit potential losses</li>
                <li>• Calculate position size based on risk</li>
                <li>• Consider leverage impact on margin</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
