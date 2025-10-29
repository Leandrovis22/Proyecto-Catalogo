/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true
  },
  reactStrictMode: true,
  images: {
    // Allow images from Google Drive domains or proxied endpoints
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**'
      }
    ]
  }
}

module.exports = nextConfig
