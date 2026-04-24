import { db } from '@/db'
import { games, priceHistory, tags, gameTags, playerHistory } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getSteamAppDetails, sleep,getSteamPlayerCount } from './steam'

export async function syncGame(appId: number) {
  const details = await getSteamAppDetails(appId)

  // Skip if Steam returned nothing useful
  if (!details || details.type !== 'game') return null

  const isFree = details.is_free ?? false
  const priceData = details.price_overview ?? null

  const currentPrice = priceData ? (priceData.final / 100).toFixed(2) : '0.00'
  const originalPrice = priceData ? (priceData.initial / 100).toFixed(2) : '0.00'
  const discountPercent = priceData?.discount_percent ?? 0

  // Upsert the game (insert or update if already exists)
  const [game] = await db
    .insert(games)
    .values({
      steamAppId: appId,
      name: details.name,
      type: details.type,
      shortDescription: details.short_description ?? null,
      headerImage: details.header_image ?? null,
      developer: details.developers?.[0] ?? null,
      publisher: details.publishers?.[0] ?? null,
      releaseDate: details.release_date?.date ?? null,
      isFree,
      currentPrice,
      originalPrice,
      discountPercent,
      reviewScore: details.metacritic?.score ?? null,
      positiveReviews: details.recommendations?.total ?? 0,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: games.steamAppId,
      set: {
        currentPrice,
        originalPrice,
        discountPercent,
        updatedAt: new Date(),
      },
    })
    .returning()

  // Save a price history entry
  await db.insert(priceHistory).values({
    gameId: game.id,
    price: currentPrice,
    originalPrice,
    discountPercent,
  })

  // Save tags
  if (details.genres) {
    for (const genre of details.genres) {
      // Insert tag if it doesn't exist yet
      const [tag] = await db
        .insert(tags)
        .values({ name: genre.description })
        .onConflictDoNothing()
        .returning()

      const tagId = tag?.id ?? (
        await db.query.tags.findFirst({
          where: eq(tags.name, genre.description)
        })
      )?.id

      if (tagId) {
        await db
          .insert(gameTags)
          .values({ gameId: game.id, tagId })
          .onConflictDoNothing()
      }
    }
  }

  return game
}

export async function syncMultipleGames(appIds: number[]) {
  const results = []

  for (const appId of appIds) {
    try {
      console.log(`Syncing ${appId}...`)
      const game = await syncGame(appId)
      if (game) results.push(game)
    } catch (err) {
      console.error(`Failed to sync ${appId}:`, err)
    }

    // Wait 1 second between each request so Steam doesn't block us
    await sleep(300)
  }

  return results
}


export async function syncPlayerCounts() {
  // Get all games from our database
  const allGames = await db.select({
    id: games.id,
    steamAppId: games.steamAppId,
    name: games.name,
  }).from(games)

  const results = []

  for (const game of allGames) {
    try {
      const count = await getSteamPlayerCount(game.steamAppId)

      if (count !== null) {
        await db.insert(playerHistory).values({
          gameId: game.id,
          playersNow: count,
        })
        console.log(`${game.name}: ${count.toLocaleString()} players`)
        results.push({ name: game.name, playersNow: count })
      }
    } catch (err) {
      console.error(`Failed for ${game.name}:`, err)
    }

    await sleep(500) // gentler delay, this API is more lenient
  }

  return results
}