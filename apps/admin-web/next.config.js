/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/ui'],
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
    ];
  },

  // Redirect all non-admin routes
  async redirects() {
    return [
      {
        source: '/',
        destination: '/admin/login',
        permanent: false,
      },
    ];
  },
  
  // Hide build info
  poweredByHeader: false,
  
  // Environment variables
  env: {
    ADMIN_API_URL: process.env.ADMIN_API_URL || 'http://localhost:5001/api/admin',
  },
};

module.exports = nextConfig;