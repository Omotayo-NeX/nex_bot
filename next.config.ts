import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
  env: {
    NEXTAUTH_URL: process.env.NODE_ENV === "production"
      ? "https://ai.nexconsultingltd.com"
      : "http://localhost:3000",
  },
};

export default nextConfig;
