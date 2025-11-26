import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/lib/providers'
import { Toaster } from 'sonner'
import ConditionalFooter from '@/app/components/ConditionalFooter'
import { Inter, Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { OrganizationSchema, WebSiteSchema, SoftwareApplicationSchema } from '@/components/JsonLd'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0E0E12' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL('https://ai.nexconsultingltd.com'),
  title: {
    default: 'NeX Labs — AI Products Powering Africa\'s Future | NeX AI Chat, Expense & More',
    template: '%s | NeX Labs'
  },
  description: 'AI-powered business automation for African entrepreneurs. Build smarter with NeX AI Chat, NeX Expense tracking, and intelligent workflows.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NeX AI',
  },
  formatDetection: {
    telephone: false,
  },
  keywords: [
    'NeX Labs',
    'AI products Africa',
    'NeX AI Chat',
    'NeX Expense',
    'AI business automation',
    'African AI innovation',
    'intelligent workflows',
    'AI assistant Africa',
    'expense tracking AI',
    'business automation tools',
    'NeX Consulting',
    'AI voice synthesis',
    'AI marketing automation'
  ],
  authors: [{ name: 'NeX Consulting Limited', url: 'https://nexconsultingltd.com' }],
  creator: 'NeX Consulting Limited',
  publisher: 'NeX Consulting Limited',
  category: 'Technology',
  alternates: {
    canonical: 'https://ai.nexconsultingltd.com',
  },
  // Icons are auto-generated from app/icon.tsx and app/apple-icon.tsx
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ai.nexconsultingltd.com',
    title: 'NeX Labs — AI Products Powering Africa\'s Future',
    description: 'AI automation for African businesses. NeX AI Chat, NeX Expense, and intelligent tools that help you work smarter.',
    siteName: 'NeX Labs',
    images: [
      {
        url: '/hero-nexlabs-2.png',
        width: 1200,
        height: 630,
        alt: 'NeX Labs - AI Innovation Hub',
      }
    ],
    // OG image is auto-generated from app/opengraph-image.tsx
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeX Labs — AI Products Powering Africa\'s Future',
    description: 'AI automation for African businesses. NeX AI Chat, NeX Expense, and more intelligent tools.',
    // Twitter image is auto-generated from app/twitter-image.tsx
    creator: '@nexconsult_AI',
    site: '@nexconsult_AI',
    images: ['/hero-nexlabs-2.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'your-google-site-verification-code', // Add when available
    // yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        {/* Preconnect to Google Fonts for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className="flex flex-col min-h-screen bg-zinc-50 text-zinc-900 font-sans" suppressHydrationWarning={true}>
        <OrganizationSchema />
        <WebSiteSchema />
        <SoftwareApplicationSchema />
        <Providers>
          <main className="flex-grow">
            {children}
          </main>
          <ConditionalFooter />
          <Toaster />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
