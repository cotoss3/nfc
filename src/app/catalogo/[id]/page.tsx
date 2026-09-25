import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
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

  const shortDesc = `${product.description} Pago único sin mensualidades. Auto-configurable al llegar a tu negocio en Panamá. Envíos a todo el país.`;

  return {
    title: `${product.name} en Panamá | Pago Único Sin Mensualidades`,
    description: shortDesc.slice(0, 160),
    alternates: { canonical: `${BASE_URL}/catalogo/${product.id}` },
    openGraph: {
      title: `${product.name} en Panamá | starTAP`,
      description: shortDesc.slice(0, 160),
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
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.ratingValue || '5.0',
          reviewCount: product.reviewCount || '100',
          bestRating: '5',
          worstRating: '1',
        },
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
    </>
  );
}
