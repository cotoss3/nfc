import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { invalidarCupones, listarCupones, normalizarCodigo, CODIGOS_SISTEMA } from '@/lib/cupones';

/**
 * CRUD de cupones para Master Control.
 *
 * Escribe con la llave service_role: el navegador nunca toca la tabla
 * `coupons` directo, porque con la llave publica cualquiera podria crearse
 * un cupon del 100%.
 */

export const dynamic = 'force-dynamic';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const DEFAULT_ADMINS = ['admin@startap.com.pa', 'cotoss3@gmail.com', 'fbcontrerras@gmail.com', 'fernando@grupotova.com', 'fcontreras@grupotova.com'];
const ADMINS_FROM_ENV = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const ALLOWED_ADMINS = ADMINS_FROM_ENV.length > 0 ? ADMINS_FROM_ENV : DEFAULT_ADMINS;

/** Valida la sesion del admin igual que /api/admin/precio. */
async function autorizar(req: NextRequest): Promise<{ correo: string } | NextResponse> {
  if (!url || !anonKey || !serviceKey) {
    console.error('[CUPONES_API] Faltan variables de Supabase.');
    return NextResponse.json({ success: false, error: 'Servidor sin configurar.' }, { status: 503 });
  }

  const token = req.headers.get('authorization')?.replace(/^bearer\s+/i, '');
  if (!token) {
    return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });
  }

  // Se valida el token contra Supabase, no se confia en lo que diga el cliente.
  const publico = createClient(url, anonKey);
  const { data: userData, error: authError } = await publico.auth.getUser(token);
  const correo = userData?.user?.email?.toLowerCase();

  if (authError || !correo) {
    return NextResponse.json({ success: false, error: 'Sesión inválida.' }, { status: 401 });
  }
  if (!ALLOWED_ADMINS.includes(correo)) {
    console.warn(`[CUPONES_API] Intento de tocar cupones por ${correo}`);
    return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 403 });
  }

  return { correo };
}

export async function GET() {
  try {
    const cupones = await listarCupones();
    return NextResponse.json({ success: true, cupones, sistema: CODIGOS_SISTEMA });
  } catch (e: any) {
    console.error('[CUPONES_API] No se pudieron listar los cupones', e);
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar los cupones.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await autorizar(req);
  if (auth instanceof NextResponse) return auth;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'No se pudo leer el cupón enviado.' }, { status: 400 });
  }

  const code = normalizarCodigo(String(body?.code || ''));
  if (!code) {
    return NextResponse.json({ success: false, error: 'El código no puede ir vacío.' }, { status: 400 });
  }
  if (code.length > 30) {
    return NextResponse.json({ success: false, error: 'El código no puede pasar de 30 caracteres.' }, { status: 400 });
  }

  const type = String(body?.type || '');
  if (!['percent', 'fixed', 'free_shipping'].includes(type)) {
    return NextResponse.json(
      { success: false, error: 'El tipo tiene que ser porcentaje, monto fijo o envío gratis.' },
      { status: 400 }
    );
  }

  let value = Number(body?.value);
  if (type === 'percent') {
    if (!Number.isFinite(value) || value < 1 || value > 100) {
      return NextResponse.json(
        { success: false, error: 'El porcentaje tiene que estar entre 1 y 100.' },
        { status: 400 }
      );
    }
  } else if (type === 'fixed') {
    if (!Number.isFinite(value) || value <= 0) {
      return NextResponse.json(
        { success: false, error: 'El monto del descuento tiene que ser mayor a $0.00.' },
        { status: 400 }
      );
    }
  } else {
    value = 0;
  }

  // Vencimiento opcional. Si viene algo, tiene que ser una fecha entendible.
  let expira_el: string | null = null;
  if (body?.expira_el) {
    const fecha = new Date(String(body.expira_el));
    if (Number.isNaN(fecha.getTime())) {
      return NextResponse.json({ success: false, error: 'La fecha de vencimiento no es válida.' }, { status: 400 });
    }
    expira_el = fecha.toISOString();
  }

  // Limite de usos opcional.
  let usos_maximos: number | null = null;
  if (body?.usos_maximos !== null && body?.usos_maximos !== undefined && String(body.usos_maximos).trim() !== '') {
    const tope = Number(body.usos_maximos);
    if (!Number.isInteger(tope) || tope < 1) {
      return NextResponse.json(
        { success: false, error: 'El límite de usos tiene que ser un número entero mayor a 0.' },
        { status: 400 }
      );
    }
    usos_maximos = tope;
  }

  const fila: Record<string, any> = {
    code,
    type,
    value: Number(value.toFixed(2)),
    description: String(body?.description || '').slice(0, 200),
    is_active: body?.is_active === false ? false : true,
    expira_el,
    usos_maximos,
  };

  const admin = createClient(url!, serviceKey!);
  const { error } = await admin.from('coupons').upsert(fila, { onConflict: 'code' });

  if (error) {
    console.error('[CUPONES_API] Supabase rechazó la escritura del cupón', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo guardar el cupón en el servidor.' },
      { status: 500 }
    );
  }

  invalidarCupones();
  console.info(`[CUPONES_API] ${auth.correo} guardó el cupón ${code}`);

  return NextResponse.json({ success: true, cupon: fila });
}

export async function DELETE(req: NextRequest) {
  const auth = await autorizar(req);
  if (auth instanceof NextResponse) return auth;

  let code = normalizarCodigo(req.nextUrl.searchParams.get('code') || '');
  if (!code) {
    const body = await req.json().catch(() => null);
    code = normalizarCodigo(String(body?.code || ''));
  }

  if (!code) {
    return NextResponse.json({ success: false, error: 'Falta el código del cupón a borrar.' }, { status: 400 });
  }

  // Los 3 del sistema se pueden desactivar, pero no borrar: el codigo los
  // reconstruye igual desde DEFAULT_COUPONS_LIST y volverian a aparecer.
  if (CODIGOS_SISTEMA.includes(code)) {
    return NextResponse.json(
      { success: false, error: 'Ese cupón es del sistema: lo puedes desactivar, pero no borrar.' },
      { status: 400 }
    );
  }

  const admin = createClient(url!, serviceKey!);
  const { error } = await admin.from('coupons').delete().eq('code', code);

  if (error) {
    console.error('[CUPONES_API] Supabase rechazó el borrado del cupón', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo borrar el cupón en el servidor.' },
      { status: 500 }
    );
  }

  invalidarCupones();
  console.info(`[CUPONES_API] ${auth.correo} borró el cupón ${code}`);

  return NextResponse.json({ success: true, code });
}
