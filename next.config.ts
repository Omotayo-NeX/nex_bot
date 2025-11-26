import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
      {
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
      },
    ],
  },
  env: {
    NEXTAUTH_URL: process.env.NODE_ENV === "production"
      ? "https://ai.nexconsultingltd.com"
      : "http://localhost:3000",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  // WWW to non-WWW redirects
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.ai.nexconsultingltd.com' }],
        destination: 'https://ai.nexconsultingltd.com/:path*',
        permanent: true,
      },
    ];
  },
  // Security and cache headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
