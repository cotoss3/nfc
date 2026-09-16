import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StructuredData from '@/components/StructuredData';
import MetaPixel from '@/components/MetaPixel';
import TikTokPixel from '@/components/TikTokPixel';
import WhatsAppButton from '@/components/WhatsAppButton';

export const metadata: Metadata = {
  metadataBase: new URL('https://startap.com.pa'),
  title: {
    default: 'Placas y Tarjetas NFC para Reseñas de Google en Panamá | starTAP',
    template: '%s | starTAP Panamá',
  },
  description:
    'Multiplica tus reseñas de Google Maps con tarjetas, stands y placas NFC. Un toque y listo, sin apps ni mensualidades. Envíos a todo Panamá.',
  keywords: [
    'tarjetas nfc panama',
    'placas nfc google panama',
    'placa nfc para reseñas google maps',
    'comprar tarjeta nfc google panama',
    'stand nfc reseñas panama',
    'nfc google reviews panama',
  ],
  alternates: { canonical: '/' },
  verification: {
    google: '1igPIkAizA33F2BubkJ8H7lEqWOh9QHVFAOkvAXdgBc',
    // Verificacion del dominio en el portfolio comercial de Meta.
    // Hace falta para las conversiones agregadas de eventos y para
    // que solo nosotros podamos editar los enlaces del dominio.
    other: {
      'facebook-domain-verification': 'h26bx4dq1m5gmqq8uzzy4j4gq72uz2',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_PA',
    url: 'https://startap.com.pa',
    siteName: 'starTAP Panamá',
    title: 'Placas y Tarjetas NFC para Reseñas de Google en Panamá | starTAP',
    description:
      'Multiplica tus reseñas de Google Maps con un toque. Dispositivos NFC sin mensualidades, con envíos a todo Panamá.',
    // WhatsApp, Facebook y el resto muestran esta imagen al pegar el enlace.
    // Sin ella la vista previa sale solo con texto.
    images: [
      {
        url: '/og/startap-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Stand NFC de starTAP en el mostrador de un café, un cliente acercando el celular',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/logos/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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
        <link rel="apple-touch-icon" sizes="180x180" href="/logos/apple-touch-icon.png" />
      </head>
      <body className="flex flex-col min-h-screen bg-gray-50 text-gray-900 antialiased">
        {/* JSON-LD: va en el body, no en <head>. En el App Router los hijos de
            <head> en el layout raíz no se renderizan de forma fiable, y schema.org
            se lee igual desde el body. */}
        <StructuredData />
        {/* Meta & TikTok Pixels. useSearchParams necesita Suspense o el build estatico falla. */}
        <Suspense fallback={null}>
          <MetaPixel />
          <TikTokPixel />
        </Suspense>
        <CartProvider>
          <Navbar />
          <main className="flex-grow pt-20">
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
