/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  transpilePackages: ['@sample/ui', '@sample/tokens'],
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig


