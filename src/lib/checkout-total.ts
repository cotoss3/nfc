import { getProductById } from '@/config/products';
import { calculateShippingCost } from '@/config/shipping';

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
 * Recalcula el total en el servidor a partir del catalogo.
 * El monto que manda el navegador NO se usa para cobrar: solo se compara.
 *
 * Con el SDK esto importa mas que con la pagina alojada: el `amount` de
 * Tilopay.Init() sale del navegador, asi que el servidor tiene que ser el
 * que diga cuanto vale el pedido y despues confirmar contra /consult.
 */
export function calcularTotal(items: ItemEntrada[], shippingMethod: string) {
  let subtotal = 0;
  let hasPack = false;

  for (const item of items) {
    const product = getProductById(String(item.product_id || ''));
    if (!product) {
      throw new Error(`Producto no reconocido en el pedido: ${item.product_id}`);
    }

    const cantidad = Math.max(1, Math.min(500, Number(item.quantity) || 1));
    if (product.isPack) hasPack = true;

    const extras =
      (item.has_custom_logo ? PRECIO_LOGO : 0) + (item.has_qr_code ? PRECIO_QR : 0);

    subtotal += (product.price + extras) * cantidad;
  }

  const envio = calculateShippingCost(subtotal, shippingMethod, hasPack);
  return { subtotal, envio, total: Number((subtotal + envio).toFixed(2)) };
}
