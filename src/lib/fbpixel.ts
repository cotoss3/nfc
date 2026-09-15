/**
 * Meta Pixel (Facebook) de starTAP.
 *
 * El ID vive en NEXT_PUBLIC_FB_PIXEL_ID para poder apagarlo en desarrollo
 * sin tocar el código. Si la variable no existe, el píxel no se carga y
 * todas las llamadas a track() no hacen nada.
 */

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? '';

type Fbq = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

/** Eventos estándar de Meta que usamos en la tienda */
export type EventoMeta =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase'
  | 'Contact'
  | 'Lead';

export function track(evento: EventoMeta, datos?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !window.fbq || !FB_PIXEL_ID) return;
  try {
    window.fbq('track', evento, datos);
  } catch (e) {
    // Un bloqueador de anuncios no debe romper el checkout.
    console.warn('[FB_PIXEL]', e);
  }
}

/** Convierte los items del carrito al formato que espera Meta */
export function itemsParaMeta(
  items: { product_id: string; product_name?: string; quantity: number; price?: number }[]
) {
  return {
    content_type: 'product',
    content_ids: items.map((i) => i.product_id),
    contents: items.map((i) => ({ id: i.product_id, quantity: i.quantity })),
    num_items: items.reduce((n, i) => n + i.quantity, 0),
  };
}
