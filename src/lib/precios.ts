import { createClient } from '@supabase/supabase-js';
import { PRODUCTS, getProductById } from '@/config/products';

/**
 * Fuente unica de precios, del lado del servidor.
 *
 * El precio que manda es el de Supabase, que es lo que edita el admin.
 * `config/products.ts` queda solo como respaldo para que la tienda no se
 * caiga si la base no responde.
 *
 * Esto existe porque antes habia dos fuentes: la tienda leia el precio del
 * localStorage del navegador y el checkout cobraba el del codigo. Un producto
 * que la tienda mostraba en $0.50 se cobro en $23.75.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const admin = url && serviceKey ? createClient(url, serviceKey) : null;

/** Precios en memoria. Vercel reusa la instancia entre peticiones cercanas. */
let cache: { precios: Map<string, number>; expira: number } | null = null;
const TTL_MS = 30_000;

async function cargarPrecios(): Promise<Map<string, number>> {
  const ahora = Date.now();
  if (cache && cache.expira > ahora) return cache.precios;

  const precios = new Map<string, number>();
  // Respaldo primero: si Supabase falla, al menos hay catalogo.
  for (const p of PRODUCTS) precios.set(p.id, p.price);

  if (admin) {
    try {
      const { data, error } = await admin.from('products').select('id, price');
      if (error) throw error;
      for (const fila of data ?? []) {
        const precio = Number(fila.price);
        if (Number.isFinite(precio) && precio >= 0) precios.set(String(fila.id), precio);
      }
    } catch (e) {
      // No se cae la tienda por esto, pero tiene que quedar registrado:
      // significa que se esta cobrando con los precios del codigo.
      console.error('[PRECIOS] No se pudo leer Supabase, usando config/products.ts', e);
    }
  } else {
    console.error('[PRECIOS] Supabase no configurado en el servidor.');
  }

  cache = { precios, expira: ahora + TTL_MS };
  return precios;
}

/** Precio vigente de un producto. `undefined` si el id no existe. */
export async function getPrecio(id: string): Promise<number | undefined> {
  const precios = await cargarPrecios();
  const normalizedId = id.trim().toLowerCase();
  if (precios.has(normalizedId)) return precios.get(normalizedId);

  const product = getProductById(normalizedId);
  if (product && precios.has(product.id)) {
    return precios.get(product.id);
  }
  return product?.price;
}

/** Catalogo con el precio vigente, para que la tienda muestre lo que se cobra. */
export async function getCatalogoConPrecios() {
  const precios = await cargarPrecios();
  return PRODUCTS.map((p) => ({
    ...p,
    price: precios.get(p.id) ?? p.price,
    priceFormatted: `$${(precios.get(p.id) ?? p.price).toFixed(2)}`,
  }));
}

/** Invalida la cache tras un cambio de precio en el admin. */
export function invalidarPrecios() {
  cache = null;
}

export { getProductById };
