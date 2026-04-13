import { db } from '@/db'
import { games } from '@/db/schema'
import { ilike } from 'drizzle-orm'
import Link from 'next/link'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams

  const results = q
    ? await db.select().from(games).where(ilike(games.name, `%${q}%`)).limit(20)
    : []

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Search</h1>
      <form method="GET" action="/search" className="mb-8">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search games..."
          className="bg-[#16202d] border border-[#2a3f5f] text-white rounded px-4 py-2 w-full max-w-md outline-none focus:border-[#4c9b4c]"
        />
        <button
          type="submit"
          className="ml-2 bg-[#4c9b4c] hover:bg-[#5cb85c] text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </form>

      {q && results.length === 0 && (
        <p className="text-[#8ba7c7]">No games found for "{q}"</p>
      )}

      <div className="flex flex-col gap-2">
        {results.map(game => (
          <Link
            key={game.id}
            href={`/game/${game.steamAppId}`}
            className="bg-[#16202d] rounded p-4 flex items-center gap-4 hover:bg-[#1e2d3d] transition-colors"
          >
            {game.headerImage && (
              <img src={game.headerImage} alt={game.name} className="w-24 rounded shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-white font-medium">{game.name}</p>
              <p className="text-[#8ba7c7] text-sm mt-1 line-clamp-2">{game.shortDescription}</p>
            </div>
            <div className="text-right shrink-0">
              {game.isFree ? (
                <span className="text-[#4c9b4c] font-bold">Free</span>
              ) : (
                <span className="text-white font-bold">${game.currentPrice}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}