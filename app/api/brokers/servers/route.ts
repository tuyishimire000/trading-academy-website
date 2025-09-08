import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

async function fetchFrom(url: string) {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`)
  return res.json()
}

export async function GET() {
  try {
    // Primary source: TradeVPS Marketplace broker servers API
    // Fallback: GitHub repo with server list
    const primary = 'https://mp.tradevps.net/api/broker-servers'
    const fallback = 'https://raw.githubusercontent.com/tradevpsnet/mp-apis-broker-servers/main/brokers.json'

    let data: any
    try {
      data = await fetchFrom(primary)
    } catch (_err) {
      data = await fetchFrom(fallback)
    }

    // Normalize to { brokers: [{ name, website, servers: [serverName] }] }
    let normalized: any = { brokers: [] as any[] }
    if (Array.isArray(data?.brokers)) {
      normalized = data
    } else if (Array.isArray(data)) {
      normalized.brokers = data.map((b: any) => ({
        name: b?.name || b?.broker || 'Unknown',
        website: b?.website || null,
        servers: Array.isArray(b?.servers) ? b.servers : (Array.isArray(b?.server_list) ? b.server_list : [])
      }))
    }

    return NextResponse.json(normalized, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch broker servers', details: error?.message }, { status: 502 })
  }
}


