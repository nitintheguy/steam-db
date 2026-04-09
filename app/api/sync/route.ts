import { NextResponse } from 'next/server'
import { syncMultipleGames } from '@/lib/sync'

// A hand-picked list of popular Steam app IDs to start with
const SEED_APP_IDS = [
  570,    // Dota 2
  730,    // CS2
  440,    // TF2
  1172470, // Apex Legends
  1245620, // Elden Ring
  1091500, // Cyberpunk 2077
  292030, // The Witcher 3
  271590, // GTA V
  381210, // Dead by Daylight
  578080, // PUBG
]

export async function GET() {
  try {
    const results = await syncMultipleGames(SEED_APP_IDS)
    return NextResponse.json({
      success: true,
      synced: results.length,
      games: results.map(g => ({ id: g.id, name: g.name }))
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}