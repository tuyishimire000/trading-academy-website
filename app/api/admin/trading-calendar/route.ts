import { NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth/admin"

export async function GET(request: Request) {
  try {
    const { isAdmin, user, error } = await checkAdminAccess(request)
    
    if (!isAdmin || error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mock trading calendar data (in real implementation, this would fetch from Forex Factory API)
    const today = new Date()
    const events = [
      {
        id: '1',
        currency: 'USD',
        event: 'Non-Farm Payrolls',
        impact: 'High',
        time: '13:30 GMT',
        forecast: '180K',
        previous: '173K',
        actual: null,
        date: today.toISOString().split('T')[0]
      },
      {
        id: '2',
        currency: 'EUR',
        event: 'ECB Interest Rate Decision',
        impact: 'High',
        time: '12:45 GMT',
        forecast: '4.50%',
        previous: '4.50%',
        actual: null,
        date: today.toISOString().split('T')[0]
      },
      {
        id: '3',
        currency: 'GBP',
        event: 'Bank of England Rate Decision',
        impact: 'Medium',
        time: '12:00 GMT',
        forecast: '5.25%',
        previous: '5.25%',
        actual: null,
        date: today.toISOString().split('T')[0]
      },
      {
        id: '4',
        currency: 'USD',
        event: 'ISM Manufacturing PMI',
        impact: 'Medium',
        time: '15:00 GMT',
        forecast: '47.1',
        previous: '46.7',
        actual: null,
        date: today.toISOString().split('T')[0]
      },
      {
        id: '5',
        currency: 'CAD',
        event: 'Bank of Canada Rate Decision',
        impact: 'High',
        time: '15:00 GMT',
        forecast: '5.00%',
        previous: '5.00%',
        actual: null,
        date: today.toISOString().split('T')[0]
      },
      {
        id: '6',
        currency: 'AUD',
        event: 'RBA Interest Rate Decision',
        impact: 'High',
        time: '04:30 GMT',
        forecast: '4.35%',
        previous: '4.35%',
        actual: null,
        date: today.toISOString().split('T')[0]
      },
      {
        id: '7',
        currency: 'JPY',
        event: 'Bank of Japan Policy Rate',
        impact: 'Medium',
        time: '03:00 GMT',
        forecast: '-0.10%',
        previous: '-0.10%',
        actual: null,
        date: today.toISOString().split('T')[0]
      },
      {
        id: '8',
        currency: 'CHF',
        event: 'SNB Interest Rate Decision',
        impact: 'Medium',
        time: '08:30 GMT',
        forecast: '1.75%',
        previous: '1.75%',
        actual: null,
        date: today.toISOString().split('T')[0]
      }
    ]

    // Filter events by impact level if requested
    const url = new URL(request.url)
    const impact = url.searchParams.get('impact')
    
    let filteredEvents = events
    if (impact) {
      filteredEvents = events.filter(event => event.impact.toLowerCase() === impact.toLowerCase())
    }

    return NextResponse.json({
      events: filteredEvents,
      date: today.toISOString().split('T')[0],
      total: filteredEvents.length
    })
  } catch (error) {
    console.error("Trading calendar fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
