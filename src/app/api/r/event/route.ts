import { NextRequest, NextResponse } from 'next/server';
import { dbLocal, supabase, NfcCard, ScanRecord } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type BehaviorAction = 'read_nfc' | 'read_qr' | 'auto_time' | 'cta_click' | 'ad_click' | 'ad_close';
const VALID_ACTIONS = new Set<BehaviorAction>([
  'read_nfc',
  'read_qr',
  'auto_time',
  'cta_click',
  'ad_click',
  'ad_close',
]);

function resolveBusinessName(card: NfcCard): string {
  const label = (card.label || '').trim();
  const group = (card.group_name || '').trim();
  const owner = (card.owner_name || '').trim();

  const isDefaultLabel =
    !label ||
    label === 'Dispositivo TAP' ||
    /^(Stand NFC|Placa NFC|Placa de Mostrador|Tarjeta NFC|Dispositivo TAP)\b/i.test(label);

  if (!isDefaultLabel) {
    return label;
  }
  if (group && group !== 'General') {
    return group;
  }
  if (owner && owner !== 'Sin Asignar (Stock)' && owner !== 'Cliente TapStar' && owner !== 'admin') {
    return owner;
  }
  return label || card.card_id;
}

export async function POST(req: NextRequest) {
  try {
    const rawText = await req.text();
    if (!rawText) {
      return NextResponse.json({ success: false, error: 'Empty body' }, { status: 400 });
    }

    const body = JSON.parse(rawText);
    const cardId = String(body.cardId || '').trim().toUpperCase();
    const scanId = String(body.scanId || '').trim();
    const scanType = String(body.scanType || 'nfc').trim().toLowerCase() === 'qr' ? 'qr' : 'nfc';
    const action = String(body.action || '').trim() as BehaviorAction;

    if (!cardId || !VALID_ACTIONS.has(action)) {
      return NextResponse.json({ success: false, error: 'Parámetros inválidos' }, { status: 400 });
    }

    // 1. Guardar en motor local si es interacción de comportamiento
    if (action === 'auto_time' || action === 'cta_click' || action === 'ad_click' || action === 'ad_close') {
      dbLocal.registerTapBehaviorEvent(cardId, scanId, action);
    }

    // 2. Persistir en Supabase (tanto en scans.referrer como en site_visits con prefijo revt_)
    if (supabase) {
      const marker = `[${action}]`;
      const nowIso = new Date().toISOString();

      await Promise.allSettled([
        (async () => {
          if (!scanId) return;
          const { data: existing } = await supabase
            .from('scans')
            .select('referrer')
            .eq('id', scanId)
            .maybeSingle();
          if (existing) {
            const currentRef = String(existing.referrer || '');
            if (!currentRef.includes(marker)) {
              await supabase
                .from('scans')
                .update({ referrer: `${currentRef} ${marker}`.trim() })
                .eq('id', scanId);
            }
          }
        })(),
        supabase.from('site_visits').insert({
          id: `revt_c_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          session_id: `revt_${scanId || cardId}`,
          page: `/r-event/${cardId}/${action}`,
          referrer: scanId || cardId,
          device: `${scanType}:${action}`,
          ip: '0.0.0.0',
          country: 'Panamá',
          province: 'Panamá',
          district: 'Panamá',
          created_at: nowIso,
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[TAP_BEHAVIOR_EVENT_ERROR]', err);
    return NextResponse.json({ success: false, error: err.message || 'Error interno' }, { status: 500 });
  }
}

export async function GET() {
  try {
    let cards: NfcCard[] = dbLocal.getCards();
    let scans: ScanRecord[] = dbLocal.getStorageItem<ScanRecord[]>('nfc_scans', []);
    let remoteEventVisits: Array<{
      id?: string;
      session_id: string;
      page: string;
      referrer: string;
      device?: string;
      created_at: string;
    }> = [];

    if (supabase) {
      try {
        const [cardsRes, scansRes, visitsRes] = await Promise.all([
          supabase.from('nfc_cards').select('*').order('created_at', { ascending: false }),
          supabase
            .from('scans')
            .select('id, card_id, referrer, scan_type, device, created_at')
            .order('created_at', { ascending: false })
            .limit(10000),
          supabase
            .from('site_visits')
            .select('id, session_id, page, referrer, device, created_at')
            .like('page', '/r-event/%')
            .order('created_at', { ascending: false })
            .limit(10000),
        ]);

        if (!cardsRes.error && cardsRes.data && cardsRes.data.length > 0) {
          cards = cardsRes.data as NfcCard[];
        }
        if (!scansRes.error && scansRes.data && scansRes.data.length > 0) {
          scans = scansRes.data as ScanRecord[];
        }
        if (!visitsRes.error && visitsRes.data) {
          remoteEventVisits = visitsRes.data;
        }
      } catch (e) {
        console.error('Error consultando Supabase en comportamiento:', e);
      }
    }

    const localBehaviorMap = dbLocal.getTapBehaviorMap();

    // Agrupar lecturas y eventos deduplicados por card_id y scanId
    const perCardReads: Record<
      string,
      {
        allScanIds: Set<string>;
        qrScanIds: Set<string>;
        nfcScanIds: Set<string>;
        lastReadAt: string | null;
        autoTimeSet: Set<string>;
        ctaClickSet: Set<string>;
        adClickSet: Set<string>;
        adCloseSet: Set<string>;
      }
    > = {};

    const ensureBucket = (cid: string) => {
      const key = cid.toUpperCase();
      if (!perCardReads[key]) {
        perCardReads[key] = {
          allScanIds: new Set<string>(),
          qrScanIds: new Set<string>(),
          nfcScanIds: new Set<string>(),
          lastReadAt: null,
          autoTimeSet: new Set<string>(),
          ctaClickSet: new Set<string>(),
          adClickSet: new Set<string>(),
          adCloseSet: new Set<string>(),
        };
      }
      return perCardReads[key];
    };

    const updateLatestTimestamp = (bucket: { lastReadAt: string | null }, ts?: string) => {
      if (!ts) return;
      if (!bucket.lastReadAt || new Date(ts).getTime() > new Date(bucket.lastReadAt).getTime()) {
        bucket.lastReadAt = ts;
      }
    };

    // 1. Procesar filas de scans (locales o de Supabase)
    for (const s of scans) {
      const cid = String(s.card_id || '').trim().toUpperCase();
      if (!cid) continue;
      const bucket = ensureBucket(cid);
      const scanKey = String(s.id || `${cid}_${s.created_at}`).trim();

      bucket.allScanIds.add(scanKey);
      if (s.scan_type === 'qr' || String(s.referrer || '').includes('QR Code')) {
        bucket.qrScanIds.add(scanKey);
      } else {
        bucket.nfcScanIds.add(scanKey);
      }

      updateLatestTimestamp(bucket, s.created_at);

      const ref = String(s.referrer || '');
      if (ref.includes('[auto_time]')) bucket.autoTimeSet.add(scanKey);
      if (ref.includes('[cta_click]')) bucket.ctaClickSet.add(scanKey);
      if (ref.includes('[ad_click]')) bucket.adClickSet.add(scanKey);
      if (ref.includes('[ad_close]')) bucket.adCloseSet.add(scanKey);
    }

    // 2. Procesar eventos en site_visits (/r-event/{CARD_ID}/{ACTION})
    // Ignoramos cualquier fila con prefijo `revt_r_` (generada por prefetches automáticos de servidor)
    for (const v of remoteEventVisits) {
      if (String(v.id || '').startsWith('revt_r_')) continue;
      const parts = String(v.page || '').split('/');
      // ['', 'r-event', CARD_ID, ACTION]
      const cid = (parts[2] || '').trim().toUpperCase();
      const action = (parts[3] || '').trim() as BehaviorAction;
      if (!cid || !VALID_ACTIONS.has(action)) continue;

      const bucket = ensureBucket(cid);
      const scanKey = String(v.referrer || v.session_id || `${cid}_${v.created_at}`)
        .replace(/^revt_/, '')
        .trim();

      bucket.allScanIds.add(scanKey);
      updateLatestTimestamp(bucket, v.created_at);

      const devStr = String(v.device || '').toLowerCase();
      if (action === 'read_qr' || devStr.startsWith('qr:') || devStr.startsWith('qr|')) {
        bucket.qrScanIds.add(scanKey);
        bucket.nfcScanIds.delete(scanKey);
      } else if (action === 'read_nfc' || devStr.startsWith('nfc:') || devStr.startsWith('nfc|')) {
        if (!bucket.qrScanIds.has(scanKey)) {
          bucket.nfcScanIds.add(scanKey);
        }
      } else if (!bucket.qrScanIds.has(scanKey)) {
        // Eventos históricos sin prefijo explícito de canal corresponden por defecto a lectura NFC
        bucket.nfcScanIds.add(scanKey);
      }

      if (action === 'auto_time') bucket.autoTimeSet.add(scanKey);
      if (action === 'cta_click') bucket.ctaClickSet.add(scanKey);
      if (action === 'ad_click') bucket.adClickSet.add(scanKey);
      if (action === 'ad_close') bucket.adCloseSet.add(scanKey);
    }

    // 3. Construir filas de comportamiento para todos los dispositivos
    const items = cards.map((card) => {
      const cid = String(card.card_id || '').trim().toUpperCase();
      const bucket = perCardReads[cid];
      const localCounters = localBehaviorMap[cid];

      const autoTimeCount = Math.max(
        bucket ? bucket.autoTimeSet.size : 0,
        localCounters?.auto_time || 0
      );
      const ctaClickCount = Math.max(
        bucket ? bucket.ctaClickSet.size : 0,
        localCounters?.cta_click || 0
      );
      const adClickCount = Math.max(
        bucket ? bucket.adClickSet.size : 0,
        localCounters?.ad_click || 0
      );
      const adCloseCount = Math.max(
        bucket ? bucket.adCloseSet.size : 0,
        localCounters?.ad_close || 0
      );

      // Asegurar coherencia entre total de lecturas y desglose NFC + QR
      const rawQrReads = bucket ? bucket.qrScanIds.size : 0;
      const rawNfcReads = bucket ? bucket.nfcScanIds.size : 0;
      const minExpectedReads = Math.max(
        bucket ? bucket.allScanIds.size : 0,
        rawQrReads + rawNfcReads,
        autoTimeCount + ctaClickCount
      );
      const qrReads = rawQrReads;
      const nfcReads = Math.max(rawNfcReads, minExpectedReads - qrReads);
      const totalReads = qrReads + nfcReads;

      return {
        card_id: card.card_id,
        activation_code: card.activation_code || card.card_id,
        business_name: resolveBusinessName(card),
        label: card.label || '',
        group_name: card.group_name || 'General',
        owner_name: card.owner_name || '',
        owner_email: card.owner_email || '',
        target_url: card.nfc_target_url || card.target_url || card.qr_target_url || '',
        type: card.type || 'google',
        is_active: Boolean(card.is_active),
        claimed: Boolean(card.claimed),
        total_reads: totalReads,
        nfc_reads: nfcReads,
        qr_reads: qrReads,
        auto_time_count: autoTimeCount,
        cta_click_count: ctaClickCount,
        ad_click_count: adClickCount,
        ad_close_count: adCloseCount,
        last_read_at: bucket?.lastReadAt || localCounters?.updated_at || null,
        created_at: card.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (err: any) {
    console.error('[TAP_BEHAVIOR_GET_ERROR]', err);
    return NextResponse.json({ success: false, error: err.message || 'Error interno' }, { status: 500 });
  }
}
