import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { server, login, password } = await request.json()
    if (!server || !login || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // External MT5 REST API base and key (configure in .env.local)
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

    // Construct payload per provider docs (this is a placeholder shape)
    const payload = { server, login, password }

    // Proxy request to MT5 provider
    const res = await fetch(`${apiBase}/api/sessions/start/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(payload),
      // Do not cache sensitive calls
      cache: 'no-store',
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: 'MT5 connect failed', details: text }, { status: 502 })
    }

    const data = await res.json()
    // Normalize common session id fields
    const sessionId = data?.id || data?.sessionId || data?.token || data?.session?.id || data?.session?.sessionId || data?.session?.token
    return NextResponse.json({ success: true, session: { id: sessionId, raw: data } })
  } catch (error: any) {
    return NextResponse.json({ error: 'Unexpected error', details: error?.message }, { status: 500 })
  }
}


