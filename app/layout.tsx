import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LBG Command Center',
  description: 'Back-office La Bonne Glace Martinique',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
