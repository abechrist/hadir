import type { Metadata, Viewport } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'HADIR - Kehadiran Mentor & Pendamping',
  description: 'Sistem Kehadiran Mentor & Pendamping — Dispora Kota Salatiga 2026',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.svg' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0A0F1C',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-screen bg-[#0A0F1C] text-[#F8FAFC] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
