import { NextResponse } from 'next/server'
import { syncMultipleGames, syncPlayerCounts } from '@/lib/sync'
import { getSteamAppList } from '@/lib/steam'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const playersOnly = searchParams.get('players') === 'true'
  const offset = parseInt(searchParams.get('offset') ?? '0')
  const limit = parseInt(searchParams.get('limit') ?? '50')

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

    const allApps = await getSteamAppList()
    const validApps = allApps
      .filter(app => app.name && app.name.trim() !== '')
      .slice(offset, offset + limit)

    const appIds = validApps.map(app => app.appid)
    const results = await syncMultipleGames(appIds)
    await syncPlayerCounts()

    return NextResponse.json({
      success: true,
      mode: 'full',
      total: allApps.length,
      offset,
      limit,
      synced: results.length,
      nextOffset: offset + limit,
      games: results.map(g => ({ id: g.id, name: g.name }))
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}