import { NextRequest, NextResponse } from 'next/server';
import { dbLocal, supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cardId = params.id;
  const urlObj = new URL(request.url);
  const medium = (urlObj.searchParams.get('m') || 'nfc').toLowerCase(); 
  const isQr = medium === 'qr';

  let nfcTargetUrl = '';
  let qrTargetUrl = '';
  let legacyTargetUrl = '';
  let groupName = 'General';
  let cardLabel = 'Dispositivo TAP';
  let resolvedCardId = cardId;

  let isActive = true;
  let allowedChannels: 'both' | 'nfc' | 'qr' = 'both';

  // 1. Intentar consulta en tiempo real desde Supabase si está configurado
  if (supabase) {
    try {
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
        .select('card_id, target_url, nfc_target_url, qr_target_url, group_name, label, is_active, channels')
        .or(`card_id.ilike.${searchCode},activation_code.ilike.${searchCode}`)
        .maybeSingle();

      if (!error && data) {
        nfcTargetUrl = data.nfc_target_url ? data.nfc_target_url.trim() : '';
        qrTargetUrl = data.qr_target_url ? data.qr_target_url.trim() : '';
        legacyTargetUrl = data.target_url ? data.target_url.trim() : '';
        groupName = data.group_name || 'General';
        cardLabel = data.label || 'Dispositivo TAP';
        resolvedCardId = data.card_id;
        if (data.is_active !== undefined) isActive = data.is_active;
        if (data.channels) allowedChannels = data.channels;
      }
    } catch (e) {
      console.error('Error consultando Supabase en redirección:', e);
    }
  }

  // 2. Si no se encontró en Supabase o no está configurado, usar motor local
  const card = dbLocal.getCardById(cardId);
  if (card) {
    if (!nfcTargetUrl && !qrTargetUrl && !legacyTargetUrl) {
      nfcTargetUrl = card.nfc_target_url ? card.nfc_target_url.trim() : '';
      qrTargetUrl = card.qr_target_url ? card.qr_target_url.trim() : '';
      legacyTargetUrl = card.target_url ? card.target_url.trim() : '';
      groupName = card.group_name || 'General';
      cardLabel = card.label || 'Dispositivo TAP';
      resolvedCardId = card.card_id || cardId;
    }
    isActive = card.is_active;
    if (card.channels) allowedChannels = card.channels;
  }

  // 3. BLOQUEO: Si la ID no está activa habilitada por el Administrador
  if (!isActive) {
    return new NextResponse(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dispositivo Inactivo | starTAP Panamá</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-slate-950 text-white min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          <div class="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto text-3xl">
            🚫
          </div>
          <div>
            <span class="inline-block px-3 py-1 bg-slate-800 text-rose-400 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
              DISPOSITIVO INACTIVO
            </span>
            <h1 class="text-2xl font-bold text-slate-100">${resolvedCardId}</h1>
            <p class="text-slate-400 text-sm mt-2">
              Este ID de dispositivo está inactivo. El administrador debe habilitar este código desde el Panel Administrativo para permitir la redirección.
            </p>
          </div>
          <div class="bg-slate-950/60 p-4 rounded-xl text-xs text-slate-400 border border-slate-800 text-left space-y-1">
            <p class="font-semibold text-slate-300">🔒 Control Exclusivo de Administrador</p>
            <p>Sólo el administrador del sistema puede activar nuevos códigos o rehabilitar dispositivos suspendidos.</p>
          </div>
        </div>
      </body>
      </html>
    `, {
      status: 403,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }

  // 4. BLOQUEO CANAL: Si el medio de escaneo no está habilitado por el Administrador
  if (isQr && allowedChannels === 'nfc') {
    return new NextResponse(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Canal no habilitado | starTAP Panamá</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-slate-950 text-white min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          <div class="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto text-3xl">
            ⚠️
          </div>
          <div>
            <span class="inline-block px-3 py-1 bg-slate-800 text-amber-400 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
              CANAL QR DESHABILITADO
            </span>
            <h1 class="text-2xl font-bold text-slate-100">${resolvedCardId}</h1>
            <p class="text-slate-400 text-sm mt-2">
              Este dispositivo fue configurado por el administrador para uso exclusivo mediante <strong class="text-amber-400">Chip NFC</strong>.
            </p>
          </div>
        </div>
      </body>
      </html>
    `, {
      status: 403,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }

  if (!isQr && allowedChannels === 'qr') {
    return new NextResponse(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Canal no habilitado | starTAP Panamá</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-slate-950 text-white min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          <div class="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto text-3xl">
            ⚠️
          </div>
          <div>
            <span class="inline-block px-3 py-1 bg-slate-800 text-amber-400 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
              CANAL NFC DESHABILITADO
            </span>
            <h1 class="text-2xl font-bold text-slate-100">${resolvedCardId}</h1>
            <p class="text-slate-400 text-sm mt-2">
              Este dispositivo fue configurado por el administrador para uso exclusivo mediante <strong class="text-amber-400">Código QR</strong>.
            </p>
          </div>
        </div>
      </body>
      </html>
    `, {
      status: 403,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
    });
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

  const scanType: 'nfc' | 'qr' = isQr ? 'qr' : 'nfc';
  const referrer = isQr ? 'QR Code' : 'NFC Scan';

  // Registrar analítica de escaneo
  try {
    dbLocal.registerScan(resolvedCardId, device, referrer, scanType, groupName);
  } catch (err) {
    console.error('Error registrando analítica:', err);
  }

  // Determinar URL de destino según el medio utilizado
  let selectedUrl = isQr 
    ? qrTargetUrl 
    : (nfcTargetUrl || legacyTargetUrl);

  // Si se escaneó por QR pero la URL de QR está en blanco (o viceversa)
  if (!selectedUrl || selectedUrl.includes('...')) {
    const channelName = isQr ? 'Código QR' : 'Chip NFC';
    
    return new NextResponse(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Enlace no configurado | starTAP Panamá</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-slate-950 text-white min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          <div class="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto text-2xl">
            ⚠️
          </div>
          <div>
            <span class="inline-block px-3 py-1 bg-slate-800 text-slate-400 text-xs font-semibold rounded-full mb-3 uppercase tracking-wider">
              ${resolvedCardId} • ${groupName}
            </span>
            <h1 class="text-2xl font-bold text-slate-100">${cardLabel}</h1>
            <p class="text-slate-400 text-sm mt-2">
              Este dispositivo no tiene un enlace asignado para escaneo mediante <strong class="text-amber-400 font-semibold">${channelName}</strong>.
            </p>
          </div>
          <div class="bg-slate-950/60 p-4 rounded-xl text-xs text-slate-400 border border-slate-800 text-left space-y-1">
            <p class="font-semibold text-slate-300">💡 ¿Eres el administrador?</p>
            <p>Puedes configurar y cambiar este enlace en cualquier momento desde tu panel de control.</p>
          </div>
          <a href="/dashboard" class="block w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-amber-500/20">
            Ir al Dashboard de Administración
          </a>
        </div>
      </body>
      </html>
    `, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    });
  }

  // Sanitizar protocolo http/https
  if (!selectedUrl.startsWith('http://') && !selectedUrl.startsWith('https://')) {
    selectedUrl = `https://${selectedUrl}`;
  }

  try {
    return NextResponse.redirect(new URL(selectedUrl), {
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

