import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { sessionId, from, to } = await request.json()
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const apiBase = process.env.MT5_API_BASE
    const apiKey = process.env.MT5_API_KEY

    if (!apiBase || !apiKey) {
      return NextResponse.json({
        error: 'MT5 API is not configured',
        missing: {
          MT5_API_BASE: !apiBase,
          MT5_API_KEY: !apiKey,
        }
      }, { status: 501 })
    }

    const payload: any = { sessionId }
    if (from) payload.from = from
    if (to) payload.to = to

    const res = await fetch(`${apiBase}/api/history/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: 'MT5 history failed', details: text }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json({ success: true, trades: data })
  } catch (error: any) {
    return NextResponse.json({ error: 'Unexpected error', details: error?.message }, { status: 500 })
  }
}


