import { getProductById } from '@/config/products';
import { calculateShippingCost, validateCoupon, applyShippingCoupon } from '@/config/shipping';
import { getPrecio } from '@/lib/precios';

/** Extras que el cliente puede anadir en la landing de producto */
export const PRECIO_LOGO = 5;
export const PRECIO_QR = 3;

export interface ItemEntrada {
  product_id?: string;
  quantity?: number;
  has_custom_logo?: boolean;
  has_qr_code?: boolean;
}

/**
 * Calcula el total a cobrar. El precio sale de Supabase (lo que edita el
 * admin y lo que ve el cliente), no del navegador ni de una copia aparte.
 */
export async function calcularTotal(
  items: ItemEntrada[],
  shippingMethod: string,
  couponCode?: string
) {
  let subtotal = 0;
  let hasPack = false;

  for (const item of items) {
    const rawId = String(item.product_id || '');
    const product = getProductById(rawId);
    const canonicalId = product?.id || rawId;

    let precio = await getPrecio(canonicalId);
    if (precio === undefined && product) {
      precio = product.price;
    }
    if (precio === undefined && typeof (item as any).price === 'number') {
      precio = (item as any).price;
    }
    if (precio === undefined) {
      precio = 20;
    }

    const cantidad = Math.max(1, Math.min(500, Number(item.quantity) || 1));
    if (product?.isPack) hasPack = true;

    const extras =
      (item.has_custom_logo ? PRECIO_LOGO : 0) + (item.has_qr_code ? PRECIO_QR : 0);

    subtotal += (precio + extras) * cantidad;
  }

  const baseEnvio = calculateShippingCost(subtotal, shippingMethod, hasPack);
  const coupon = couponCode ? validateCoupon(couponCode) : null;
  const envio = applyShippingCoupon(baseEnvio, coupon);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    envio,
    total: Number((subtotal + envio).toFixed(2)),
  };
}
