import { createRequire } from 'module';
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

const require = createRequire(import.meta.url);

// Setup Cloudflare dev platform for local development
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['drive.google.com'],
  },
};

export default nextConfig;
