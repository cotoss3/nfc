import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { dbLocal } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xnepnlaoiflngtikozqd.supabase.co';
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const supabaseAdmin = url && serviceKey ? createClient(url, serviceKey) : null;

/**
 * GET /api/tarjetas?user_email=cliente@empresa.com
 * O GET /api/tarjetas?card_id=STT-1001
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('user_email')?.trim().toLowerCase();
    const cardId = searchParams.get('card_id')?.trim().toUpperCase();

    if (cardId) {
      if (supabaseAdmin) {
        const { data, error } = await supabaseAdmin
          .from('nfc_cards')
          .select('*')
          .ilike('card_id', cardId)
          .maybeSingle();
        if (!error && data) {
          return NextResponse.json({ success: true, card: data });
        }
      }
      const localCard = dbLocal.getCardById(cardId);
      if (localCard) {
        return NextResponse.json({ success: true, card: localCard });
      }
      return NextResponse.json({ error: 'Tarjeta no encontrada' }, { status: 404 });
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Se requiere el parámetro user_email o card_id' },
        { status: 400 }
      );
    }

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('nfc_cards')
        .select('*')
        .ilike('user_email', userEmail)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return NextResponse.json({ success: true, cards: data });
      }
    }

    const localCards = dbLocal.getCardsByOwner(userEmail);
    return NextResponse.json({ success: true, cards: localCards });
  } catch (err: any) {
    console.error('[API_TARJETAS_GET_ERROR]', err);
    return NextResponse.json({ error: 'Error al consultar tarjetas' }, { status: 500 });
  }
}

/**
 * POST /api/tarjetas
 * Acciones seguras desde el servidor con SUPABASE_SERVICE_ROLE_KEY
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, user_email, card_id, card_ids, data: updateData } = body;

    const cleanEmail = user_email?.trim().toLowerCase();

    // 1. RECLAMAR / VINCULAR DISPOSITIVO
    if (action === 'claim') {
      if (!card_id || !cleanEmail) {
        return NextResponse.json(
          { error: 'card_id y user_email son obligatorios para reclamar' },
          { status: 400 }
        );
      }

      const cleanCode = String(card_id).trim().toUpperCase();
      const groupName = updateData?.group_name?.trim() || 'Principal';
      const customTitle = updateData?.title?.trim() || 'Mi Negocio';

      let existingCard: any = null;
      if (supabaseAdmin) {
        const { data } = await supabaseAdmin
          .from('nfc_cards')
          .select('*')
          .ilike('card_id', cleanCode)
          .maybeSingle();
        existingCard = data;
      }

      if (!existingCard) {
        existingCard = dbLocal.getCardById(cleanCode);
      }

      if (!existingCard) {
        return NextResponse.json(
          { error: `El código "${cleanCode}" no existe en el sistema.` },
          { status: 404 }
        );
      }

      if (existingCard.claimed && existingCard.owner_email && existingCard.owner_email.toLowerCase() !== cleanEmail) {
        return NextResponse.json(
          { error: `El código "${cleanCode}" ya está registrado a otra cuenta.` },
          { status: 409 }
        );
      }

      const payload = {
        claimed: true,
        owner_email: cleanEmail,
        group_name: groupName,
        label: customTitle,
        is_active: true,
        estado: 'configurado',
        updated_at: new Date().toISOString(),
      };

      if (supabaseAdmin) {
        await supabaseAdmin
          .from('nfc_cards')
          .update(payload)
          .ilike('card_id', cleanCode);
      }

      // Sincronizar en dbLocal
      dbLocal.claimCard(cleanCode, cleanEmail, groupName);

      return NextResponse.json({
        success: true,
        message: `¡Dispositivo ${cleanCode} vinculado exitosamente!`,
        card_id: cleanCode,
      });
    }

    // 2. ACTUALIZAR CONFIGURACIÓN DE TARJETA
    if (action === 'update') {
      if (!card_id || !cleanEmail || !updateData) {
        return NextResponse.json(
          { error: 'card_id, user_email y data son requeridos' },
          { status: 400 }
        );
      }

      const cleanCode = String(card_id).trim().toUpperCase();

      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (updateData.title !== undefined) payload.label = String(updateData.title).trim();
      if (updateData.target_url !== undefined) payload.target_url = String(updateData.target_url).trim();
      if (updateData.channels !== undefined) payload.channels = updateData.channels;
      if (updateData.group_name !== undefined) payload.group_name = String(updateData.group_name).trim();
      if (updateData.is_active !== undefined) payload.is_active = Boolean(updateData.is_active);
      if (updateData.notes !== undefined) payload.notes = updateData.notes;

      if (supabaseAdmin) {
        const { error } = await supabaseAdmin
          .from('nfc_cards')
          .update(payload)
          .ilike('card_id', cleanCode)
          .or(`owner_email.ilike.${cleanEmail},owner_id.eq.${cleanEmail}`);

        if (error) {
          console.error('[API_TARJETAS_UPDATE_ERROR]', error);
        }
      }

      const localCards = dbLocal.getCards();
      const idx = localCards.findIndex(c => c.card_id.toUpperCase() === cleanCode);
      if (idx !== -1) {
        localCards[idx] = { ...localCards[idx], ...payload };
        dbLocal.setStorageItem('nfc_cards', localCards);
      }

      return NextResponse.json({ success: true, message: 'Tarjeta actualizada' });
    }

    // 3. ACTUALIZACIÓN MASIVA DE GRUPO
    if (action === 'bulk_group') {
      if (!Array.isArray(card_ids) || card_ids.length === 0 || !cleanEmail) {
        return NextResponse.json(
          { error: 'card_ids (array) y user_email son obligatorios' },
          { status: 400 }
        );
      }

      const groupName = updateData?.group_name?.trim() || 'Principal';
      const cleanIds = card_ids.map((id: string) => String(id).trim().toUpperCase());

      if (supabaseAdmin) {
        await supabaseAdmin
          .from('nfc_cards')
          .update({ group_name: groupName, updated_at: new Date().toISOString() })
          .in('card_id', cleanIds)
          .ilike('user_email', cleanEmail);
      }

      dbLocal.bulkUpdateCardsGroup(cleanIds, groupName, cleanEmail);

      return NextResponse.json({
        success: true,
        message: `Se actualizaron ${cleanIds.length} tarjetas al grupo "${groupName}"`,
      });
    }

    // 4. ACTUALIZACIÓN MASIVA DE ESTADO ACTIVO/INACTIVO
    if (action === 'bulk_active') {
      if (!Array.isArray(card_ids) || card_ids.length === 0 || !cleanEmail || updateData?.is_active === undefined) {
        return NextResponse.json(
          { error: 'card_ids, user_email y is_active son obligatorios' },
          { status: 400 }
        );
      }

      const isActive = Boolean(updateData.is_active);
      const cleanIds = card_ids.map((id: string) => String(id).trim().toUpperCase());

      if (supabaseAdmin) {
        await supabaseAdmin
          .from('nfc_cards')
          .update({ is_active: isActive, updated_at: new Date().toISOString() })
          .in('card_id', cleanIds)
          .ilike('user_email', cleanEmail);
      }

      dbLocal.bulkUpdateCardsActiveStatus(cleanIds, isActive, cleanEmail);

      return NextResponse.json({
        success: true,
        message: `Se ${isActive ? 'activaron' : 'desactivaron'} ${cleanIds.length} tarjetas`,
      });
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 });
  } catch (err: any) {
    console.error('[API_TARJETAS_POST_ERROR]', err);
    return NextResponse.json({ error: 'Error procesando solicitud de tarjetas' }, { status: 500 });
  }
}
