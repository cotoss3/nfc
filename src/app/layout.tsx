import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = {
  metadataBase: new URL('https://startap.com.pa'),
  title: {
    default: 'starTAP | Tarjetas NFC para Reseñas de Google en Panamá',
    template: '%s | starTAP Panamá',
  },
  description:
    'Multiplica tus reseñas de Google Maps con tarjetas, stands y placas NFC. Un toque y listo, sin apps ni mensualidades. Envíos a todo Panamá.',
  keywords: [
    'tarjetas NFC Panamá',
    'reseñas de Google Panamá',
    'stand NFC reseñas',
    'placa NFC Google Maps',
    'SEO local Panamá',
  ],
  alternates: { canonical: '/' },
  verification: {
    google: '1igPIkAizA33F2BubkJ8H7lEqWOh9QHVFAOkvAXdgBc',
  },
  openGraph: {
    type: 'website',
    locale: 'es_PA',
    url: 'https://startap.com.pa',
    siteName: 'starTAP',
    title: 'starTAP | Tarjetas NFC para Reseñas de Google en Panamá',
    description:
      'Multiplica tus reseñas de Google Maps con un toque. Dispositivos NFC sin mensualidades, con envíos a todo Panamá.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: {
    icon: '/logos/Favicon.png',
    shortcut: '/logos/Favicon.png',
    apple: '/logos/Favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="google-site-verification" content="1igPIkAizA33F2BubkJ8H7lEqWOh9QHVFAOkvAXdgBc" />
        <StructuredData />
      </head>
      <body className="flex flex-col min-h-screen bg-gray-50 text-gray-900 antialiased">
        <CartProvider>
          <Navbar />
          <main className="flex-grow pt-20">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
