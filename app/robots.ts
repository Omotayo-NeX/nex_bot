import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://ai.nexconsultingltd.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/settings/',
          '/_next/',
          '/dashboard/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
