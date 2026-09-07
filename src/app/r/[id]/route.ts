import { NextRequest, NextResponse } from 'next/server';
import { dbLocal, supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cardId = params.id;
  let targetUrl = '';
  let resolvedCardId = cardId;

  // 1. Intentar consulta en tiempo real desde Supabase si está configurado
  if (supabase) {
    try {
      // Normalizar alias habituales (STT-1 -> STT-1001, 1002 -> STT-1002)
      let clean = cardId.trim().toLowerCase();
      let searchCode = clean;
      const sttMatch = clean.match(/^stt-(\d+)$/i);
      if (sttMatch) {
        const num = parseInt(sttMatch[1], 10);
        if (num < 1000) searchCode = `stt-${1000 + num}`;
      } else {
        const numOnly = parseInt(clean, 10);
        if (!isNaN(numOnly)) searchCode = numOnly < 1000 ? `stt-${1000 + numOnly}` : `stt-${numOnly}`;
      }

      const { data, error } = await supabase
        .from('nfc_cards')
        .select('card_id, target_url')
        .or(`card_id.ilike.${searchCode},activation_code.ilike.${searchCode}`)
        .maybeSingle();

      if (!error && data && data.target_url) {
        targetUrl = data.target_url.trim();
        resolvedCardId = data.card_id;
      }
    } catch (e) {
      console.error('Error consultando Supabase en redirección:', e);
    }
  }

  // 2. Si no se encontró en Supabase o no está configurado, usar motor local/archivo
  if (!targetUrl) {
    const card = dbLocal.getCardById(cardId);
    targetUrl = card?.target_url ? card.target_url.trim() : '';
    resolvedCardId = card?.card_id || cardId;
  }

  // Capturar información de dispositivo mediante User-Agent
  const userAgent = request.headers.get('user-agent') || '';
  let device = 'Desktop (Web)';
  
  if (/iphone|ipad|ipod/i.test(userAgent)) {
    device = 'iPhone (iOS)';
  } else if (/android/i.test(userAgent)) {
    device = 'Android (Mobile)';
  } else if (/mobile/i.test(userAgent)) {
    device = 'Smart Phone';
  }

  // Capturar referer (ej. escaneo NFC vs Código QR manual)
  const urlObj = new URL(request.url);
  const medium = urlObj.searchParams.get('m') || 'NFC Scan'; 
  const referrer = medium === 'qr' ? 'QR Code' : 'NFC Scan';

  // Registrar analíticas de manera asíncrona
  try {
    dbLocal.registerScan(resolvedCardId, device, referrer);
  } catch (err) {
    console.error('Error registrando analítica:', err);
  }

  // Sanitizar cualquier placeholder con "..." o cadena vacía
  if (!targetUrl || targetUrl.includes('...')) {
    targetUrl = 'https://google.com';
  }

  // Sanitizar protocolo http/https
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  try {
    // Redirección DIRECTA E INSTANTÁNEA sin almacenamiento en caché
    return NextResponse.redirect(new URL(targetUrl), {
      status: 307,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0, private',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
  } catch (err) {
    console.error('Error procesando URL de redirección:', err);
    return NextResponse.redirect(new URL('https://google.com'), {
      status: 307,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0, private',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
  }
}
