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
  is_active?: boolean;
  created_at?: string;
  /** Fecha de vencimiento en ISO. `null` o ausente = no vence. */
  expira_el?: string | null;
  /** Tope de usos. `null` o ausente = sin tope. */
  usos_maximos?: number | null;
  /** Veces que ya se usó en un pedido. */
  usos?: number;
}

export const DEFAULT_COUPONS_LIST: Coupon[] = [
  {
    code: 'EVG',
    type: 'free_shipping',
    value: 0,
    description: 'Envío gratis en todo Panamá',
    is_active: true,
  },
  {
    code: 'STARTAP10',
    type: 'percent',
    value: 10,
    description: '10% de descuento en tu pedido',
    is_active: true,
  },
  {
    code: 'DESCUENTO5',
    type: 'fixed',
    value: 5,
    description: '$5.00 de descuento en tu pedido',
    is_active: true,
  },
];

/** Catálogo de cupones válidos por defecto. */
export const COUPONS: Record<string, Coupon> = DEFAULT_COUPONS_LIST.reduce((acc, c) => {
  acc[c.code] = c;
  return acc;
}, {} as Record<string, Coupon>);

/**
 * @deprecated Ya no la usa nadie. Solo ve los cupones del localStorage y los
 * 3 por defecto, asi que en el servidor daba un resultado distinto al del
 * cobro (ese era el origen del 409 al pagar con un cupon nuevo).
 * La fuente de verdad es `lib/cupones.ts` / `GET /api/cupones/validar`.
 * Se deja para no romper nada que la importe desde afuera.
 */
export function validateCoupon(code: string): Coupon | null {
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) return null;

  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem('nfc_coupons');
      if (data) {
        const customCoupons: Coupon[] = JSON.parse(data);
        const found = customCoupons.find((c) => (c.code || '').trim().toUpperCase() === cleanCode);
        if (found) {
          if (found.is_active === false) return null;
          return found;
        }
      }
    } catch (e) {
      console.error('Error leyendo cupones personalizados:', e);
    }
  }

  const defaultCoupon = COUPONS[cleanCode] ?? null;
  if (defaultCoupon && defaultCoupon.is_active !== false) {
    return defaultCoupon;
  }
  return null;
}

/**
 * Calcula el monto del descuento aplicado sobre el subtotal según el tipo de cupón.
 */
export function getDiscountAmount(subtotal: number, coupon: Coupon | null): number {
  if (!coupon || coupon.is_active === false) return 0;
  if (coupon.type === 'percent') {
    return Number(((subtotal * coupon.value) / 100).toFixed(2));
  }
  if (coupon.type === 'fixed') {
    return Math.min(subtotal, coupon.value);
  }
  return 0;
}

/**
 * Aplica un cupón al costo de envío y retorna el nuevo costo.
 */
export function applyShippingCoupon(
  shippingCost: number,
  coupon: Coupon | null
): number {
  if (!coupon || coupon.is_active === false) return shippingCost;
  if (coupon.type === 'free_shipping') return 0;
  return shippingCost;
}
