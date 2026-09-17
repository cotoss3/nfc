/**
 * Google Analytics 4 (GA4) E-commerce tracking helper para starTAP Panamá.
 * ID de medición: G-VQH5VW4KF9
 */

export const GA_MEASUREMENT_ID = 'G-VQH5VW4KF9';



export type GAEventName =
  | 'view_item'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'purchase'
  | 'contact';

export function trackGA(eventName: GAEventName, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  try {
    window.gtag('event', eventName, params);
  } catch (err) {
    console.warn('[GA4_TRACK_ERROR]', err);
  }
}

/** Formatea los artículos al estándar oficial de GA4 para e-commerce */
export function itemsParaGA(
  items: {
    product_id: string;
    product_name?: string;
    quantity: number;
    price?: number;
    selected_color?: string;
  }[]
) {
  return items.map((item, index) => ({
    item_id: item.product_id,
    item_name: item.product_name || item.product_id,
    currency: 'USD',
    price: item.price || 0,
    quantity: item.quantity,
    item_variant: item.selected_color || 'Standard',
    index,
  }));
}
