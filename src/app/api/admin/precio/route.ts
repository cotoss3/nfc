import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getProductById } from '@/config/products';
import { invalidarPrecios } from '@/lib/precios';

/**
 * Cambia el precio de un producto. Corre en el servidor con la llave
 * service_role: el navegador nunca escribe precios directamente, porque
 * con la llave publica cualquiera podria ponerlos en cero.
 *
 * Requiere una sesion valida de Supabase (el admin ya inicia sesion) y que
 * el correo este en ADMIN_EMAILS.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMINS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function POST(req: NextRequest) {
  if (!url || !anonKey || !serviceKey) {
    console.error('[ADMIN_PRECIO] Faltan variables de Supabase.');
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
  if (ADMINS.length === 0 || !ADMINS.includes(correo)) {
    console.warn(`[ADMIN_PRECIO] Intento de cambio de precio por ${correo}`);
    return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 403 });
  }

  const { id, precio } = await req.json();

  if (!getProductById(String(id || ''))) {
    return NextResponse.json({ success: false, error: 'Producto no reconocido.' }, { status: 400 });
  }

  const valor = Number(precio);
  if (!Number.isFinite(valor) || valor <= 0 || valor > 10000) {
    return NextResponse.json(
      { success: false, error: 'El precio debe ser un número entre 0.01 y 10000.' },
      { status: 400 }
    );
  }

  const admin = createClient(url, serviceKey);
  const { error } = await admin
    .from('products')
    .update({ price: Number(valor.toFixed(2)) })
    .eq('id', id);

  if (error) {
    console.error('[ADMIN_PRECIO] Supabase rechazó la escritura', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo guardar el precio.' },
      { status: 500 }
    );
  }

  invalidarPrecios();
  console.info(`[ADMIN_PRECIO] ${correo} cambió ${id} a ${valor.toFixed(2)}`);

  return NextResponse.json({ success: true, id, precio: Number(valor.toFixed(2)) });
}
