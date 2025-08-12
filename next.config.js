/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    domains: [],
  },
  env: {
    // Custom environment variables
  },
}

module.exports = nextConfig
