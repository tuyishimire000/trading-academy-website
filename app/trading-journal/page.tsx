'use client'

import React from 'react'
import { TradingJournal } from '@/components/dashboard/trading-journal'
import { UserHeader } from '@/components/dashboard/user-header'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TradingJournalPage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-background">
      <UserHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard')}
              className="p-0 h-auto font-normal"
            >
              Dashboard
            </Button>
            <span>/</span>
            <span className="text-foreground font-medium">Trading Journal</span>
          </nav>
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <TradingJournal />
      </main>
    </div>
  )
}
