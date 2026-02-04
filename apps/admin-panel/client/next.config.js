/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['your-s3-bucket.s3.amazonaws.com'],
  },
  transpilePackages: ['@rooms-dekho/ui'],
}

module.exports = nextConfig
