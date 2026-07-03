import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'

interface UnsplashResult {
  id: string
  thumbnail: string
  full: string
  alt: string
  photographer: string
  photographerUrl: string
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const description = searchParams.get('description')?.trim()
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  if (!q) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 })
  }

  let searchQuery = q
  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    try {
      const prompt = `Convert this quiz topic into a short photographic image search query (3-5 words max, no punctuation, focus on visual/photographic terms):

Quiz title: "${q}"${description ? `\nDescription: "${description}"` : ''}

Return ONLY the search query, nothing else. Examples:
- "World War II" \u2192 "historic battlefield photography"
- "JavaScript Basics" \u2192 "code programming screen"
- "Space Exploration" \u2192 "galaxy nebula telescope"
- "Cooking Italian" \u2192 "fresh pasta ingredients"`

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-5.4-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 30,
        }),
      })

      if (res.ok) {
        const data = (await res.json()) as {
          choices: Array<{ message: { content: string } }>
        }
        const aiQuery = data.choices?.[0]?.message?.content?.trim()
        if (aiQuery && aiQuery.length >= 2) {
          searchQuery = aiQuery
        }
      }
    } catch {
      // Fall back to original query on AI failure
    }
  }

  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY
  if (!unsplashKey) {
    return NextResponse.json({ error: 'UNSPLASH_ACCESS_KEY not configured' }, { status: 500 })
  }

  const unsplashUrl = new URL('https://api.unsplash.com/search/photos')
  unsplashUrl.searchParams.set('query', searchQuery)
  unsplashUrl.searchParams.set('page', String(page))
  unsplashUrl.searchParams.set('per_page', '20')
  unsplashUrl.searchParams.set('orientation', 'landscape')

  const unsplashRes = await fetch(unsplashUrl.toString(), {
    headers: { Authorization: `Client-ID ${unsplashKey}` },
  })

  if (!unsplashRes.ok) {
    const err = await unsplashRes.text().catch(() => 'Unknown')
    return NextResponse.json({ error: `Unsplash error: ${err}` }, { status: 502 })
  }

  const data = (await unsplashRes.json()) as {
    results: Array<{
      id: string
      urls: { thumb: string; regular: string; full: string }
      alt_description: string | null
      user: { name: string; links: { html: string } }
    }>
    total: number
    total_pages: number
  }

  const results: UnsplashResult[] = data.results.map((img) => ({
    id: img.id,
    thumbnail: img.urls.thumb,
    full: img.urls.regular,
    alt: img.alt_description ?? searchQuery,
    photographer: img.user.name,
    photographerUrl: img.user.links.html,
  }))

  return NextResponse.json({
    query: searchQuery,
    originalQuery: q,
    results,
    total: data.total,
    totalPages: data.total_pages,
  })
}
