import { PRODUCTS } from '@/config/products';
import { getCatalogoConPrecios } from '@/lib/precios';

const BASE_URL = 'https://startap.com.pa';

export const dynamic = 'force-dynamic';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const products = await getCatalogoConPrecios();

  const itemsXml = products
    .filter((p) => p.category !== 'test' && p.type !== 'test')
    .map((product) => {
      const isFreeShipping = product.price >= 50 || product.isPack;
      const shippingCost = isFreeShipping ? '0.00 USD' : '3.75 USD';
      const imageUrl = product.image.startsWith('http')
        ? product.image
        : `${BASE_URL}${product.image}`;

      return `    <item>
      <g:id>${escapeXml(product.sku || product.id)}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(product.description)}</g:description>
      <g:link>${BASE_URL}/catalogo/${product.id}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in_stock</g:availability>
      <g:price>${product.price.toFixed(2)} USD</g:price>
      <g:brand>starTAP Panamá</g:brand>
      <g:mpn>${escapeXml(product.mpn || product.sku || product.id)}</g:mpn>
      <g:gtin>${escapeXml(product.gtin13 || '0745301294801')}</g:gtin>
      <g:shipping>
        <g:country>PA</g:country>
        <g:service>Envío Nacional Panamá</g:service>
        <g:price>${shippingCost}</g:price>
      </g:shipping>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>starTAP Panamá - Catálogo Oficial de Dispositivos NFC y QR</title>
    <link>${BASE_URL}</link>
    <description>Dispositivos físicos NFC y códigos QR para reseñas en Google Maps y seguidores en Instagram en Panamá.</description>
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
