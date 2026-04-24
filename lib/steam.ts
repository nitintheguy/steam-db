export async function getSteamAppList(): Promise<{ appid: number; name: string }[]> {
  // Steam's storefront search API - not blocked
  const categories = [
    'https://store.steampowered.com/api/featuredcategories?cc=us&l=en',
  ]

  // Use the featured games endpoint to get popular app IDs
  const res = await fetch(
    'https://store.steampowered.com/api/featured?cc=us&l=en',
    { headers: { 'User-Agent': 'Mozilla/5.0' } }
  )

  const text = await res.text()
  if (text.trim().startsWith('<')) throw new Error('Store API blocked')

  const data = JSON.parse(text)

  const apps: { appid: number; name: string }[] = []

  // Extract from featured windows games
  for (const item of data?.featured_win ?? []) {
    if (item.id && item.name) {
      apps.push({ appid: item.id, name: item.name })
    }
  }

  return apps
}

export async function getSteamAppDetails(appId: number) {
  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=en`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000),
      }
    )

    const text = await res.text()
    if (text.trim().startsWith('<')) return null

    const data = JSON.parse(text)
    const app = data[appId.toString()]
    if (!app?.success) return null

    console.log('price_overview:', JSON.stringify(app.data?.price_overview))
    return app.data
  } catch {
    return null
  }
}

export async function getSteamPlayerCount(appId: number): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appId}`,
      { signal: AbortSignal.timeout(5000) }
    )

    const text = await res.text()
    if (text.trim().startsWith('<')) return null

    const data = JSON.parse(text)
    return data?.response?.player_count ?? null
  } catch {
    return null
  }
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}