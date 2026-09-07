import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'startap | Tarjetas y Placas Inteligentes para Negocios en Panamá',
  description: 'Multiplica tus reseñas en Google Maps, TripAdvisor e Instagram con nuestras placas y tarjetas NFC personalizadas. startap.com.pa',
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
