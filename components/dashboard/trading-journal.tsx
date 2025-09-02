'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  BarChart3, 
  FileText, 
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  Eye,
  X
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'

interface Trade {
  id: number
  trade_id: string
  symbol: string
  instrument_type: string
  direction: 'long' | 'short'
  entry_price: number
  entry_time: string
  entry_reason: string
  entry_confidence: 'low' | 'medium' | 'high'
  exit_price?: number
  exit_time?: string
  exit_reason?: string
  exit_confidence?: 'low' | 'medium' | 'high'
  position_size: number
  position_size_currency: string
  leverage: number
  stop_loss?: number
  take_profit?: number
  risk_amount?: number
  risk_percentage?: number
  pnl_amount?: number
  pnl_percentage?: number
  max_profit?: number
  max_loss?: number
  strategy_id?: number
  category_id?: number
  market_condition: string
  trade_setup_quality: string
  execution_quality: string
  status: 'open' | 'closed' | 'cancelled'
  is_winning?: boolean
  notes?: string
  lessons_learned?: string
  next_time_actions?: string
  strategy?: { name: string }
  category?: { name: string; color: string }
}

interface PerformanceMetrics {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalPnl: number
  averagePnl: number
}

export function TradingJournal() {
  const { user } = useAuth()
  const [trades, setTrades] = useState<Trade[]>([])
  const [performance, setPerformance] = useState<PerformanceMetrics>({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    totalPnl: 0,
    averagePnl: 0
  })
  const [loading, setLoading] = useState(true)
  const [showTradeForm, setShowTradeForm] = useState(false)
  const [showCloseTradeForm, setShowCloseTradeForm] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    symbol: '',
    instrument_type: '',
    direction: '',
    entry_price: '',
    entry_time: '',
    entry_reason: '',
    position_size: '',
    position_size_currency: 'USD',
    leverage: '1.00',
    screenshots: []
  })
  const [submitting, setSubmitting] = useState(false)
  const [closeFormData, setCloseFormData] = useState({
    exit_price: '',
    exit_time: '',
    exit_reason: '',
    exit_confidence: 'medium',
    pnl_amount: '',
    pnl_percentage: '',
    lessons_learned: '',
    next_time_actions: '',
    screenshots: []
  })
  
  const [selectedTradeForView, setSelectedTradeForView] = useState<Trade | null>(null)
  const [showTradeViewModal, setShowTradeViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({})
         
         useEffect(() => {
    if (user) {
      fetchTrades()
      fetchPerformance()
    }
  }, [user])

  const fetchTrades = async () => {
    try {
      console.log('Fetching trades...')
      const response = await fetch('/api/trading-journal/trades')
      console.log('Trades response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Trades data:', data)
        setTrades(data.trades || [])
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
      }
    } catch (error) {
      console.error('Error fetching trades:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPerformance = async () => {
    try {
      console.log('Fetching performance...')
      const response = await fetch('/api/trading-journal/performance')
      console.log('Performance response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Performance data:', data)
        setPerformance(data.overallStats || {
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          winRate: 0,
          totalPnl: 0,
          averagePnl: 0
        })
      } else {
        const errorData = await response.json()
        console.error('Performance error response:', errorData)
      }
    } catch (error) {
      console.error('Error fetching performance:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const response = await fetch('/api/trading-journal/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          entry_price: parseFloat(formData.entry_price),
          position_size: parseFloat(formData.position_size),
          leverage: parseFloat(formData.leverage),
          entry_time: formData.entry_time || new Date().toISOString().slice(0, 16)
        })
      })

      if (response.ok) {
        const newTrade = await response.json()
        setTrades(prev => [newTrade, ...prev])
        setShowTradeForm(false)
        setFormData({
          trade_id: '',
          symbol: '',
          instrument_type: '',
          direction: '',
          entry_price: '',
          entry_time: '',
          entry_reason: '',
          position_size: '',
          position_size_currency: 'USD',
          leverage: '1.00'
        })
        // Refresh performance data
        fetchPerformance()
      } else {
        const error = await response.json()
        alert(`Error creating trade: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating trade:', error)
      alert('Error creating trade. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      symbol: '',
      instrument_type: '',
      direction: '',
      entry_reason: '',
      entry_price: '',
      entry_time: '',
      position_size: '',
      position_size_currency: 'USD',
      leverage: '1.00',
      screenshots: []
    })
  }
  
  const resetCloseForm = () => {
    setCloseFormData({
      exit_price: '',
      exit_time: '',
      exit_reason: '',
      exit_confidence: 'medium',
      pnl_amount: '',
      pnl_percentage: '',
      lessons_learned: '',
      next_time_actions: '',
      screenshots: []
    })
  }
  
  const handleCloseTrade = (trade: Trade) => {
    setSelectedTrade(trade)
    setCloseFormData({
      exit_price: '',
      exit_time: new Date().toISOString().slice(0, 16),
      exit_reason: '',
      exit_confidence: 'medium',
      pnl_amount: '',
      pnl_percentage: '',
      lessons_learned: '',
      next_time_actions: '',
      screenshots: []
    })
    setShowCloseTradeForm(true)
  }
  
  const handleCloseTradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTrade) return
    
    setSubmitting(true)
    try {
      const response = await fetch(`/api/trading-journal/trades/${selectedTrade.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...closeFormData,
          exit_price: parseFloat(closeFormData.exit_price),
          pnl_amount: parseFloat(closeFormData.pnl_amount),
          pnl_percentage: parseFloat(closeFormData.pnl_percentage)
        })
      })
      
      if (response.ok) {
        const updatedTrade = await response.json()
        setTrades(prev => prev.map(trade => 
          trade.id === selectedTrade.id ? updatedTrade : trade
        ))
        setShowCloseTradeForm(false)
        setSelectedTrade(null)
        resetCloseForm()
        fetchPerformance()
      } else {
        const error = await response.json()
        alert(`Error closing trade: ${error.error}`)
      }
    } catch (error) {
      console.error('Error closing trade:', error)
      alert('Error closing trade. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>, formType: 'create' | 'close') => {
    const files = Array.from(e.target.files || [])
    if (formType === 'create') {
      setFormData(prev => ({ ...prev, screenshots: files }))
    } else {
      setCloseFormData(prev => ({ ...prev, screenshots: files }))
    }
  }
  
  const handleViewTrade = (trade: Trade) => {
    setSelectedTradeForView(trade)
    setShowTradeViewModal(true)
  }
  
  const handleEditTrade = (trade: Trade) => {
    setEditFormData({
      symbol: trade.symbol,
      instrument_type: trade.instrument_type,
      direction: trade.direction,
      entry_price: trade.entry_price,
      entry_time: trade.entry_time?.slice(0, 16),
      entry_reason: trade.entry_reason,
      position_size: trade.position_size,
      position_size_currency: trade.position_size_currency,
      leverage: trade.leverage,
      notes: trade.notes
    })
    setSelectedTrade(trade)
    setShowEditModal(true)
  }
  
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTrade) return
    
    setSubmitting(true)
    try {
      const response = await fetch(`/api/trading-journal/trades/${selectedTrade.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editFormData,
          entry_price: parseFloat(editFormData.entry_price),
          position_size: parseFloat(editFormData.position_size),
          leverage: parseFloat(editFormData.leverage)
        })
      })
      
      if (response.ok) {
        const updatedTrade = await response.json()
        setTrades(prev => prev.map(trade => 
          trade.id === selectedTrade.id ? updatedTrade : trade
        ))
        setShowEditModal(false)
        setSelectedTrade(null)
        fetchPerformance()
      } else {
        const error = await response.json()
        alert(`Error updating trade: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating trade:', error)
      alert('Error updating trade. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleDeleteTrade = async (tradeId: number) => {
    if (!confirm('Are you sure you want to delete this trade? This action cannot be undone.')) {
      return
    }
    
    try {
      const response = await fetch(`/api/trading-journal/trades/${tradeId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setTrades(prev => prev.filter(trade => trade.id !== tradeId))
        fetchPerformance()
      } else {
        const error = await response.json()
        alert(`Error deleting trade: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting trade:', error)
      alert('Error deleting trade. Please try again.')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const safeNumber = (value: any): number => {
    if (value === null || value === undefined) return 0
    const num = Number(value)
    return isNaN(num) ? 0 : num
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trading Journal</h1>
          <p className="text-muted-foreground">Track your trades, analyze performance, and improve your strategy</p>
        </div>
        <Button onClick={() => setShowTradeForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Trade
        </Button>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.totalTrades}</div>
            <p className="text-xs text-muted-foreground">
              {performance.winningTrades} winning, {performance.losingTrades} losing
            </p>
          </CardContent>
        </Card>

         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
             <Target className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{safeNumber(performance.winRate).toFixed(1)}%</div>
             <Progress value={safeNumber(performance.winRate)} className="mt-2" />
           </CardContent>
         </Card>

         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
             <DollarSign className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className={`text-2xl font-bold ${safeNumber(performance.totalPnl) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
               {formatCurrency(safeNumber(performance.totalPnl))}
             </div>
             <p className="text-xs text-muted-foreground">
               Avg: {formatCurrency(safeNumber(performance.averagePnl))}
             </p>
           </CardContent>
         </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Trades</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trades.filter(t => t.status === 'open').length}
            </div>
            <p className="text-xs text-muted-foreground">Active positions</p>
          </CardContent>
        </Card>
      </div>

      {/* Open Trades - Card View */}
      {trades.filter(t => t.status === 'open').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Open Trades</CardTitle>
            <CardDescription>Your active positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trades.filter(t => t.status === 'open').map((trade) => (
                <Card key={trade.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewTrade(trade)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={trade.direction === 'long' ? 'default' : 'secondary'}>
                        {trade.direction.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{trade.instrument_type}</span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{trade.symbol}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Entry:</span>
                        <span className="font-medium">{formatCurrency(trade.entry_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span>{trade.position_size} {trade.position_size_currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Leverage:</span>
                        <span>{trade.leverage}x</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Click to view details</span>
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleCloseTrade(trade); }}>
                          Close
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Closed Trades - Table View */}
      {trades.filter(t => t.status === 'closed').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Closed Trades</CardTitle>
            <CardDescription>Your completed trades for analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Symbol</th>
                    <th className="text-left p-2 font-medium">Direction</th>
                    <th className="text-left p-2 font-medium">Entry Price</th>
                    <th className="text-left p-2 font-medium">Exit Price</th>
                    <th className="text-left p-2 font-medium">P&L</th>
                    <th className="text-left p-2 font-medium">Status</th>
                    <th className="text-left p-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.filter(t => t.status === 'closed').map((trade) => (
                    <tr key={trade.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{trade.symbol}</span>
                          <Badge variant="outline" className="text-xs">{trade.instrument_type}</Badge>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant={trade.direction === 'long' ? 'default' : 'secondary'}>
                          {trade.direction.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-2">{formatCurrency(trade.entry_price)}</td>
                      <td className="p-2">{formatCurrency(trade.exit_price!)}</td>
                      <td className="p-2">
                        <div className={`font-medium ${safeNumber(trade.pnl_amount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(safeNumber(trade.pnl_amount))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {safeNumber(trade.pnl_percentage).toFixed(2)}%
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant={trade.is_winning ? 'default' : 'destructive'}>
                          {trade.is_winning ? 'Win' : 'Loss'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewTrade(trade)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditTrade(trade)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteTrade(trade.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Trades Message */}
      {trades.length === 0 && (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4" />
            <p>No trades recorded yet</p>
            <p className="text-sm">Start by creating your first trade</p>
          </CardContent>
        </Card>
      )}

      {/* Create Trade Dialog */}
      <Dialog open={showTradeForm} onOpenChange={setShowTradeForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Trade</DialogTitle>
            <DialogDescription>Record a new trade with all the details</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol *</Label>
                <Input
                  id="symbol"
                  value={formData.symbol}
                  onChange={(e) => handleInputChange('symbol', e.target.value)}
                  placeholder="BTCUSD"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instrument_type">Instrument Type *</Label>
                <Select value={formData.instrument_type} onValueChange={(value) => handleInputChange('instrument_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="forex">Forex</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    <SelectItem value="commodity">Commodity</SelectItem>
                    <SelectItem value="index">Index</SelectItem>
                    <SelectItem value="option">Option</SelectItem>
                    <SelectItem value="future">Future</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="direction">Direction *</Label>
                <Select value={formData.direction} onValueChange={(value) => handleInputChange('direction', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="long">Long</SelectItem>
                    <SelectItem value="short">Short</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entry_price">Entry Price *</Label>
                <Input
                  id="entry_price"
                  type="number"
                  step="0.000001"
                  value={formData.entry_price}
                  onChange={(e) => handleInputChange('entry_price', e.target.value)}
                  placeholder="45000.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="entry_time">Entry Time *</Label>
                <Input
                  id="entry_time"
                  type="datetime-local"
                  value={formData.entry_time}
                  onChange={(e) => handleInputChange('entry_time', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position_size">Position Size *</Label>
                <Input
                  id="position_size"
                  type="number"
                  step="0.000001"
                  value={formData.position_size}
                  onChange={(e) => handleInputChange('position_size', e.target.value)}
                  placeholder="100"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leverage">Leverage</Label>
                <Input
                  id="leverage"
                  type="number"
                  step="0.01"
                  value={formData.leverage}
                  onChange={(e) => handleInputChange('leverage', e.target.value)}
                  placeholder="1.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry_reason">Entry Reason</Label>
              <Textarea
                id="entry_reason"
                value={formData.entry_reason}
                onChange={(e) => handleInputChange('entry_reason', e.target.value)}
                placeholder="Why are you entering this trade?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="screenshots">Screenshots</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload trade screenshots</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleScreenshotUpload(e, 'create')}
                  className="hidden"
                  id="screenshots"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('screenshots')?.click()}
                >
                  Choose Files
                </Button>
                {formData.screenshots.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.screenshots.length} file(s) selected
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowTradeForm(false)
                resetForm()
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Trade'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Close Trade Dialog */}
      <Dialog open={showCloseTradeForm} onOpenChange={setShowCloseTradeForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Close Trade</DialogTitle>
            <DialogDescription>
              Record exit details and analyze your trade performance
            </DialogDescription>
          </DialogHeader>
          
          {selectedTrade && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Trade Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Symbol:</span> {selectedTrade.symbol}
                </div>
                <div>
                  <span className="text-muted-foreground">Direction:</span> {selectedTrade.direction}
                </div>
                <div>
                  <span className="text-muted-foreground">Entry Price:</span> {formatCurrency(selectedTrade.entry_price)}
                </div>
                <div>
                  <span className="text-muted-foreground">Position Size:</span> {selectedTrade.position_size} {selectedTrade.position_size_currency}
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleCloseTradeSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exit_price">Exit Price *</Label>
                <Input
                  id="exit_price"
                  type="number"
                  step="0.000001"
                  value={closeFormData.exit_price}
                  onChange={(e) => setCloseFormData(prev => ({ ...prev, exit_price: e.target.value }))}
                  placeholder="45000.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exit_time">Exit Time *</Label>
                <Input
                  id="exit_time"
                  type="datetime-local"
                  value={closeFormData.exit_time}
                  onChange={(e) => setCloseFormData(prev => ({ ...prev, exit_time: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pnl_amount">P&L Amount</Label>
                <Input
                  id="pnl_amount"
                  type="number"
                  step="0.01"
                  value={closeFormData.pnl_amount}
                  onChange={(e) => setCloseFormData(prev => ({ ...prev, pnl_amount: e.target.value }))}
                  placeholder="150.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pnl_percentage">P&L Percentage</Label>
                <Input
                  id="pnl_percentage"
                  type="number"
                  step="0.01"
                  value={closeFormData.pnl_percentage}
                  onChange={(e) => setCloseFormData(prev => ({ ...prev, pnl_percentage: e.target.value }))}
                  placeholder="3.5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exit_reason">Exit Reason</Label>
              <Textarea
                id="exit_reason"
                value={closeFormData.exit_reason}
                onChange={(e) => setCloseFormData(prev => ({ ...prev, exit_reason: e.target.value }))}
                placeholder="Why are you exiting this trade?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lessons_learned">Lessons Learned</Label>
              <Textarea
                id="lessons_learned"
                value={closeFormData.lessons_learned}
                onChange={(e) => setCloseFormData(prev => ({ ...prev, lessons_learned: e.target.value }))}
                placeholder="What did you learn from this trade?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_time_actions">Next Time Actions</Label>
              <Textarea
                id="next_time_actions"
                value={closeFormData.next_time_actions}
                onChange={(e) => setCloseFormData(prev => ({ ...prev, next_time_actions: e.target.value }))}
                placeholder="What will you do differently next time?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="close_screenshots">Screenshots</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload exit screenshots</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleScreenshotUpload(e, 'close')}
                  className="hidden"
                  id="close_screenshots"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('close_screenshots')?.click()}
                >
                  Choose Files
                </Button>
                {closeFormData.screenshots.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {closeFormData.screenshots.length} file(s) selected
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowCloseTradeForm(false)
                setSelectedTrade(null)
                resetCloseForm()
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Closing...' : 'Close Trade'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Trade View Modal */}
      <Dialog open={showTradeViewModal} onOpenChange={setShowTradeViewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Trade Details</DialogTitle>
            <DialogDescription>Complete information about this trade</DialogDescription>
          </DialogHeader>
          
          {selectedTradeForView && (
            <div className="space-y-6">
              {/* Trade Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant={selectedTradeForView.direction === 'long' ? 'default' : 'secondary'}>
                    {selectedTradeForView.direction.toUpperCase()}
                  </Badge>
                  <h3 className="text-xl font-bold">{selectedTradeForView.symbol}</h3>
                  <Badge variant="outline">{selectedTradeForView.instrument_type}</Badge>
                  <Badge variant={selectedTradeForView.status === 'open' ? 'default' : 'secondary'}>
                    {selectedTradeForView.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditTrade(selectedTradeForView)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  {selectedTradeForView.status === 'open' && (
                    <Button variant="outline" size="sm" onClick={() => handleCloseTrade(selectedTradeForView)}>
                      Close Trade
                    </Button>
                  )}
                </div>
              </div>

              {/* Trade Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Entry Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Entry Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entry Price:</span>
                      <span className="font-medium">{formatCurrency(selectedTradeForView.entry_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entry Time:</span>
                      <span className="font-medium">{formatDate(selectedTradeForView.entry_time)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Position Size:</span>
                      <span className="font-medium">{selectedTradeForView.position_size} {selectedTradeForView.position_size_currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Leverage:</span>
                      <span className="font-medium">{selectedTradeForView.leverage}x</span>
                    </div>
                    {selectedTradeForView.entry_reason && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Entry Reason:</span>
                        <span className="font-medium">{selectedTradeForView.entry_reason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Exit Details (if closed) */}
                {selectedTradeForView.status === 'closed' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Exit Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Exit Price:</span>
                        <span className="font-medium">{formatCurrency(selectedTradeForView.exit_price!)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Exit Time:</span>
                        <span className="font-medium">{formatDate(selectedTradeForView.exit_time!)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">P&L Amount:</span>
                        <span className={`font-medium ${safeNumber(selectedTradeForView.pnl_amount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(safeNumber(selectedTradeForView.pnl_amount))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">P&L Percentage:</span>
                        <span className={`font-medium ${safeNumber(selectedTradeForView.pnl_percentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {safeNumber(selectedTradeForView.pnl_percentage).toFixed(2)}%
                        </span>
                      </div>
                      {selectedTradeForView.exit_reason && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Exit Reason:</span>
                          <span className="font-medium">{selectedTradeForView.exit_reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedTradeForView.notes && (
                    <div>
                      <h5 className="font-medium mb-2">Notes</h5>
                      <p className="text-sm text-gray-600">{selectedTradeForView.notes}</p>
                    </div>
                  )}
                  {selectedTradeForView.lessons_learned && (
                    <div>
                      <h5 className="font-medium mb-2">Lessons Learned</h5>
                      <p className="text-sm text-gray-600">{selectedTradeForView.lessons_learned}</p>
                    </div>
                  )}
                  {selectedTradeForView.next_time_actions && (
                    <div>
                      <h5 className="font-medium mb-2">Next Time Actions</h5>
                      <p className="text-sm text-gray-600">{selectedTradeForView.next_time_actions}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Screenshots */}
              {selectedTradeForView.screenshots && selectedTradeForView.screenshots.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Screenshots</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedTradeForView.screenshots.map((screenshot: any, index: number) => (
                      <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={screenshot.url || URL.createObjectURL(screenshot)} 
                          alt={`Trade screenshot ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Trade Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Trade</DialogTitle>
            <DialogDescription>Update trade information</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_symbol">Symbol *</Label>
                <Input
                  id="edit_symbol"
                  value={editFormData.symbol || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, symbol: e.target.value }))}
                  placeholder="BTCUSD"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_instrument_type">Instrument Type *</Label>
                <Select value={editFormData.instrument_type || ''} onValueChange={(value) => setEditFormData(prev => ({ ...prev, instrument_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="forex">Forex</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    <SelectItem value="commodity">Commodity</SelectItem>
                    <SelectItem value="index">Index</SelectItem>
                    <SelectItem value="option">Option</SelectItem>
                    <SelectItem value="future">Future</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_direction">Direction *</Label>
                <Select value={editFormData.direction || ''} onValueChange={(value) => setEditFormData(prev => ({ ...prev, direction: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="long">Long</SelectItem>
                    <SelectItem value="short">Short</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_entry_price">Entry Price *</Label>
                <Input
                  id="edit_entry_price"
                  type="number"
                  step="0.000001"
                  value={editFormData.entry_price || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, entry_price: e.target.value }))}
                  placeholder="45000.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_entry_time">Entry Time *</Label>
                <Input
                  id="edit_entry_time"
                  type="datetime-local"
                  value={editFormData.entry_time || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, entry_time: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_position_size">Position Size *</Label>
                <Input
                  id="edit_position_size"
                  type="number"
                  step="0.000001"
                  value={editFormData.position_size || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, position_size: e.target.value }))}
                  placeholder="100"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_leverage">Leverage</Label>
                <Input
                  id="edit_leverage"
                  type="number"
                  step="0.01"
                  value={editFormData.leverage || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, leverage: e.target.value }))}
                  placeholder="1.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_entry_reason">Entry Reason</Label>
              <Textarea
                id="edit_entry_reason"
                value={editFormData.entry_reason || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, entry_reason: e.target.value }))}
                placeholder="Why are you entering this trade?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_notes">Notes</Label>
              <Textarea
                id="edit_notes"
                value={editFormData.notes || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this trade"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowEditModal(false)
                setSelectedTrade(null)
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Trade'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
