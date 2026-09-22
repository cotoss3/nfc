import { createClient } from '@supabase/supabase-js';
import { DEFAULT_COUPONS_LIST, type Coupon } from '@/config/shipping';

/**
 * Fuente única de cupones, del lado del servidor.
 *
 * Antes los cupones que creaba el admin vivían en el localStorage del
 * navegador: el cliente veía el descuento en pantalla, el servidor no
 * conocía ese cupón, calculaba otro total y el cobro se caía con un 409.
 * Toda campaña con cupón nuevo nacía muerta.
 *
 * Ahora los cupones viven en la tabla `coupons` de Supabase y tanto lo que
 * ve el cliente como lo que se cobra sale de aquí.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const admin = url && serviceKey ? createClient(url, serviceKey) : null;

/** Códigos que vienen con el sistema: se pueden desactivar pero no borrar. */
export const CODIGOS_SISTEMA = DEFAULT_COUPONS_LIST.map((c) => c.code);

/** Cupones en memoria. Vercel reusa la instancia entre peticiones cercanas. */
let cache: { cupones: Map<string, Coupon>; expira: number } | null = null;
const TTL_MS = 30_000;

/** Deja el código en mayúsculas y sin espacios, como se guarda en la base. */
export function normalizarCodigo(code: string): string {
  return (code || '').replace(/\s+/g, '').toUpperCase();
}

function aCupon(fila: any): Coupon {
  return {
    code: normalizarCodigo(String(fila.code || '')),
    type: fila.type,
    value: Number(fila.value) || 0,
    description: String(fila.description || ''),
    is_active: fila.is_active !== false,
    created_at: fila.created_at ?? undefined,
    expira_el: fila.expira_el ?? null,
    usos_maximos: fila.usos_maximos === null || fila.usos_maximos === undefined ? null : Number(fila.usos_maximos),
    usos: Number(fila.usos) || 0,
  };
}

async function cargarCupones(): Promise<Map<string, Coupon>> {
  const ahora = Date.now();
  if (cache && cache.expira > ahora) return cache.cupones;

  const cupones = new Map<string, Coupon>();
  // Respaldo primero: si Supabase falla, al menos quedan los 3 por defecto.
  for (const c of DEFAULT_COUPONS_LIST) {
    cupones.set(normalizarCodigo(c.code), { ...c, expira_el: null, usos_maximos: null, usos: 0 });
  }

  if (admin) {
    try {
      const { data, error } = await admin.from('coupons').select('*');
      if (error) throw error;
      for (const fila of data ?? []) {
        const cupon = aCupon(fila);
        if (cupon.code) cupones.set(cupon.code, cupon);
      }
    } catch (e) {
      // No se cae la tienda por esto, pero tiene que quedar registrado:
      // significa que solo están vivos los cupones del código.
      console.error('[CUPONES] No se pudo leer Supabase, usando los cupones por defecto', e);
    }
  } else {
    console.error('[CUPONES] Supabase no está configurado en el servidor.');
  }

  cache = { cupones, expira: ahora + TTL_MS };
  return cupones;
}

/** Motivo por el que un cupón no se puede usar. `null` si sí se puede. */
export function motivoNoValido(cupon: Coupon | null | undefined): string | null {
  if (!cupon) return 'Ese cupón no existe';
  if (cupon.is_active === false) return 'Ese cupón está desactivado';
  if (cupon.expira_el) {
    const vence = new Date(cupon.expira_el).getTime();
    if (Number.isFinite(vence) && vence < Date.now()) return 'Ese cupón ya venció';
  }
  if (
    cupon.usos_maximos !== null &&
    cupon.usos_maximos !== undefined &&
    Number(cupon.usos || 0) >= Number(cupon.usos_maximos)
  ) {
    return 'Ese cupón llegó a su límite de usos';
  }
  return null;
}

/** Busca un cupón usable. Devuelve `null` si no existe o ya no aplica. */
export async function obtenerCupon(code: string): Promise<Coupon | null> {
  const limpio = normalizarCodigo(code);
  if (!limpio) return null;
  const cupones = await cargarCupones();
  const cupon = cupones.get(limpio) ?? null;
  if (motivoNoValido(cupon)) return null;
  return cupon;
}

/**
 * Igual que `obtenerCupon` pero dice por qué no sirve, para poder mostrarle
 * al cliente un mensaje útil en vez de un "cupón inválido" genérico.
 */
export async function revisarCupon(
  code: string
): Promise<{ valido: boolean; cupon?: Coupon; error?: string }> {
  const limpio = normalizarCodigo(code);
  if (!limpio) return { valido: false, error: 'Escribe un código de cupón' };
  const cupones = await cargarCupones();
  const cupon = cupones.get(limpio) ?? null;
  const motivo = motivoNoValido(cupon);
  if (motivo || !cupon) return { valido: false, error: motivo || 'Ese cupón no existe' };
  return { valido: true, cupon };
}

/** Todos los cupones (activos o no), para el panel de Master Control. */
export async function listarCupones(): Promise<Coupon[]> {
  const cupones = await cargarCupones();
  return Array.from(cupones.values()).sort((a, b) => a.code.localeCompare(b.code));
}

/** Invalida la caché tras crear, editar o borrar un cupón en el admin. */
export function invalidarCupones() {
  cache = null;
}
