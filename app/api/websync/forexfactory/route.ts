import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const username: string | undefined = body?.username
    const password: string | undefined = body?.password
    const profileUrl: string | undefined = body?.profileUrl

    if (!username || !password) {
      return NextResponse.json({ error: 'username and password are required' }, { status: 400 })
    }

    // Basic allowlist for URLs; default to user profile if provided
    const url = typeof profileUrl === 'string' && profileUrl.startsWith('https://www.forexfactory.com/')
      ? profileUrl
      : 'https://www.forexfactory.com/'

    // Fetch the page HTML (public pages only). We don't store or forward credentials.
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36'
      },
      cache: 'no-store'
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return NextResponse.json({ error: 'Fetch failed', status: res.status, details: text.slice(0, 200) }, { status: 502 })
    }

    const html = await res.text()
    // Very light parsing without external deps
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : null
    const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]{1,80})<\/a>/gi
    const links: { href: string; text: string }[] = []
    let m: RegExpExecArray | null
    while ((m = linkRegex.exec(html)) && links.length < 50) {
      const href = m[1]
      const text = m[2].replace(/\s+/g, ' ').trim()
      if (text && href && !href.startsWith('#')) {
        // Only keep ForexFactory links
        const full = href.startsWith('http') ? href : `https://www.forexfactory.com${href.startsWith('/') ? '' : '/'}${href}`
        if (full.startsWith('https://www.forexfactory.com')) {
          links.push({ href: full, text })
        }
      }
    }

    return NextResponse.json({ success: true, title, url, links })
  } catch (error: any) {
    return NextResponse.json({ error: 'Unexpected error', details: error?.message }, { status: 500 })
  }
}


