import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Placas NFC para Reseñas de Google en Panamá | StarTAP',
  description:
    'Aumenta tus clientes y valoraciones en Google Maps con placas y tarjetas NFC contactless. Envío en Panamá. Sin pagos mensuales ni suscripciones. ¡Compra hoy!',
  alternates: {
    canonical: 'https://startap.com.pa/',
  },
  openGraph: {
    title: 'Placas NFC para Reseñas de Google en Panamá | StarTAP',
    description:
      'Aumenta tus clientes y valoraciones en Google Maps con placas y tarjetas NFC contactless. Envío en Panamá. Sin pagos mensuales ni suscripciones. ¡Compra hoy!',
    url: 'https://startap.com.pa/',
    siteName: 'StarTAP Panamá',
    locale: 'es_PA',
    type: 'website',
  },
};

export default function Page() {
  return <HomeClient />;
}
