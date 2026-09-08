import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Tarjetas NFC para Reseñas de Google en Panamá',
  description:
    'Consigue más reseñas de 5 estrellas en Google Maps con un toque. Tarjetas, stands y placas NFC sin apps ni mensualidades. Envíos a todo Panamá.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'starTAP | Tarjetas NFC para Reseñas de Google en Panamá',
    description:
      'Consigue más reseñas de 5 estrellas en Google Maps con un toque. Sin apps ni mensualidades. Envíos a todo Panamá.',
    url: 'https://startap.com.pa',
  },
};

export default function Page() {
  return <HomeClient />;
}
