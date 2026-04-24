export async function getSteamAppList(): Promise<{ appid: number; name: string }[]> {
  // Use Steam's API with key first
  const urls = [
    `https://api.steampowered.com/ISteamApps/GetAppList/v2/?key=${process.env.STEAM_API_KEY}`,
    `https://api.steampowered.com/ISteamApps/GetAppList/v2/`,
  ]

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(10000),
      })

      const text = await res.text()
      if (text.trim().startsWith('<') || !res.ok) continue

      const data = JSON.parse(text)
      if (data?.applist?.apps) return data.applist.apps
    } catch {
      continue
    }
  }

  throw new Error('Could not fetch Steam app list from any source.')
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