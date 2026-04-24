import { NextResponse } from 'next/server'
import { syncMultipleGames, syncPlayerCounts } from '@/lib/sync'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const playersOnly = searchParams.get('players') === 'true'

  try {
    if (playersOnly) {
      const results = await syncPlayerCounts()
      return NextResponse.json({
        success: true,
        mode: 'players',
        synced: results.length,
        players: results,
      })
    }

    // Fetch app IDs from multiple store endpoints
    const appIds = await getDynamicAppIds()
    // Only sync featured games, skip player counts for now
    const results = await syncMultipleGames(appIds.slice(0, 10))
    await syncPlayerCounts()

    return NextResponse.json({
      success: true,
      mode: 'full',
      synced: results.length,
      games: results.map(g => ({ id: g.id, name: g.name }))
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

async function getDynamicAppIds(): Promise<number[]> {
  const ids = new Set<number>()

  // Featured games
  try {
    const res = await fetch('https://store.steampowered.com/api/featured?cc=us&l=en', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    const data = await res.json()
    for (const item of data?.featured_win ?? []) {
      if (item.id) ids.add(item.id)
    }
  } catch {}

  // Featured categories (top sellers, new releases, specials)
  try {
    const res = await fetch('https://store.steampowered.com/api/featuredcategories?cc=us&l=en', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    const data = await res.json()

    const sections = ['top_sellers', 'new_releases', 'specials', 'coming_soon']
    for (const section of sections) {
      for (const item of data?.[section]?.items ?? []) {
        if (item.id) ids.add(item.id)
      }
    }
  } catch {}

  return Array.from(ids)
}