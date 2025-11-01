import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Permitir imágenes desde nuestra propia API (R2)
      {
        protocol: 'https',
        hostname: '**.pages.dev', // Tu dominio de Cloudflare Pages
        pathname: '/api/images/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/images/**',
      },
      // Fallback: Google Drive (por si R2 falla)
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        pathname: '/uc',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
