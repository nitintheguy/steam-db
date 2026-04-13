import { db } from '@/db'
import { games, playerHistory } from '@/db/schema'
import { desc } from 'drizzle-orm'
import Link from 'next/link'

export default async function HomePage() {
  const allGames = await db
    .select()
    .from(games)
    .orderBy(desc(games.positiveReviews))

  const playerCounts = await db
    .selectDistinctOn([playerHistory.gameId], {
      gameId: playerHistory.gameId,
      playersNow: playerHistory.playersNow,
    })
    .from(playerHistory)
    .orderBy(playerHistory.gameId, desc(playerHistory.recordedAt))

  const playerMap = Object.fromEntries(
    playerCounts.map(p => [p.gameId, p.playersNow])
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">All Games</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {allGames.map(game => (
          <Link
            key={game.id}
            href={`/game/${game.steamAppId}`}
            className="bg-[#16202d] rounded overflow-hidden hover:bg-[#1e2d3d] transition-colors"
          >
            {game.headerImage && (
              <img
                src={game.headerImage}
                alt={game.name}
                className="w-full object-cover"
              />
            )}
            <div className="p-3">
              <p className="text-white text-sm font-medium truncate">{game.name}</p>
              <div className="flex items-center justify-between mt-2">
                {game.isFree ? (
                  <span className="text-[#4c9b4c] text-sm font-bold">Free</span>
                ) : (
                  <div className="flex items-center gap-2">
                    {Number(game.discountPercent) > 0 && (
                      <span className="bg-[#4c9b4c] text-white text-xs px-1 py-0.5 rounded">
                        -{game.discountPercent}%
                      </span>
                    )}
                    <span className="text-white text-sm">
                      ${game.currentPrice}
                    </span>
                  </div>
                )}
                <span className="text-[#8ba7c7] text-xs">
                  {game.positiveReviews?.toLocaleString()} reviews
                </span>
              </div>
              <p className="text-[#4c9b4c] text-xs mt-1">
                {playerMap[game.id]
                  ? `${Number(playerMap[game.id]).toLocaleString()} playing`
                  : 'No data yet'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}