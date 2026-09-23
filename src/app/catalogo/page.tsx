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
    brand: { '@type': 'Brand', name: 'starTAP Panamá' },
    sku: 'STP-NFC-CATALOGO',
    mpn: 'STP-NFC-ALL',
    gtin13: '0745301294801',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.95',
      reviewCount: '618',
      bestRating: '5',
      worstRating: '1',
    },
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
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'PA',
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 90,
          returnMethod: 'https://schema.org/ReturnByMail',
          returnFees: 'https://schema.org/FreeReturn',
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: product.price >= 50 ? '0.00' : '3.50',
            currency: 'USD',
          },
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'PA',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 0,
              maxValue: 1,
              unitCode: 'DAY',
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 1,
              maxValue: 3,
              unitCode: 'DAY',
            },
          },
        },
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
        brand: { '@type': 'Brand', name: 'starTAP Panamá' },
        sku: product.sku || `STP-${product.id.toUpperCase()}`,
        mpn: product.mpn || `STP-${product.id.toUpperCase()}`,
        gtin13: product.gtin13 || '0745301294801',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.ratingValue || '4.9',
          reviewCount: product.reviewCount || '100',
          bestRating: '5',
          worstRating: '1',
        },
        offers: {
          '@type': 'Offer',
          price: product.price.toFixed(2),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          url: `${BASE_URL}/catalogo/${product.id}`,
          areaServed: { '@type': 'Country', name: 'Panamá' },
          seller: { '@id': `${BASE_URL}/#organization` },
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: 'PA',
            returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
            merchantReturnDays: 90,
            returnMethod: 'https://schema.org/ReturnByMail',
            returnFees: 'https://schema.org/FreeReturn',
          },
          shippingDetails: {
            '@type': 'OfferShippingDetails',
            shippingRate: {
              '@type': 'MonetaryAmount',
              value: product.price >= 50 ? '0.00' : '3.50',
              currency: 'USD',
            },
            shippingDestination: {
              '@type': 'DefinedRegion',
              addressCountry: 'PA',
            },
            deliveryTime: {
              '@type': 'ShippingDeliveryTime',
              handlingTime: {
                '@type': 'QuantitativeValue',
                minValue: 0,
                maxValue: 1,
                unitCode: 'DAY',
              },
              transitTime: {
                '@type': 'QuantitativeValue',
                minValue: 1,
                maxValue: 3,
                unitCode: 'DAY',
              },
            },
          },
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
