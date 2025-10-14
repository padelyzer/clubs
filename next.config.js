/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // WARNING: Only set to true if you want to skip ESLint during builds
    // This should be false in production for code quality
    ignoreDuringBuilds: true, // TODO: Re-habilitar después de corregir warnings
  },
  typescript: {
    // WARNING: Only set to true if you want to skip TypeScript checks during builds
    // This should be false in production for type safety
    ignoreBuildErrors: true, // TODO: Re-habilitar después de corregir errores
  },
  serverExternalPackages: ['@prisma/client'],

  // Use standalone output for dynamic applications
  output: 'standalone',
  
  // Add security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig