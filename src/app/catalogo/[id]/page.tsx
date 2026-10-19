import type { Metadata } from 'next';
import { aggregateRatingDeProducto, reviewsSchemaDeProducto } from '@/config/testimonios';
import { permanentRedirect } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import Testimonios from '@/components/Testimonios';
import { PRODUCTS, getProductById as getCentralProductById } from '@/config/products';
import { getLandingCopy } from '@/lib/landings';

const BASE_URL = 'https://startap.com.pa';

export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({ id: product.id }));
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const product = getCentralProductById(params.id);

  if (!product) {
    return {
      title: 'Dispositivo NFC para Reseñas de Google en Panamá',
      alternates: { canonical: `${BASE_URL}/catalogo/${params.id}` },
    };
  }

  const PRODUCT_SEO_OVERRIDES: Record<string, { title: string; description: string }> = {
    'placa-nfc-mostrador': {
      title: 'Placa NFC para Reseñas Google Panamá | $35 starTAP',
      description: 'Placa acrílica de mostrador con chip NFC y QR. Consigue reseñas de Google en tu caja o recepción. Pago único de $35. Envío a todo Panamá.',
    },
    'tarjeta-nfc-bolsillo': {
      title: 'Tarjeta NFC de Reseñas en Panamá | $20 starTAP',
      description: 'Tarjeta de PVC con chip NFC y QR para pedir reseñas de Google al instante. Pago único de $20 sin mensualidad. Envío a todo Panamá.',
    },
    'stand-nfc-mesa': {
      title: 'Stand NFC para Reseñas Google Panamá | $30 starTAP',
      description: 'Stand autoportante con NFC y QR para mesas y mostradores. Tus clientes califican en Google con 1 toque. $30 pago único. Envío a todo Panamá.',
    },
    'pack-trio-comercial': {
      title: 'Pack Trío NFC Reseñas Panamá | $50 Envío Gratis',
      description: 'Incluye 1 Placa de mostrador y 2 Tarjetas de bolsillo NFC + QR. Ahorra $25. Pago único de $50 con envío gratis a todo Panamá.',
    },
    'placa-nfc-instagram': {
      title: 'Placa NFC para Instagram Panamá | $35 starTAP',
      description: 'Placa acrílica de mostrador con chip NFC y QR para Instagram. Consigue seguidores reales al instante en tu local. Pago único de $35. Envío a todo Panamá.',
    },
    'tarjeta-nfc-instagram': {
      title: 'Tarjeta NFC para Instagram Panamá | $20 starTAP',
      description: 'Tarjeta de PVC con chip NFC y QR para conseguir seguidores de Instagram en eventos y entregas. Pago único de $20 sin mensualidad. Envío a todo Panamá.',
    },
    'stand-nfc-instagram': {
      title: 'Stand NFC para Instagram Panamá | $30 starTAP',
      description: 'Stand autoportante con NFC y QR para mesas y mostradores. Tus clientes te siguen en Instagram con 1 toque. $30 pago único. Envíos a todo Panamá.',
    },
  };

  const override = PRODUCT_SEO_OVERRIDES[product.id];
  const metaTitle = override ? override.title : `${product.name} en Panamá | $${product.price} starTAP`.slice(0, 60);
  const metaDesc = override ? override.description : `${product.description} Pago único sin mensualidades. Envíos a todo Panamá.`.slice(0, 155);

  return {
    title: metaTitle,
    description: metaDesc,
    alternates: { canonical: `${BASE_URL}/catalogo/${product.id}` },
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      url: `${BASE_URL}/catalogo/${product.id}`,
      siteName: 'starTAP Panamá',
      images: product.image ? [`${BASE_URL}${product.image}`] : undefined,
      type: 'website',
    },
    // Meta (Facebook/Instagram) Catalog Product Tags
    other: {
      'product:price:amount': product.price.toFixed(2),
      'product:price:currency': 'USD',
      'product:availability': 'in stock',
      'product:condition': 'new',
      'product:retailer_item_id': product.sku || `STP-${product.id.toUpperCase()}`,
    },
  };
}

export default function Page({ params }: { params: { id: string } }) {
  const product = getCentralProductById(params.id);

  if (product && product.id !== params.id) {
    permanentRedirect(`/catalogo/${product.id}`);
  }

  const landingCopy = product ? getLandingCopy(product.id) : undefined;

  const productSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `${BASE_URL}/catalogo/${product.id}#product`,
        name: product.name,
        description: product.description,
        image: (product.images || [product.image])
          .filter(Boolean)
          .map((i) => (i.startsWith('http') ? i : `${BASE_URL}${i}`)),
        material: product.material,
        brand: { '@type': 'Brand', name: 'starTAP Panamá' },
        sku: product.sku || `STP-${product.id.toUpperCase()}`,
        mpn: product.mpn || `STP-${product.id.toUpperCase()}`,
        gtin13: product.gtin13 || '0745301294801',
        // Solo se emite si hay testimonios publicados CON calificación real.
        ...(aggregateRatingDeProducto(product.id)
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ...aggregateRatingDeProducto(product.id)!,
              },
              review: reviewsSchemaDeProducto(product.id),
            }
          : {}),
        offers: {
          '@type': 'Offer',
          url: `${BASE_URL}/catalogo/${product.id}`,
          price: product.price.toFixed(2),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
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
      }
    : null;

  const breadcrumbSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Catálogo', item: `${BASE_URL}/catalogo` },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.name,
            item: `${BASE_URL}/catalogo/${product.id}`,
          },
        ],
      }
    : null;

  const faqSchema =
    landingCopy && landingCopy.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: landingCopy.faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }
      : null;

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <ProductDetailClient params={params} initialProduct={product || null} />
      {product && (
        <Testimonios
          productId={product.id}
          titulo="Lo que dicen quienes lo compraron"
        />
      )}
    </>
  );
}
