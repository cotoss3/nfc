import { NextRequest, NextResponse } from 'next/server';
import { dbLocal, supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isCardFreeInStock(c: any): boolean {
  const url = (c.target_url || '').trim();
  const isPlaceholderUrl =
    !url ||
    url === 'https://google.com' ||
    url === 'https://www.google.com' ||
    url.includes('...');
  const isNotSold =
    c.tipo_activacion !== 'venta' &&
    c.tipo_activacion !== 'regalia' &&
    c.estado !== 'configurado' &&
    c.estado !== 'asignado' &&
    !c.claimed;
  return (c.is_active === false || isPlaceholderUrl) && isNotSold;
}

function findNextAvailableForPrefix(allCards: any[], cleanPrefix: string): { nextCode: string; freeCount: number; card?: any } {
  const matching = allCards.filter(c => {
    const id = String(c.card_id || '').toUpperCase();
    if (cleanPrefix === 'STT-') {
      return id.startsWith('STT-') && !id.startsWith('STTT-') && !id.startsWith('STTS-');
    }
    return id.startsWith(cleanPrefix);
  });

  const parsed = matching.map(c => {
    const match = String(c.card_id || '').match(/(\d+)$/);
    const num = match ? parseInt(match[1], 10) : 0;
    return { card: c, num };
  }).sort((a, b) => a.num - b.num);

  const freeCards = parsed.filter(item => isCardFreeInStock(item.card));
  if (freeCards.length > 0) {
    return {
      nextCode: freeCards[0].card.card_id,
      freeCount: freeCards.length,
      card: freeCards[0].card,
    };
  }

  const highestNum = parsed.length > 0 ? parsed[parsed.length - 1].num : 999;
  const nextNum = highestNum < 1000 ? 1000 : highestNum + 1;
  return {
    nextCode: `${cleanPrefix}${nextNum}`,
    freeCount: 0,
  };
}

/**
 * GET /api/admin/tags?code=STT-1001
 * O GET /api/admin/tags?action=next_available&prefix=STT-
 * O GET /api/admin/tags?action=list_all
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

  // ACCIÓN: Listar todos los TAGs, métricas de stock libre y conteos de escaneo
  if (action === 'list_all') {
    let allCards: any[] = [];
    let allScans: any[] = [];

    if (supabase) {
      try {
        const [cardsRes, scansRes] = await Promise.all([
          supabase.from('nfc_cards').select('*').order('created_at', { ascending: false }),
          supabase.from('scans').select('card_id, scan_type, created_at')
        ]);
        if (!cardsRes.error && cardsRes.data && cardsRes.data.length > 0) {
          allCards = cardsRes.data;
        }
        if (!scansRes.error && scansRes.data) {
          allScans = scansRes.data;
        }
      } catch (e) {
        console.error('Error listando tags desde Supabase:', e);
      }
    }

    if (allCards.length === 0) {
      allCards = dbLocal.getCards();
    }

    const scanCounts: Record<string, number> = {};
    for (const s of allScans) {
      const cid = String(s.card_id || '').toUpperCase();
      if (cid) scanCounts[cid] = (scanCounts[cid] || 0) + 1;
    }

    const sttInfo = findNextAvailableForPrefix(allCards, 'STT-');
    const stttInfo = findNextAvailableForPrefix(allCards, 'STTT-');
    const sttsInfo = findNextAvailableForPrefix(allCards, 'STTS-');

    // Calcular las 2 siguientes tarjetas STTT- libres para combos
    const stttMatching = allCards
      .filter(c => String(c.card_id || '').toUpperCase().startsWith('STTT-') && isCardFreeInStock(c))
      .sort((a, b) => String(a.card_id).localeCompare(String(b.card_id)));

    const comboCard1 = stttMatching[0]?.card_id || stttInfo.nextCode;
    let comboCard2 = stttMatching[1]?.card_id;
    if (!comboCard2) {
      const m = comboCard1.match(/(\d+)$/);
      const n = m ? parseInt(m[1], 10) + 1 : 1001;
      comboCard2 = `STTT-${n}`;
    }

    const enrichedCards = allCards.map(c => {
      const cid = String(c.card_id || '').toUpperCase();
      const free = isCardFreeInStock(c);
      return {
        ...c,
        is_free_stock: free,
        scan_count: scanCounts[cid] || 0,
      };
    });

    const ventasCount = enrichedCards.filter(c => !c.is_free_stock && c.tipo_activacion === 'venta').length;
    const regaliasCount = enrichedCards.filter(c => !c.is_free_stock && c.tipo_activacion === 'regalia').length;
    const pruebasCount = enrichedCards.filter(c => !c.is_free_stock && c.tipo_activacion !== 'venta' && c.tipo_activacion !== 'regalia').length;

    const statsObj = {
      total_cards: enrichedCards.length,
      active_cards: enrichedCards.filter(c => c.is_active).length,
      ventas_count: ventasCount,
      regalias_count: regaliasCount,
      pruebas_count: pruebasCount,
      free_total: sttInfo.freeCount + stttInfo.freeCount + sttsInfo.freeCount,
      total_scans: allScans.length,
      stt_free: sttInfo.freeCount,
      sttt_free: stttInfo.freeCount,
      stts_free: sttsInfo.freeCount,
      next_stt: sttInfo.nextCode,
      next_sttt: stttInfo.nextCode,
      next_stts: sttsInfo.nextCode,
      combo_sttt_pair: [comboCard1, comboCard2],
    };

    return NextResponse.json({
      success: true,
      cards: enrichedCards,
      scan_counts: scanCounts,
      stats: statsObj,
      summary: statsObj,
    });
  }

  // ACCIÓN: Obtener el siguiente TAG disponible en orden incremental
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

    const info = findNextAvailableForPrefix(allCards, cleanPrefix);

    return NextResponse.json({
      success: true,
      action: info.card ? 'found_inactive' : 'next_sequence',
      next_code: info.nextCode,
      free_count: info.freeCount,
      card: info.card || null,
      message: info.card
        ? `Siguiente TAG libre en stock: ${info.nextCode} (${info.freeCount} disponibles)`
        : `Siguiente código secuencial nuevo: ${info.nextCode}`,
    });
  }

  // CONSULTA NORMAL POR CÓDIGO
  if (!code) {
    return NextResponse.json({ error: 'Parámetro "code" o "prefix" es requerido' }, { status: 400 });
  }

  const clean = code.trim().toLowerCase();
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
        const { count: scansCount } = await supabase
          .from('scans')
          .select('*', { count: 'exact', head: true })
          .ilike('card_id', data.card_id);

        return NextResponse.json({
          success: true,
          source: 'supabase',
          card: data,
          scans_count: scansCount || 0,
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
      scans_count: 0,
      nfc_link: `https://startap.com.pa/r/${card.card_id}?m=nfc`,
      qr_link: `https://startap.com.pa/r/${card.card_id}?m=qr`,
    });
  }

  return NextResponse.json({
    success: false,
    message: `Dispositivo o TAG con código "${searchCode}" no encontrado (puedes guardarlo para crearlo automáticamente)`,
    search_code: searchCode,
  }, { status: 404 });
}

async function configureSingleTag(params: {
  rawCardId: string;
  finalUrl: string;
  label?: string;
  group_name?: string;
  is_active: boolean;
  auto_create: boolean;
  tipo_activacion: 'venta' | 'prueba' | 'regalia';
  precio_venta: number;
  cleanOwnerEmail?: string;
  cleanOwnerName?: string;
  customerPhone?: string;
  channels?: 'both' | 'nfc' | 'qr';
  type?: string;
}) {
  const {
    rawCardId,
    finalUrl,
    label,
    group_name,
    is_active,
    auto_create,
    tipo_activacion,
    precio_venta,
    cleanOwnerEmail,
    cleanOwnerName,
    customerPhone,
    channels = 'both',
    type = 'google',
  } = params;

  const isClientEmail = Boolean(
    cleanOwnerEmail &&
    cleanOwnerEmail !== 'admin@startap.com.pa' &&
    cleanOwnerEmail !== 'info@startap.com.pa'
  );

  let cleanId = rawCardId.trim().toUpperCase();
  const sttMatch = cleanId.match(/^(STTT|STTS|STT)-?(\d+)$/i);
  if (sttMatch) {
    const prefix = sttMatch[1].toUpperCase();
    const num = parseInt(sttMatch[2], 10);
    cleanId = `${prefix}-${num < 1000 ? 1000 + num : num}`;
  } else if (!cleanId.includes('-')) {
    const numOnly = parseInt(cleanId, 10);
    if (!isNaN(numOnly)) cleanId = `STT-${numOnly < 1000 ? 1000 + numOnly : numOnly}`;
  }

  // 1. Guardar localmente en dbLocal
  let existingCard = dbLocal.findCardById(cleanId);

  if (!existingCard && auto_create) {
    existingCard = dbLocal.createAdminCard(cleanId, channels, is_active ?? true, label || `TAG ${cleanId}`);
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
    const cards = dbLocal.getCards();
    const idx = cards.findIndex(c => c.card_id.toLowerCase() === cleanId.toLowerCase());
    if (idx !== -1) {
      cards[idx].tipo_activacion = tipo_activacion as any;
      cards[idx].precio_venta = precio_venta;
      cards[idx].channels = channels;
      cards[idx].type = type;
      if (cleanOwnerEmail) {
        cards[idx].owner_email = cleanOwnerEmail;
        if (isClientEmail) {
          cards[idx].claimed = true;
          cards[idx].estado = finalUrl ? 'configurado' : 'asignado';
        }
      }
      if (cleanOwnerName) cards[idx].owner_name = cleanOwnerName;
      dbLocal.setStorageItem('nfc_cards', cards);
    }
  }

  // 2. Persistir en Supabase
  if (supabase) {
    try {
      const payload: any = {
        target_url: finalUrl,
        nfc_target_url: finalUrl,
        qr_target_url: finalUrl,
        channels,
        type,
      };
      if (label) payload.label = label;
      if (group_name) payload.group_name = group_name;
      if (typeof is_active === 'boolean') payload.is_active = is_active;
      if (tipo_activacion) payload.tipo_activacion = tipo_activacion;
      if (typeof precio_venta === 'number') payload.precio_venta = precio_venta;
      if (cleanOwnerEmail) {
        payload.owner_email = cleanOwnerEmail;
        if (isClientEmail) {
          payload.claimed = true;
          payload.estado = finalUrl ? 'configurado' : 'asignado';
        }
      }
      if (cleanOwnerName) payload.owner_name = cleanOwnerName;

      const { data, error } = await supabase
        .from('nfc_cards')
        .update(payload)
        .eq('card_id', cleanId)
        .select();

      if (error || !data || data.length === 0) {
        if (auto_create) {
          await supabase.from('nfc_cards').insert([{
            card_id: cleanId,
            activation_code: cleanId,
            owner_id: isClientEmail ? 'user-assigned' : 'admin',
            owner_name: cleanOwnerName || (cleanOwnerEmail ? cleanOwnerEmail.split('@')[0] : 'Administrador starTAP'),
            owner_email: cleanOwnerEmail || 'info@startap.com.pa',
            label: label || `TAG ${cleanId}`,
            target_url: finalUrl,
            nfc_target_url: finalUrl,
            qr_target_url: finalUrl,
            group_name: group_name || 'General',
            is_active: is_active ?? true,
            tipo_activacion: tipo_activacion || 'prueba',
            precio_venta: typeof precio_venta === 'number' ? precio_venta : 0,
            channels,
            type,
            claimed: isClientEmail ? true : false,
            estado: isClientEmail ? (finalUrl ? 'configurado' : 'asignado') : 'en_stock',
          }]);
        }
      }
    } catch (err) {
      console.error('Error al guardar en Supabase:', err);
    }
  }

  // 3. Sincronización con Inventario y Pedidos (OMS)
  let orderInfo: any = null;
  const isExplicitVenta = is_active && tipo_activacion === 'venta' && typeof precio_venta === 'number' && precio_venta > 0;
  const isExplicitRegalia = is_active && tipo_activacion === 'regalia';

  if (isExplicitVenta) {
    orderInfo = dbLocal.registrarVentaVisita({
      cardId: cleanId,
      precioVenta: precio_venta,
      customerName: cleanOwnerName,
      customerEmail: cleanOwnerEmail,
      customerPhone,
      label: label || existingCard?.label || `TAG ${cleanId}`,
      targetUrl: finalUrl,
      tipoActivacion: 'venta'
    });
  } else if (isExplicitRegalia) {
    orderInfo = dbLocal.registrarVentaVisita({
      cardId: cleanId,
      precioVenta: 0,
      customerName: cleanOwnerName,
      customerEmail: cleanOwnerEmail,
      customerPhone,
      label: label ? `${label} (Regalía Paquete)` : `Regalía ${cleanId}`,
      targetUrl: finalUrl,
      tipoActivacion: 'regalia'
    });
  }

  return { cleanId, orderInfo };
}

/**
 * POST /api/admin/tags
 * Crea o actualiza rápidamente un TAG individual o un Combo Pack Trío (1 Placa + 2 Tarjetas de Regalía).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      card_id,
      target_url,
      label,
      group_name,
      is_active,
      auto_create = true,
      tipo_activacion = 'prueba',
      precio_venta = 0,
      owner_email,
      owner_name,
      customer_phone,
      channels = 'both',
      type = 'google',
      combo_extra_cards = [],
    } = body;

    if (!card_id) {
      return NextResponse.json({ error: 'El campo "card_id" es obligatorio' }, { status: 400 });
    }

    const cleanOwnerEmail = owner_email ? String(owner_email).trim().toLowerCase() : undefined;
    const cleanOwnerName = owner_name ? String(owner_name).trim() : undefined;
    const cleanPhone = customer_phone ? String(customer_phone).trim() : undefined;

    const updatedTargetUrl = (target_url || '').trim();
    let finalUrl = updatedTargetUrl;
    if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    // 1. Configurar el TAG principal
    const mainRes = await configureSingleTag({
      rawCardId: card_id,
      finalUrl,
      label,
      group_name,
      is_active: is_active ?? true,
      auto_create,
      tipo_activacion,
      precio_venta: typeof precio_venta === 'number' ? precio_venta : 0,
      cleanOwnerEmail,
      cleanOwnerName,
      customerPhone: cleanPhone,
      channels,
      type,
    });

    // 2. Si es un Combo Pack (ej. 1 Placa $50 + 2 Tarjetas de Regalía $0), configurar las tarjetas adicionales automáticamente
    const configuredExtras: string[] = [];
    if (Array.isArray(combo_extra_cards) && combo_extra_cards.length > 0) {
      for (const extraCode of combo_extra_cards) {
        if (!extraCode || !String(extraCode).trim()) continue;
        const extraRes = await configureSingleTag({
          rawCardId: String(extraCode).trim(),
          finalUrl,
          label: label ? `${label} (Tarjeta Paquete)` : `Tarjeta Combo ${extraCode}`,
          group_name,
          is_active: is_active ?? true,
          auto_create: true,
          tipo_activacion: 'regalia',
          precio_venta: 0,
          cleanOwnerEmail,
          cleanOwnerName,
          customerPhone: cleanPhone,
          channels,
          type,
        });
        configuredExtras.push(extraRes.cleanId);
      }
    }

    const comboMsg = configuredExtras.length > 0
      ? ` + ${configuredExtras.length} tarjeta(s) de regalía (${configuredExtras.join(', ')})`
      : '';

    return NextResponse.json({
      success: true,
      card_id: mainRes.cleanId,
      combo_extras: configuredExtras,
      target_url: finalUrl,
      tipo_activacion,
      precio_venta,
      order_id: mainRes.orderInfo?.order?.id,
      order: mainRes.orderInfo?.order || null,
      nfc_link: `https://startap.com.pa/r/${mainRes.cleanId}?m=nfc`,
      qr_link: `https://startap.com.pa/r/${mainRes.cleanId}?m=qr`,
      message: `TAG ${mainRes.cleanId}${comboMsg} guardado exitosamente` + (mainRes.orderInfo?.order ? ` y asentado en ventas (#${mainRes.orderInfo.order.id})` : ''),
    });
  } catch (err: any) {
    console.error('Error en POST /api/admin/tags:', err);
    return NextResponse.json({ error: 'Error procesando la solicitud', details: err.message }, { status: 500 });
  }
}
