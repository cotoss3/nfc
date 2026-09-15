/**
 * Reglas de envío y pago. Única fuente de verdad.
 * El carrito, el checkout y el cálculo del servidor leen de aquí.
 */

/** Envío gratis a partir de este subtotal (USD) */
export const FREE_SHIPPING_THRESHOLD = 50;

export type ShippingMethodId = 'local' | 'uno' | 'servi';

export interface ShippingMethod {
  id: ShippingMethodId;
  label: string;
  detail: string;
  cost: number;
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'local',
    label: 'Panamá Centro',
    detail: 'Oficina o residencia (1-2 días)',
    cost: 3.75,
  },
  {
    id: 'uno',
    label: 'Uno Express',
    detail: 'Retiro en sucursal del interior',
    cost: 6.5,
  },
  {
    id: 'servi',
    label: 'Servientrega',
    detail: 'A domicilio en provincias',
    cost: 7.5,
  },
];

export function getShippingMethod(id: string): ShippingMethod | undefined {
  return SHIPPING_METHODS.find((m) => m.id === id);
}

/** True cuando el subtotal ya califica para envío gratis */
export function qualifiesForFreeShipping(subtotal: number): boolean {
  return subtotal >= FREE_SHIPPING_THRESHOLD;
}

/** Cuánto falta para el envío gratis (0 si ya califica) */
export function amountMissingForFreeShipping(subtotal: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
}

/**
 * Costo de envío final.
 * Gratis si el subtotal alcanza el umbral o si el pedido incluye un pack.
 */
export function calculateShippingCost(
  subtotal: number,
  methodId: string,
  hasPack = false
): number {
  if (hasPack || qualifiesForFreeShipping(subtotal)) return 0;
  return getShippingMethod(methodId)?.cost ?? SHIPPING_METHODS[0].cost;
}

/** Datos de Yappy que se le muestran al cliente */
export const YAPPY = {
  numero: '6713-4341',
  titular: 'Fernando Contreras',
};

// ---------------------------------------------------------------------------
// SISTEMA DE CUPONES
// ---------------------------------------------------------------------------

export type CouponType = 'free_shipping' | 'percent' | 'fixed';

export interface Coupon {
  code: string;
  type: CouponType;
  /** Para 'percent': 0-100. Para 'fixed': monto en USD. Para 'free_shipping': ignorado. */
  value: number;
  description: string;
}

/** Catálogo de cupones válidos (en mayúsculas para comparación sin distinción de caso). */
export const COUPONS: Record<string, Coupon> = {
  EVG: {
    code: 'EVG',
    type: 'free_shipping',
    value: 0,
    description: 'Envio gratis en todo Panama',
  },
};

/**
 * Valida un codigo de cupon.
 * Retorna el cupon si es valido, o null si no existe.
 */
export function validateCoupon(code: string): Coupon | null {
  return COUPONS[code.trim().toUpperCase()] ?? null;
}

/**
 * Aplica un cupon al costo de envio y retorna el nuevo costo.
 */
export function applyShippingCoupon(
  shippingCost: number,
  coupon: Coupon | null
): number {
  if (!coupon) return shippingCost;
  if (coupon.type === 'free_shipping') return 0;
  if (coupon.type === 'percent') return shippingCost * (1 - coupon.value / 100);
  if (coupon.type === 'fixed') return Math.max(0, shippingCost - coupon.value);
  return shippingCost;
}
