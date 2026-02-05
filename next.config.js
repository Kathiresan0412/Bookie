/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API routes configuration
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  // Environment variables that should be available on the client
  env: {
    PORT: process.env.PORT || '3000',
  },
}

module.exports = nextConfig
