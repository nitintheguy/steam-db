export async function getSteamAppList(): Promise<{ appid: number; name: string }[]> {
  const res = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2/', {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 3600 }, // cache for 1 hour
  })

  const text = await res.text()

  if (!res.ok || text.trim().startsWith('<')) {
    // Fallback: fetch from Steam's other endpoint
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