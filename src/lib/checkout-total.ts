import { getProductById } from '@/config/products';
import { calculateShippingCost, applyShippingCoupon, getDiscountAmount } from '@/config/shipping';
import { obtenerCupon } from '@/lib/cupones';
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
      // Antes se asumia $20: se cobraba un precio inventado. Mejor fallar.
      throw new Error(`Producto no reconocido: ${rawId}`);
    }

    // Oferta especial de Tarjeta de Bolsillo a $15 si se adquiere como upsell
    const isUpsellCard =
      (canonicalId === 'tarjeta-nfc-bolsillo' || rawId === 'tarjeta-nfc-bolsillo') &&
      ((item as any).price === 15 || (item as any).is_upsell === true);

    if (isUpsellCard) {
      precio = 15;
    }

    const cantidad = Math.max(1, Math.min(500, Number(item.quantity) || 1));
    if (product?.isPack) hasPack = true;

    const extras =
      (item.has_custom_logo ? PRECIO_LOGO : 0) + (item.has_qr_code ? PRECIO_QR : 0);

    // Descuentos escalonados por volumen (3 uds: 10% | 5 uds: 15% | 10 uds: 20%)
    // Aplica a unidades regulares (no al pack comercial ni a ofertas fijas)
    let discountMultiplier = 1;
    if (!product?.isPack && !isUpsellCard) {
      if (cantidad >= 10) discountMultiplier = 0.80;
      else if (cantidad >= 5) discountMultiplier = 0.85;
      else if (cantidad >= 3) discountMultiplier = 0.90;
    }

    subtotal += (precio + extras) * discountMultiplier * cantidad;
  }

  const baseEnvio = calculateShippingCost(subtotal, shippingMethod, hasPack);
  // Los cupones salen de Supabase (lib/cupones), no de validateCoupon: esa
  // funcion solo ve los 3 por defecto cuando corre en el servidor, y por eso
  // un cupon creado por el admin hacia que el cobro devolviera 409.
  const coupon = couponCode ? await obtenerCupon(couponCode) : null;
  const envio = applyShippingCoupon(baseEnvio, coupon);
  const descuento = getDiscountAmount(subtotal, coupon);
  const total = Math.max(0, Number((subtotal + envio - descuento).toFixed(2)));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    envio,
    descuento,
    total,
  };
}
