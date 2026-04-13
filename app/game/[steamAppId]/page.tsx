import { db } from '@/db'
import { games, priceHistory } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import PlayerCount from '@/app/components/PlayerCount'

export default async function GamePage({
  params,
}: {
  params: Promise<{ steamAppId: string }>
}) {
  const { steamAppId } = await params

  const game = await db.query.games.findFirst({
    where: eq(games.steamAppId, parseInt(steamAppId)),
  })

  if (!game) notFound()

  const prices = await db
    .select()
    .from(priceHistory)
    .where(eq(priceHistory.gameId, game.id))
    .orderBy(desc(priceHistory.recordedAt))
    .limit(30)

  return (
    <div>
      <div className="flex gap-6 mb-8">
        {game.headerImage && (
          <img
            src={game.headerImage}
            alt={game.name}
            className="w-72 rounded shrink-0"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{game.name}</h1>
          <p className="text-[#8ba7c7] text-sm mb-4">{game.shortDescription}</p>
          <div className="flex flex-col gap-1 text-sm">
            {game.developer && (
              <p><span className="text-[#8ba7c7]">Developer:</span> <span className="text-white">{game.developer}</span></p>
            )}
            {game.publisher && (
              <p><span className="text-[#8ba7c7]">Publisher:</span> <span className="text-white">{game.publisher}</span></p>
            )}
            {game.releaseDate && (
              <p><span className="text-[#8ba7c7]">Release date:</span> <span className="text-white">{game.releaseDate}</span></p>
            )}
          </div>
        </div>
      </div>

      <PlayerCount steamAppId={game.steamAppId} />

      <div className="bg-[#16202d] rounded p-4 mb-8 inline-block">
        {game.isFree ? (
          <p className="text-[#4c9b4c] text-2xl font-bold">Free to Play</p>
        ) : (
          <div className="flex items-center gap-4">
            {Number(game.discountPercent) > 0 && (
              <>
                <span className="bg-[#4c9b4c] text-white text-xl font-bold px-2 py-1 rounded">
                  -{game.discountPercent}%
                </span>
                <span className="text-[#8ba7c7] line-through text-lg">
                  ${game.originalPrice}
                </span>
              </>
            )}
            <span className="text-white text-2xl font-bold">
              ${game.currentPrice}
            </span>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Price History</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#8ba7c7] border-b border-[#2a3f5f]">
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">Price</th>
              <th className="text-left py-2">Original</th>
              <th className="text-left py-2">Discount</th>
            </tr>
          </thead>
          <tbody>
            {prices.map(p => (
              <tr key={p.id} className="border-b border-[#1e2d3d] hover:bg-[#16202d]">
                <td className="py-2 text-[#8ba7c7]">
                  {new Date(p.recordedAt!).toLocaleDateString()}
                </td>
                <td className="py-2 text-white">${p.price}</td>
                <td className="py-2 text-[#8ba7c7]">${p.originalPrice}</td>
                <td className="py-2">
                  {Number(p.discountPercent) > 0 ? (
                    <span className="text-[#4c9b4c]">-{p.discountPercent}%</span>
                  ) : (
                    <span className="text-[#8ba7c7]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}