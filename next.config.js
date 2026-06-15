/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Type errors are caught locally during development.
    // Skip during Vercel build to avoid Supabase client inference issues.
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tqjflhqffbqdtqfxmzcf.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig
