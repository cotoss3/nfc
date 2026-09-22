import { Config } from '@/config/site';

/**
 * Meta Pixel (Facebook) de starTAP.
 * El ID proviene del objeto central Config.pixels.facebook.
 */
export const FB_PIXEL_ID = Config.pixels.facebook;

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
