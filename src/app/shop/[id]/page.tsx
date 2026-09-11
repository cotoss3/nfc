import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import { PRODUCTS, getProductById as getCentralProductById } from '@/config/products';

const BASE_URL = 'https://startap.com.pa';

export async function generateStaticParams() {
  const params: { id: string }[] = [];
  PRODUCTS.forEach((product) => {
    params.push({ id: product.id });
    if (product.aliases) {
      product.aliases.forEach((alias) => {
        params.push({ id: alias });
      });
    }
  });
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const product = getCentralProductById(params.id);

  if (!product) {
    return {
      title: 'Producto NFC para Reseñas de Google',
      alternates: { canonical: `/shop/${params.id}` },
    };
  }

  const shortDesc =
    product.description.length > 155
      ? product.description.slice(0, 152).trimEnd() + '...'
      : product.description;

  return {
    title: `${product.name} en Panamá`,
    description: shortDesc,
    alternates: { canonical: `/shop/${product.id}` },
    openGraph: {
      title: `${product.name} | starTAP Panamá`,
      description: shortDesc,
      url: `${BASE_URL}/shop/${product.id}`,
      images: product.image ? [`${BASE_URL}${product.image}`] : undefined,
    },
  };
}

export default function Page({ params }: { params: { id: string } }) {
  const product = getCentralProductById(params.id);

  const productSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: (product.images || [product.image]).filter(Boolean).map((i) => `${BASE_URL}${i}`),
        material: product.material,
        brand: { '@type': 'Brand', name: 'starTAP' },
        offers: {
          '@type': 'Offer',
          url: `${BASE_URL}/shop/${product.id}`,
          price: product.price,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          areaServed: { '@type': 'Country', name: 'Panamá' },
          seller: { '@id': `${BASE_URL}/#organization` },
        },
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
      <ProductDetailClient params={params} />
    </>
  );
}
