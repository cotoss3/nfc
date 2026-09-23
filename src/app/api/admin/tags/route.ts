import { NextRequest, NextResponse } from 'next/server';
import { dbLocal, supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/admin/tags?code=STT-1001
 * Consulta rápida de un TAG por su código de activación o ID de tarjeta.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Parámetro "code" es requerido' }, { status: 400 });
  }

  let clean = code.trim().toLowerCase();
  let searchCode = clean;

  const sttMatch = clean.match(/^stt-(\d+)$/i);
  if (sttMatch) {
    const num = parseInt(sttMatch[1], 10);
    if (num < 1000) searchCode = `stt-${1000 + num}`;
  } else {
    const numOnly = parseInt(clean, 10);
    if (!isNaN(numOnly)) searchCode = numOnly < 1000 ? `stt-${1000 + numOnly}` : `stt-${numOnly}`;
  }

  // 1. Buscar en Supabase si está disponible
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('nfc_cards')
        .select('*')
        .or(`card_id.ilike.${searchCode},activation_code.ilike.${searchCode}`)
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json({
          success: true,
          source: 'supabase',
          card: data,
          nfc_link: `https://startap.com.pa/r/${data.card_id}?m=nfc`,
          qr_link: `https://startap.com.pa/r/${data.card_id}?m=qr`,
        });
      }
    } catch (err) {
      console.error('Error buscando tag en Supabase:', err);
    }
  }

  // 2. Buscar en almacenamiento local (dbLocal)
  const card = dbLocal.findCardById(searchCode);
  if (card) {
    return NextResponse.json({
      success: true,
      source: 'local',
      card,
      nfc_link: `https://startap.com.pa/r/${card.card_id}?m=nfc`,
      qr_link: `https://startap.com.pa/r/${card.card_id}?m=qr`,
    });
  }

  return NextResponse.json({
    success: false,
    message: `Dispositivo o TAG con código "${searchCode}" no encontrado`,
    search_code: searchCode,
  }, { status: 404 });
}

/**
 * POST /api/admin/tags
 * Crea o actualiza rápidamente la URL de destino de un TAG.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { card_id, target_url, label, group_name, is_active, auto_create } = body;

    if (!card_id) {
      return NextResponse.json({ error: 'El campo "card_id" es obligatorio' }, { status: 400 });
    }

    let cleanId = card_id.trim().toUpperCase();
    if (!cleanId.startsWith('STT-')) {
      const numOnly = parseInt(cleanId, 10);
      if (!isNaN(numOnly)) cleanId = `STT-${numOnly < 1000 ? 1000 + numOnly : numOnly}`;
    }

    const updatedTargetUrl = (target_url || '').trim();
    let finalUrl = updatedTargetUrl;
    if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    // 1. Guardar localmente a través del motor dbLocal
    let existingCard = dbLocal.findCardById(cleanId);

    if (!existingCard && auto_create) {
      existingCard = dbLocal.createAdminCard(cleanId, 'both', is_active ?? true, label || `TAG ${cleanId}`);
    }

    if (existingCard) {
      dbLocal.updateCardRedirect(
        cleanId, 
        finalUrl, 
        finalUrl, 
        label || existingCard.label || `TAG ${cleanId}`, 
        group_name || existingCard.group_name || 'General'
      );
      if (typeof is_active === 'boolean') {
        dbLocal.toggleCardActive(cleanId, is_active);
      }
    }

    // 2. Persistir en Supabase si está disponible
    if (supabase) {
      try {
        const payload: any = {
          target_url: finalUrl,
          nfc_target_url: finalUrl,
          qr_target_url: finalUrl,
        };
        if (label) payload.label = label;
        if (group_name) payload.group_name = group_name;
        if (typeof is_active === 'boolean') payload.is_active = is_active;

        const { data, error } = await supabase
          .from('nfc_cards')
          .update(payload)
          .eq('card_id', cleanId)
          .select();

        if (error || !data || data.length === 0) {
          // Si no existía en Supabase y se especificó auto_create
          if (auto_create) {
            await supabase.from('nfc_cards').insert([{
              card_id: cleanId,
              activation_code: cleanId,
              owner_id: 'admin',
              owner_name: 'Administrador starTAP',
              owner_email: 'info@startap.com.pa',
              label: label || `TAG ${cleanId}`,
              target_url: finalUrl,
              nfc_target_url: finalUrl,
              qr_target_url: finalUrl,
              group_name: group_name || 'General',
              is_active: is_active ?? true,
              channels: 'both',
              type: 'google',
              claimed: true,
            }]);
          }
        }
      } catch (err) {
        console.error('Error al guardar en Supabase:', err);
      }
    }

    return NextResponse.json({
      success: true,
      card_id: cleanId,
      target_url: finalUrl,
      nfc_link: `https://startap.com.pa/r/${cleanId}?m=nfc`,
      qr_link: `https://startap.com.pa/r/${cleanId}?m=qr`,
      message: `TAG ${cleanId} actualizado exitosamente`,
    });
  } catch (err: any) {
    console.error('Error en POST /api/admin/tags:', err);
    return NextResponse.json({ error: 'Error procesando la solicitud', details: err.message }, { status: 500 });
  }
}
