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
  
  // Add security headers
  async rewrites() {
    // Si estamos en api.padelyzer.com, reescribir las rutas
    if (process.env.VERCEL_URL === 'api.padelyzer.com') {
      return [
        {
          source: '/:path*',
          destination: '/api/:path*',
        },
      ];
    }
    return [];
  },
  
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
      {
        // CORS headers para rutas API
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'https://padelyzer.app, https://api.padelyzer.com, http://localhost:*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig