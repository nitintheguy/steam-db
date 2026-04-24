export async function getSteamAppList(): Promise<{ appid: number; name: string }[]> {
  const res = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2/', {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 3600 },
  })

  const text = await res.text()

  if (!res.ok || text.trim().startsWith('<')) {
    const res2 = await fetch(
      `https://api.steampowered.com/ISteamApps/GetAppList/v2/?key=${process.env.STEAM_API_KEY}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    const text2 = await res2.text()
    if (text2.trim().startsWith('<')) {
      throw new Error('Steam API blocked on this network.')
    }
    const data2 = JSON.parse(text2)
    return data2.applist.apps
  }

  const data = JSON.parse(text)
  return data.applist.apps
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