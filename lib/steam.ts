export async function getSteamAppList(): Promise<{ appid: number; name: string }[]> {
  const res = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2/')
  const data = await res.json()
  return data.applist.apps
}

export async function getSteamAppDetails(appId: number) {
  const res = await fetch(
    `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=en`
  )
  const data = await res.json()
  const app = data[appId.toString()]

  if (!app?.success) return null

  return app.data
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}