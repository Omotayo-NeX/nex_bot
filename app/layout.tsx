import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NeX Bot - AI Assistant',
  description: 'Your intelligent AI assistant for digital marketing and automation',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: 'any', type: 'image/png' },
      { url: '/Nex_logomark_white.png', sizes: 'any', type: 'image/png' }
    ],
    shortcut: '/favicon.png',
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
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/Nex_logomark_white.png" />
        <link rel="shortcut icon" href="/favicon.png" />
      </head>
      <body className="bg-zinc-50 text-zinc-900">
        {children}
      </body>
    </html>
  )
}
