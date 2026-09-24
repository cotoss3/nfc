import { NextRequest, NextResponse } from 'next/server';
import { dbLocal, supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/admin/tags?code=STT-1001
 * O GET /api/admin/tags?action=next_available&prefix=STT-
 *
 * Busca un TAG por código o devuelve el SIGUIENTE TAG DISPONIBLE en orden incremental (inactivo o nuevo).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const prefixParam = searchParams.get('prefix');
  const code = searchParams.get('code');

  // ACCIÓN: Sincronizar ventas y pruebas retroactivas en el reporte de órdenes (OMS)
  if (action === 'sync_sales') {
    const res = await dbLocal.sincronizarVentasRetroactivas();
    return NextResponse.json({
      success: true,
      message: `Sincronizadas ${res.sincronizadas} ventas/activaciones en el reporte de órdenes`,
      sincronizadas: res.sincronizadas
    });
  }

  // ACCIÓN: Obtener el siguiente TAG disponible en orden incremental (1000, 1001, 1002...)
  if (action === 'next_available' && prefixParam) {
    const rawPrefix = prefixParam.trim().toUpperCase();
    const cleanPrefix = rawPrefix.endsWith('-') ? rawPrefix : `${rawPrefix}-`;

    let allCards: any[] = [];
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('nfc_cards')
          .select('*')
          .ilike('card_id', `${cleanPrefix}%`);
        if (!error && data) allCards = data;
      } catch (e) {
        console.error('Error obteniendo tags de Supabase:', e);
      }
    }

    if (allCards.length === 0) {
      allCards = dbLocal.getCards().filter(c => c.card_id.toUpperCase().startsWith(cleanPrefix));
    }

    // Ordenar numéricamente por el sufijo
    const parsedCards = allCards.map(c => {
      const match = c.card_id.match(/(\d+)$/);
      const num = match ? parseInt(match[1], 10) : 0;
      return { card: c, num };
    }).sort((a, b) => a.num - b.num);

    // 1. Buscar si hay algún TAG existente INACTIVO o no configurado en orden ascendente
    const inactiveCard = parsedCards.find(item => item.card.is_active === false || !item.card.target_url || item.card.target_url.includes('google.com'));
    
    if (inactiveCard) {
      return NextResponse.json({
        success: true,
        action: 'found_inactive',
        next_code: inactiveCard.card.card_id,
        card: inactiveCard.card,
        message: `Siguiente TAG inactivo localizado: ${inactiveCard.card.card_id}`,
      });
    }

    // 2. Si todos están activos, calcular el siguiente número incremental secuencial N + 1
    const highestNum = parsedCards.length > 0 ? parsedCards[parsedCards.length - 1].num : 999;
    const nextNum = highestNum < 1000 ? 1000 : highestNum + 1;
    const nextCode = `${cleanPrefix}${nextNum}`;

    return NextResponse.json({
      success: true,
      action: 'next_sequence',
      next_code: nextCode,
      message: `Siguiente código secuencial disponible: ${nextCode}`,
    });
  }

  // CONSULTA NORMAL POR CÓDIGO
  if (!code) {
    return NextResponse.json({ error: 'Parámetro "code" o "prefix" es requerido' }, { status: 400 });
  }

  let clean = code.trim().toLowerCase();
  let searchCode = clean;

  const sttMatch = clean.match(/^(sttt|stts|stt)-?(\d+)$/i);
  if (sttMatch) {
    const prefix = sttMatch[1].toUpperCase();
    const num = parseInt(sttMatch[2], 10);
    searchCode = `${prefix}-${num < 1000 ? 1000 + num : num}`;
  } else {
    const numOnly = parseInt(clean, 10);
    if (!isNaN(numOnly)) searchCode = `STT-${numOnly < 1000 ? 1000 + numOnly : numOnly}`;
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
    const { card_id, target_url, label, group_name, is_active, auto_create, tipo_activacion, precio_venta } = body;

    if (!card_id) {
      return NextResponse.json({ error: 'El campo "card_id" es obligatorio' }, { status: 400 });
    }

    let cleanId = card_id.trim().toUpperCase();
    const sttMatch = cleanId.match(/^(STTT|STTS|STT)-?(\d+)$/i);
    if (sttMatch) {
      const prefix = sttMatch[1].toUpperCase();
      const num = parseInt(sttMatch[2], 10);
      cleanId = `${prefix}-${num < 1000 ? 1000 + num : num}`;
    } else if (!cleanId.includes('-')) {
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
      if (tipo_activacion) {
        existingCard.tipo_activacion = tipo_activacion as 'venta' | 'prueba';
      }
      if (typeof precio_venta === 'number') {
        existingCard.precio_venta = precio_venta;
      }
      // Re-guardar estado actualizado en storage local
      const cards = dbLocal.getCards();
      const idx = cards.findIndex(c => c.card_id.toLowerCase() === cleanId.toLowerCase());
      if (idx !== -1) {
        if (tipo_activacion) cards[idx].tipo_activacion = tipo_activacion as 'venta' | 'prueba';
        if (typeof precio_venta === 'number') cards[idx].precio_venta = precio_venta;
        dbLocal.setStorageItem('nfc_cards', cards);
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
        if (tipo_activacion) payload.tipo_activacion = tipo_activacion;
        if (typeof precio_venta === 'number') payload.precio_venta = precio_venta;

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
              tipo_activacion: tipo_activacion || 'prueba',
              precio_venta: typeof precio_venta === 'number' ? precio_venta : 0,
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

    // 3. Sincronización Automática con Inventario y Reporte de Ventas (OMS)
    let orderInfo: any = null;
    if (is_active) {
      orderInfo = dbLocal.registrarVentaVisita({
        cardId: cleanId,
        precioVenta: typeof precio_venta === 'number' ? precio_venta : (tipo_activacion === 'venta' ? 35 : 0),
        label: label || existingCard?.label || `TAG ${cleanId}`,
        targetUrl: finalUrl,
        tipoActivacion: (tipo_activacion as 'venta' | 'prueba') || (precio_venta && precio_venta > 0 ? 'venta' : 'prueba')
      });
    }

    return NextResponse.json({
      success: true,
      card_id: cleanId,
      target_url: finalUrl,
      tipo_activacion: tipo_activacion || existingCard?.tipo_activacion || 'prueba',
      precio_venta: typeof precio_venta === 'number' ? precio_venta : existingCard?.precio_venta || 0,
      order_id: orderInfo?.order?.id,
      nfc_link: `https://startap.com.pa/r/${cleanId}?m=nfc`,
      qr_link: `https://startap.com.pa/r/${cleanId}?m=qr`,
      message: `TAG ${cleanId} actualizado exitosamente` + (orderInfo?.order ? ` y asentado en ventas (#${orderInfo.order.id})` : ''),
    });
  } catch (err: any) {
    console.error('Error en POST /api/admin/tags:', err);
    return NextResponse.json({ error: 'Error procesando la solicitud', details: err.message }, { status: 500 });
  }
}
