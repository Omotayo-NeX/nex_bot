import type { Metadata } from 'next'
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
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://ai.nexconsultingltd.com'),
  title: {
    default: 'NeX AI - Marketing Automation for African Entrepreneurs',
    template: '%s | NeX AI'
  },
  description: 'AI-powered marketing automation, content creation, and business intelligence built for African entrepreneurs. Generate content, automate workflows, and scale your business with NeX AI.',
  keywords: ['AI assistant', 'marketing automation', 'African business', 'content generation', 'NeX Consulting', 'digital marketing', 'AI chatbot', 'business automation'],
  authors: [{ name: 'NeX Consulting Limited', url: 'https://nexconsultingltd.com' }],
  creator: 'NeX Consulting Limited',
  publisher: 'NeX Consulting Limited',
  // Icons are auto-generated from app/icon.tsx and app/apple-icon.tsx
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ai.nexconsultingltd.com',
    title: 'NeX AI - Marketing Automation for African Entrepreneurs',
    description: 'AI-powered marketing automation built for African businesses. Generate content, automate workflows, and scale faster.',
    siteName: 'NeX AI',
    // OG image is auto-generated from app/opengraph-image.tsx
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeX AI - Marketing Automation for African Entrepreneurs',
    description: 'AI-powered marketing automation built for African businesses.',
    // Twitter image is auto-generated from app/twitter-image.tsx
    creator: '@nexconsult_AI', // TODO: Update with verified Twitter/X handle
    site: '@nexconsult_AI',
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
