import type { Metadata } from 'next';
import DistribuidoresClient from './DistribuidoresClient';

const BASE_URL = 'https://startap.com.pa';

export const metadata: Metadata = {
  title: 'Distribuidores de Tarjetas NFC para Reseñas en Panamá | starTAP',
  description:
    'Programa de distribuidores y mayoristas de dispositivos NFC para reseñas en Google Maps. Diseñado para agencias de marketing, imprentas, consultores y empresas de POS en Panamá.',
  keywords: [
    'distribuidores tarjetas nfc panama',
    'mayorista nfc panama',
    'nfc para agencias panama',
    'reventa de dispositivos nfc panama',
    'placas nfc al por mayor panama',
    'resenas google maps distribuidores',
  ],
  alternates: { canonical: `${BASE_URL}/distribuidores` },
  openGraph: {
    title: 'Distribuidores de Tarjetas NFC para Reseñas en Panamá | starTAP',
    description:
      'Programa de distribuidores y mayoristas de dispositivos NFC para reseñas en Google Maps en Panamá.',
    url: `${BASE_URL}/distribuidores`,
    siteName: 'starTAP Panamá',
  },
};

export default function DistribuidoresPage() {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Programa de Distribuidores starTAP Panamá',
    provider: { '@id': `${BASE_URL}/#organization` },
    areaServed: { '@type': 'Country', name: 'Panamá' },
    description:
      'Programa de distribución mayorista de dispositivos físicos NFC y QR para captura de reseñas y SEO local en comercios de Panamá.',
    serviceType: 'Distribución Mayorista B2B de Hardware NFC',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Distribuidores',
        item: `${BASE_URL}/distribuidores`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <DistribuidoresClient />
    </>
  );
}
