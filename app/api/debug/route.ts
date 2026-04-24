import { NextResponse } from 'next/server'

export async function GET() {
  const results: Record<string, string> = {}

  const urls = [
    'https://api.steampowered.com/ISteamApps/GetAppList/v2/',
    `https://api.steampowered.com/ISteamApps/GetAppList/v2/?key=${process.env.STEAM_API_KEY}`,
    'https://store.steampowered.com/api/appdetails?appids=730&cc=us',
    'https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=730',
  ]

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5000),
      })
      const text = await res.text()
      results[url] = text.startsWith('<') ? 'BLOCKED (HTML)' : `OK (${res.status}) - ${text.slice(0, 100)}`
    } catch (e) {
      results[url] = `ERROR: ${String(e)}`
    }
  }

  return NextResponse.json(results)
}