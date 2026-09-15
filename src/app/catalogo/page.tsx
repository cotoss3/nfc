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
  const aggregateProductSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${BASE_URL}/catalogo#collection`,
    name: 'Dispositivos NFC y QR para Reseñas de Google en Panamá',
    description: 'Placas acrílicas de mostrador, tarjetas de bolsillo y stands autoportantes con chip NFC y código QR para capturar reseñas en Google Maps en Panamá.',
    brand: { '@type': 'Brand', name: 'starTAP' },
    category: 'Hardware > Dispositivos NFC',
    image: `${BASE_URL}/images/posicionamiento-seo-google-maps-panama-startap.webp`,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '20.00',
      highPrice: '50.00',
      offerCount: PRODUCTS.length,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${BASE_URL}/#organization` },
      offers: PRODUCTS.map((product) => ({
        '@type': 'Offer',
        name: product.name,
        price: product.price.toFixed(2),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        url: `${BASE_URL}/catalogo/${product.id}`,
        seller: { '@id': `${BASE_URL}/#organization` },
      })),
    },
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Catálogo de Dispositivos NFC & QR starTAP Panamá',
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
        brand: { '@type': 'Brand', name: 'starTAP' },
        offers: {
          '@type': 'Offer',
          price: product.price.toFixed(2),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          url: `${BASE_URL}/catalogo/${product.id}`,
          areaServed: { '@type': 'Country', name: 'Panamá' },
          seller: { '@id': `${BASE_URL}/#organization` },
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateProductSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <CatalogoClient />
    </>
  );
}
