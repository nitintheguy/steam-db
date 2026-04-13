import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SteamDB Clone',
  description: 'Steam game database',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <nav className="bg-[#171a21] border-b border-[#2a3f5f] px-6 py-4 flex items-center gap-6">
          <a href="/" className="text-white font-bold text-xl">SteamDB</a>
          <a href="/" className="text-[#8ba7c7] hover:text-white text-sm">Games</a>
          <a href="/search" className="text-[#8ba7c7] hover:text-white text-sm">Search</a>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}