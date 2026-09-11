import type { Metadata } from 'next';
import { PRODUCTS } from '@/config/products';
import CatalogoClient from './CatalogoClient';

const BASE_URL = 'https://startap.com.pa';

export const metadata: Metadata = {
  title: 'Catálogo de Placas y Tarjetas NFC para Reseñas en Panamá | StarTAP',
  description: 'Dispositivos NFC y QR contactless para capturar valoraciones en Google Maps. Placas desde $30.00, tarjetas desde $20.00 y Pack Trío Comercial. Sin mensualidades ni suscripciones.',
  alternates: {
    canonical: `${BASE_URL}/catalogo`,
  },
  openGraph: {
    title: 'Catálogo de Dispositivos NFC & QR | StarTAP Panamá',
    description: 'Hardware de proximidad para captar reseñas en Google Maps en tu negocio. Pago único sin suscripciones.',
    url: `${BASE_URL}/catalogo`,
    siteName: 'StarTAP Panamá',
    locale: 'es_PA',
    type: 'website',
  },
};

export default function CatalogoPage() {
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Catálogo de Dispositivos NFC & QR StarTAP Panamá',
    url: `${BASE_URL}/catalogo`,
    numberOfItems: PRODUCTS.length,
    itemListElement: PRODUCTS.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          areaServed: { '@type': 'Country', name: 'Panamá' },
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <CatalogoClient />
    </>
  );
}
