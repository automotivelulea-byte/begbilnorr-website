/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  output: isGithubPages ? 'export' : 'standalone',
  basePath: isGithubPages ? '/begbilnorr-website' : '',
  assetPrefix: isGithubPages ? '/begbilnorr-website/' : '',
  trailingSlash: true,
  images: {
    unoptimized: isGithubPages,
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
      {
        protocol: 'https',
        hostname: '**.blocketcdn.se',
      },
    ],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_BASE_PATH: isGithubPages ? '/begbilnorr-website' : '',
  },
}

module.exports = nextConfig
