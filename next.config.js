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
      {
        source: '/funciones',
        destination: '/app',
        permanent: true,
      },
      {
        source: '/comparativa',
        destination: '/catalogo',
        permanent: true,
      },
      {
        source: '/catalogo/tarjeta-nfc',
        destination: '/catalogo/tarjeta-nfc-bolsillo',
        permanent: true,
      },
      {
        source: '/catalogo/placa-google',
        destination: '/catalogo/placa-nfc-mostrador',
        permanent: true,
      },
      {
        source: '/catalogo/placa-acrilica-nfc',
        destination: '/catalogo/placa-nfc-mostrador',
        permanent: true,
      },
      {
        source: '/catalogo/NFC_10001',
        destination: '/catalogo/placa-nfc-mostrador',
        permanent: true,
      },
      {
        source: '/catalogo/stand-nfc',
        destination: '/catalogo/stand-nfc-mesa',
        permanent: true,
      },
      {
        source: '/catalogo/NFC10002',
        destination: '/catalogo/stand-nfc-mesa',
        permanent: true,
      },
      {
        source: '/catalogo/pack-trio',
        destination: '/catalogo/pack-trio-comercial',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig

