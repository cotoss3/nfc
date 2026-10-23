import type { Metadata } from 'next';
import { PRODUCTS } from '@/config/products';
import { getCatalogoConPrecios } from '@/lib/precios';
import CatalogoClient from './CatalogoClient';

const BASE_URL = 'https://startap.com.pa';

export const metadata: Metadata = {
  title: 'Dispositivos NFC y QR Reseñas Panamá | Desde $20 starTAP',
  description: 'Placas, stands y tarjetas NFC para conseguir reseñas en Google Maps. Desde $20 pago único sin mensualidades. Envío gratis desde $50 a todo Panamá.',
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

export default async function CatalogoPage() {
  const products = await getCatalogoConPrecios();

  const aggregateProductSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${BASE_URL}/catalogo#collection`,
    name: 'Dispositivos NFC y QR para Reseñas de Google en Panamá',
    description: 'Placas acrílicas de mostrador, tarjetas de bolsillo y stands autoportantes con chip NFC y código QR para capturar reseñas en Google Maps en Panamá.',
    brand: { '@type': 'Brand', name: 'starTAP Panamá' },
    sku: 'STP-NFC-CATALOGO',
    mpn: 'STP-NFC-ALL',
    category: 'Hardware > Dispositivos NFC',
    image: `${BASE_URL}/images/posicionamiento-seo-google-maps-panama-startap.webp`,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '20.00',
      highPrice: '50.00',
      offerCount: products.length,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${BASE_URL}/#organization` },
      offers: products.map((product) => ({
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
            value: (product.price >= 50 || product.isPack) ? '0.00' : '3.75',
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
              value: (product.price >= 50 || product.isPack) ? '0.00' : '3.75',
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
        name: 'Catálogo de Dispositivos NFC',
        item: `${BASE_URL}/catalogo`,
      },
    ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CatalogoClient initialProducts={products} />
    </>
  );
}
