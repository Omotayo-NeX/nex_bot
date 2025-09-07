import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/lib/providers'

// Force deployment refresh

export const metadata: Metadata = {
  title: 'NeX Bot - AI Assistant',
  description: 'Your intelligent AI assistant for digital marketing and automation',
  icons: {
    icon: [
      { url: '/Nex_logomark_white.png', sizes: 'any', type: 'image/png' },
      { url: '/favicon.png', sizes: 'any', type: 'image/png' }
    ],
    shortcut: '/Nex_logomark_white.png',
    apple: '/Nex_logomark_white.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/Nex_logomark_white.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/Nex_logomark_white.png" />
        <link rel="apple-touch-icon" href="/Nex_logomark_white.png" />
        <link rel="shortcut icon" href="/Nex_logomark_white.png" />
      </head>
      <body className="bg-zinc-50 text-zinc-900">
        <Providers session={null}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
