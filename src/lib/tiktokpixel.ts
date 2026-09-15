/**
 * TikTok Pixel de starTAP Panamá.
 *
 * El ID vive en NEXT_PUBLIC_TIKTOK_PIXEL_ID con fallback al ID configurado por el usuario.
 * Si no está disponible o el usuario tiene adblockers, las llamadas son a prueba de fallos.
 */

export const TIKTOK_PIXEL_ID =
  process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || 'DAKQIS3C77U8PGIBH830';

type Ttq = {
  page: () => void;
  track: (event: string, data?: Record<string, unknown>) => void;
  identify: (data: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    ttq?: Ttq;
    TiktokAnalyticsObject?: string;
  }
}

/** Eventos estándar de TikTok que usamos en la plataforma */
export type EventoTikTok =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'PlaceAnOrder'
  | 'CompletePayment'
  | 'Contact';

export function trackTikTok(evento: EventoTikTok, datos?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !window.ttq || !TIKTOK_PIXEL_ID) return;
  try {
    window.ttq.track(evento, datos);
  } catch (e) {
    console.warn('[TIKTOK_PIXEL]', e);
  }
}

export function pageTikTok(): void {
  if (typeof window === 'undefined' || !window.ttq || !TIKTOK_PIXEL_ID) return;
  try {
    window.ttq.page();
  } catch (e) {
    console.warn('[TIKTOK_PIXEL]', e);
  }
}

/** Convierte los items al formato estándar de TikTok Pixel */
export function itemsParaTikTok(
  items: { product_id: string; product_name?: string; quantity: number; price?: number }[]
) {
  return {
    contents: items.map((i) => ({
      content_id: i.product_id,
      content_type: 'product',
      content_name: i.product_name,
      quantity: i.quantity,
      price: i.price,
    })),
  };
}
