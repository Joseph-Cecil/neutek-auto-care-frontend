import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ─── Images ──────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.neutekautocare.com' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // local dev uploads
      { protocol: 'http',  hostname: 'localhost' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // ─── Security headers ─────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-Content-Type-Options',     value: 'nosniff' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },

  // ─── Redirects ────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: false,
      },
      {
        source: '/portal',
        destination: '/portal/dashboard',
        permanent: false,
      },
    ];
  },

  // ─── Performance ──────────────────────────────────────────
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // ─── Bundle analyser (opt-in via env) ────────────────────
  ...(process.env.ANALYZE === 'true'
    ? {
        experimental: {
          // Enable when @next/bundle-analyzer is installed
        },
      }
    : {}),
};

export default nextConfig;