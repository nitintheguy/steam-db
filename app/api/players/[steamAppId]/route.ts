import { NextResponse } from 'next/server'
import { db } from '@/db'
import { games, playerHistory } from '@/db/schema'
import { eq, desc, max, and, gte } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ steamAppId: string }> }
) {
  const { steamAppId } = await params

  const game = await db.query.games.findFirst({
    where: eq(games.steamAppId, parseInt(steamAppId)),
  })

  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  }

  // Most recent player count
  const latest = await db
    .select()
    .from(playerHistory)
    .where(eq(playerHistory.gameId, game.id))
    .orderBy(desc(playerHistory.recordedAt))
    .limit(1)

  // Peak in last 24 hours
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const peak24h = await db
    .select({ peak: max(playerHistory.playersNow) })
    .from(playerHistory)
    .where(
      and(
        eq(playerHistory.gameId, game.id),
        gte(playerHistory.recordedAt, yesterday)
      )
    )

  // All time peak
  const peakAllTime = await db
    .select({ peak: max(playerHistory.playersNow) })
    .from(playerHistory)
    .where(eq(playerHistory.gameId, game.id))

  return NextResponse.json({
    playersNow: latest[0]?.playersNow ?? 0,
    peak24h: peak24h[0]?.peak ?? 0,
    peakAllTime: peakAllTime[0]?.peak ?? 0,
    recordedAt: latest[0]?.recordedAt ?? null,
  })
}