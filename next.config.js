/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/shop',
        destination: '/catalogo',
        permanent: true,
      },
      {
        source: '/shop/:path*',
        destination: '/catalogo/:path*',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig
