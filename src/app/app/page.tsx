import type { Metadata } from 'next';
import AppProClient from './AppProClient';

export const metadata: Metadata = {
  title: 'Plataforma de Gestión de Reseñas con IA',
  description:
    'Responde reseñas con IA, detecta comentarios negativos al instante y mide tu reputación en Google Maps. Panel de control starTAP para negocios en Panamá.',
  alternates: { canonical: '/app' },
};

export default function Page() {
  return <AppProClient />;
}
