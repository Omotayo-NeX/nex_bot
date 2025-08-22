import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NeX Bot - AI Assistant',
  description: 'Your intelligent assistant for NeX Consulting',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-50 text-zinc-900">
        {children}
      </body>
    </html>
  )
}
