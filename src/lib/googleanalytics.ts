/**
 * Google Analytics 4 (GA4) E-commerce & Physical Sales tracking helper para starTAP Panamá.
 * ID de medición: G-VQH5VW4KF9
 */

export const GA_MEASUREMENT_ID = 'G-VQH5VW4KF9';

export type GAEventName =
  | 'view_item'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'purchase'
  | 'contact'
  | 'regalia_demo'
  | 'scan_startap'
  | 'redirect_complete';

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

/**
 * Registra en GA4 una Venta Física Presencial (cuando total > 0)
 * o un evento separado 'regalia_demo' (cuando total === 0) para no distorsionar el ticket promedio.
 */
export function registrarEventoVentaFisicaGA(params: {
  transactionId: string;
  cardId: string;
  total: number;
  tipoActivacion: 'venta' | 'regalia' | 'prueba';
  paymentType?: string;
  items?: {
    product_id: string;
    product_name?: string;
    quantity: number;
    price?: number;
  }[];
}): void {
  const cleanCardId = (params.cardId || '').trim().toUpperCase();
  const monto = Number(params.total || 0);

  // Filtro estricto de Regalías y Demos ($0): NO disparar 'purchase'
  if (params.tipoActivacion !== 'venta' || monto <= 0) {
    trackGA('regalia_demo', {
      card_id: cleanCardId,
      tipo_activacion: params.tipoActivacion || 'prueba',
    });
    return;
  }

  // Venta Física Pagada (total > 0)
  let defaultProductId = 'placa-nfc-mostrador';
  let defaultProductName = 'Placa NFC para Reseñas de Google';
  if (cleanCardId.startsWith('STTS-')) {
    defaultProductId = 'stand-nfc-mesa';
    defaultProductName = 'Stand NFC de Mesa';
  } else if (cleanCardId.startsWith('STTT-')) {
    defaultProductId = 'tarjeta-nfc-bolsillo';
    defaultProductName = 'Tarjeta NFC de Bolsillo';
  }

  const gaItems =
    params.items && params.items.length > 0
      ? itemsParaGA(params.items)
      : itemsParaGA([
          {
            product_id: defaultProductId,
            product_name: defaultProductName,
            quantity: 1,
            price: monto,
          },
        ]);

  trackGA('purchase', {
    transaction_id: params.transactionId || `PED-VISITA-${cleanCardId.replace(/[^A-Za-z0-9]/g, '')}`,
    value: monto,
    currency: 'USD',
    affiliation: 'Venta Física Presencial',
    payment_type: params.paymentType || 'Efectivo / Yappy Presencial',
    items: gaItems,
  });
}
