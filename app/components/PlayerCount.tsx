'use client'

import { useEffect, useState } from 'react'

type PlayerData = {
  playersNow: number
  peak24h: number
  peakAllTime: number
  recordedAt: string | null
}

export default function PlayerCount({ steamAppId }: { steamAppId: number }) {
  const [data, setData] = useState<PlayerData | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchPlayers() {
    try {
      const res = await fetch(`/api/players/${steamAppId}`)
      const json = await res.json()
      setData(json)
    } catch {
      // silently fail, keep showing last data
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayers()

    // Refresh every 60 seconds
    const interval = setInterval(fetchPlayers, 60_000)
    return () => clearInterval(interval)
  }, [steamAppId])

  if (loading) {
    return (
      <div className="bg-[#16202d] rounded p-4 mb-8 animate-pulse">
        <div className="h-4 bg-[#2a3f5f] rounded w-32 mb-2"/>
        <div className="h-8 bg-[#2a3f5f] rounded w-24"/>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="bg-[#16202d] rounded p-4 mb-8">
      <p className="text-[#8ba7c7] text-xs uppercase tracking-wider mb-3">
        Player Activity
      </p>
      <div className="flex gap-8">
        <div>
          <p className="text-3xl font-bold text-[#4c9b4c]">
            {data.playersNow.toLocaleString()}
          </p>
          <p className="text-[#8ba7c7] text-xs mt-1">Playing now</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-white">
            {Number(data.peak24h).toLocaleString()}
          </p>
          <p className="text-[#8ba7c7] text-xs mt-1">24h peak</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-white">
            {Number(data.peakAllTime).toLocaleString()}
          </p>
          <p className="text-[#8ba7c7] text-xs mt-1">All-time peak</p>
        </div>
      </div>
      {data.recordedAt && (
        <p className="text-[#8ba7c7] text-xs mt-3">
          Last updated {new Date(data.recordedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}