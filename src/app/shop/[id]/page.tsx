import { permanentRedirect } from 'next/navigation';

/**
 * Ruta legacy. El catálogo vive en /catalogo/[id].
 *
 * `next.config.js` ya redirige /shop/:path* con un 301, así que en producción
 * esta página no se alcanza. Se deja como red de seguridad para que nunca
 * exista una segunda URL del mismo producto con su propio canonical:
 * eso es lo que partía las señales entre /shop y /catalogo.
 *
 * NO borrar la carpeta: `ProductDetailClient.tsx` vive aquí y lo importa
 * /catalogo/[id]/page.tsx.
 */
export default function LegacyShopProductPage({
  params,
}: {
  params: { id: string };
}) {
  permanentRedirect(`/catalogo/${params.id}`);
}
