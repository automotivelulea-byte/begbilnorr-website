/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.blocket.se',
      },
      {
        protocol: 'https',
        hostname: '**.bytbil.com',
      },
      {
        protocol: 'https',
        hostname: '**.schibsted.io',
      },
    ],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:8000',
  },
}

module.exports = nextConfig
