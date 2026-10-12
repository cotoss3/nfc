import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xnepnlaoiflngtikozqd.supabase.co';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const ADMINS_FROM_ENV = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(c => c.trim().toLowerCase())
  .filter(Boolean);

const SUPER_ADMINS_DEFAULT = [
  'cotoss3@gmail.com',
  'fbcontrerras@gmail.com',
  'fcontreras@grupotova.com',
  'admin@startap.com.pa',
  'info@startap.com.pa'
];

const ALLOWED_ADMINS = Array.from(new Set([...SUPER_ADMINS_DEFAULT, ...ADMINS_FROM_ENV]));

async function verifyAdmin(request: NextRequest): Promise<{ authorized: boolean; email?: string; error?: string; status?: number }> {
  if (!serviceKey) {
    return { authorized: false, error: 'Configuración del servidor incompleta (falta SUPABASE_SERVICE_ROLE_KEY)', status: 500 };
  }

  const token = request.headers.get('authorization')?.replace(/^bearer\s+/i, '');
  if (!token) {
    return { authorized: false, error: 'Token de autorización requerido', status: 401 };
  }

  if (!url || !anonKey) {
    return { authorized: false, error: 'Configuración de Supabase incompleta', status: 500 };
  }

  const publicClient = createClient(url, anonKey);
  const { data: userData, error: authError } = await publicClient.auth.getUser(token);
  const email = userData?.user?.email?.trim().toLowerCase();

  if (authError || !email) {
    return { authorized: false, error: 'Sesión inválida o expirada', status: 401 };
  }

  if (!ALLOWED_ADMINS.includes(email)) {
    return { authorized: false, error: 'Acceso no autorizado', status: 403 };
  }

  return { authorized: true, email };
}

function getAdminClient() {
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

/**
 * GET /api/admin/cards
 * Retorna la lista de todas las tarjetas y el total de scans para paneles master-control
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status || 401 });
    }

    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Error inicializando cliente admin' }, { status: 500 });
    }

    const [cardsRes, scansRes] = await Promise.all([
      supabaseAdmin.from('nfc_cards').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('scans').select('*', { count: 'exact', head: true })
    ]);

    if (cardsRes.error) {
      console.error('[API_ADMIN_CARDS_GET_ERROR]', cardsRes.error);
      return NextResponse.json({ success: false, error: cardsRes.error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      cards: cardsRes.data || [],
      totalScans: scansRes.count ?? 0
    });
  } catch (err: any) {
    console.error('[API_ADMIN_CARDS_GET_UNCAUGHT]', err);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * POST /api/admin/cards
 * Maneja acciones administrativas sobre nfc_cards: toggle_active, upsert, delete, bulk_upsert
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status || 401 });
    }

    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Error inicializando cliente admin' }, { status: 500 });
    }

    const body = await request.json();
    const { action, card, cards, card_id, is_active } = body;

    if (action === 'toggle_active') {
      if (!card_id || typeof is_active !== 'boolean') {
        return NextResponse.json({ success: false, error: 'card_id e is_active son obligatorios' }, { status: 400 });
      }

      const { error } = await supabaseAdmin
        .from('nfc_cards')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('card_id', String(card_id).trim().toUpperCase());

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: `Estado actualizado a ${is_active}` });
    }

    if (action === 'upsert') {
      if (!card || !card.card_id) {
        return NextResponse.json({ success: false, error: 'card con card_id es obligatorio' }, { status: 400 });
      }

      const cardPayload = {
        ...card,
        card_id: String(card.card_id).trim().toUpperCase(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabaseAdmin
        .from('nfc_cards')
        .upsert([cardPayload]);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: 'Tarjeta guardada exitosamente' });
    }

    if (action === 'bulk_upsert') {
      if (!Array.isArray(cards) || cards.length === 0) {
        return NextResponse.json({ success: false, error: 'cards array es obligatorio' }, { status: 400 });
      }

      const now = new Date().toISOString();
      const payload = cards.map(c => ({
        ...c,
        card_id: String(c.card_id).trim().toUpperCase(),
        updated_at: now
      }));

      const { error } = await supabaseAdmin
        .from('nfc_cards')
        .upsert(payload);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: `${cards.length} tarjetas guardadas exitosamente` });
    }

    if (action === 'delete') {
      if (!card_id) {
        return NextResponse.json({ success: false, error: 'card_id es obligatorio' }, { status: 400 });
      }

      const { error } = await supabaseAdmin
        .from('nfc_cards')
        .delete()
        .eq('card_id', String(card_id).trim().toUpperCase());

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: 'Tarjeta eliminada exitosamente' });
    }

    return NextResponse.json({ success: false, error: `Acción '${action}' no reconocida` }, { status: 400 });
  } catch (err: any) {
    console.error('[API_ADMIN_CARDS_POST_UNCAUGHT]', err);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}
