import { NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth/admin"

export async function GET(request: Request) {
  try {
    const { isAdmin, user, error } = await checkAdminAccess(request)
    
    if (!isAdmin || error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mock trading news data (in real implementation, this would fetch from news APIs)
    const news = [
      {
        id: '1',
        title: 'Federal Reserve Signals Potential Rate Cuts in 2024',
        summary: 'The Federal Reserve indicated a more dovish stance, suggesting potential interest rate cuts in the coming year as inflation continues to moderate.',
        content: 'Federal Reserve officials have signaled a potential shift in monetary policy, with several members indicating that rate cuts could be on the horizon in 2024. This comes as inflation data continues to show signs of moderation, with the latest CPI reading falling below expectations.',
        source: 'Reuters',
        author: 'John Smith',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        url: 'https://www.reuters.com/markets/us/federal-reserve-signals-potential-rate-cuts-2024',
        category: 'Monetary Policy',
        sentiment: 'positive',
        impact: 'high'
      },
      {
        id: '2',
        title: 'European Markets Rally on ECB Policy Optimism',
        summary: 'European markets showed strong gains as investors anticipate continued accommodative monetary policy from the European Central Bank.',
        content: 'European stock markets surged to new highs as investors bet on continued accommodative monetary policy from the European Central Bank. The DAX and CAC 40 both posted significant gains, with banking stocks leading the rally.',
        source: 'Bloomberg',
        author: 'Maria Garcia',
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        url: 'https://www.bloomberg.com/news/articles/european-markets-rally-ecb-policy-optimism',
        category: 'Markets',
        sentiment: 'positive',
        impact: 'medium'
      },
      {
        id: '3',
        title: 'Oil Prices Surge on Middle East Tensions',
        summary: 'Crude oil prices jumped following escalating tensions in the Middle East region, with Brent crude rising above $85 per barrel.',
        content: 'Oil prices surged to their highest level in months as geopolitical tensions in the Middle East escalated. Brent crude futures rose above $85 per barrel, while WTI crude also posted significant gains.',
        source: 'CNBC',
        author: 'David Johnson',
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        url: 'https://www.cnbc.com/2024/01/15/oil-prices-surge-middle-east-tensions.html',
        category: 'Commodities',
        sentiment: 'negative',
        impact: 'high'
      },
      {
        id: '4',
        title: 'Bank of Japan Maintains Ultra-Loose Policy',
        summary: 'The Bank of Japan kept its ultra-loose monetary policy unchanged, maintaining negative interest rates and yield curve control.',
        content: 'The Bank of Japan maintained its ultra-loose monetary policy stance, keeping interest rates at -0.1% and continuing its yield curve control program. The decision was widely expected by market participants.',
        source: 'Financial Times',
        author: 'Sarah Wilson',
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        url: 'https://www.ft.com/content/bank-of-japan-maintains-ultra-loose-policy',
        category: 'Monetary Policy',
        sentiment: 'neutral',
        impact: 'medium'
      },
      {
        id: '5',
        title: 'US Dollar Strengthens Against Major Currencies',
        summary: 'The US dollar gained strength against major currencies as safe-haven demand increased amid global economic uncertainty.',
        content: 'The US dollar index rose to its highest level in weeks as investors sought safe-haven assets amid growing global economic uncertainty. The greenback gained against the euro, yen, and pound.',
        source: 'MarketWatch',
        author: 'Robert Chen',
        publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
        url: 'https://www.marketwatch.com/story/us-dollar-strengthens-major-currencies',
        category: 'Forex',
        sentiment: 'positive',
        impact: 'medium'
      },
      {
        id: '6',
        title: 'Gold Prices Hit Record Highs',
        summary: 'Gold prices reached new record highs as investors flocked to the precious metal amid economic uncertainty and inflation concerns.',
        content: 'Gold prices surged to new record highs, with spot gold reaching $2,100 per ounce as investors sought safe-haven assets. The rally was driven by economic uncertainty and persistent inflation concerns.',
        source: 'Kitco News',
        author: 'Lisa Thompson',
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        url: 'https://www.kitco.com/news/gold-prices-hit-record-highs',
        category: 'Commodities',
        sentiment: 'positive',
        impact: 'medium'
      }
    ]

    // Filter news by category or sentiment if requested
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const sentiment = url.searchParams.get('sentiment')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    let filteredNews = news
    if (category) {
      filteredNews = filteredNews.filter(item => item.category.toLowerCase() === category.toLowerCase())
    }
    if (sentiment) {
      filteredNews = filteredNews.filter(item => item.sentiment.toLowerCase() === sentiment.toLowerCase())
    }

    // Sort by publication date (newest first)
    filteredNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    return NextResponse.json({
      news: filteredNews.slice(0, limit),
      total: filteredNews.length,
      categories: [...new Set(news.map(item => item.category))],
      sentiments: [...new Set(news.map(item => item.sentiment))]
    })
  } catch (error) {
    console.error("Trading news fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
