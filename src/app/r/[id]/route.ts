import { NextRequest, NextResponse } from 'next/server';
import { dbLocal, supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Escapa valores antes de meterlos en el HTML que se devuelve.
 * El id viene de la URL sin sanitizar: sin esto se podia inyectar marcado.
 */
function escaparHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

  let isActive = false;
  let allowedChannels: 'both' | 'nfc' | 'qr' = 'both';
  let cardFoundInSupabase = false;

  // 1. Intentar consulta en tiempo real desde Supabase si está configurado
  if (supabase) {
    try {
      let clean = cardId.trim().toLowerCase();
      let searchCode = clean;
      const prefixMatch = clean.match(/^(sttt|stts|stt)-?(\d+)$/i);
      if (prefixMatch) {
        const prefix = prefixMatch[1].toLowerCase();
        const num = parseInt(prefixMatch[2], 10);
        const paddedNum = num < 1000 ? 1000 + num : num;
        searchCode = `${prefix}-${paddedNum}`;
      } else {
        const numOnly = parseInt(clean, 10);
        if (!isNaN(numOnly)) {
          const paddedNum = numOnly < 1000 ? 1000 + numOnly : numOnly;
          searchCode = `stt-${paddedNum}`;
        }
      }

      const { data, error } = await supabase
        .from('nfc_cards')
        .select('card_id, target_url, nfc_target_url, qr_target_url, group_name, label, is_active, channels')
        .or(`card_id.ilike.${searchCode},activation_code.ilike.${searchCode},card_id.ilike.${clean}`)
        .maybeSingle();

      if (!error && data) {
        cardFoundInSupabase = true;
        nfcTargetUrl = data.nfc_target_url ? data.nfc_target_url.trim() : '';
        qrTargetUrl = data.qr_target_url ? data.qr_target_url.trim() : '';
        legacyTargetUrl = data.target_url ? data.target_url.trim() : '';
        groupName = data.group_name || 'General';
        cardLabel = data.label || 'Dispositivo TAP';
        resolvedCardId = data.card_id;
        isActive = data.is_active === true;
        if (data.channels) allowedChannels = data.channels;
      }
    } catch (e) {
      console.error('Error consultando Supabase en redirección:', e);
    }
  }

  // 2. Si no se encontró en Supabase o no está configurado, usar motor local
  if (!cardFoundInSupabase) {
    const card = dbLocal.findCardById(cardId);
    if (card) {
      nfcTargetUrl = card.nfc_target_url ? card.nfc_target_url.trim() : '';
      qrTargetUrl = card.qr_target_url ? card.qr_target_url.trim() : '';
      legacyTargetUrl = card.target_url ? card.target_url.trim() : '';
      groupName = card.group_name || 'General';
      cardLabel = card.label || 'Dispositivo TAP';
      resolvedCardId = card.card_id || cardId;
      isActive = card.is_active === true;
      if (card.channels) allowedChannels = card.channels;
    } else {
      isActive = false;
    }
  }

  // 3. BLOQUEO: Si la ID no está activa habilitada por el Administrador
  if (!isActive) {
    return new NextResponse(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="robots" content="noindex, nofollow">
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
            <h1 class="text-2xl font-bold text-slate-100">${escaparHtml(resolvedCardId)}</h1>
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
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow'
      }
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
        <meta name="robots" content="noindex, nofollow">
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
            <h1 class="text-2xl font-bold text-slate-100">${escaparHtml(resolvedCardId)}</h1>
            <p class="text-slate-400 text-sm mt-2">
              Este dispositivo fue configurado por el administrador para uso exclusivo mediante <strong class="text-amber-400">Chip NFC</strong>.
            </p>
          </div>
        </div>
      </body>
      </html>
    `, {
      status: 403,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow'
      }
    });
  }

  if (!isQr && allowedChannels === 'qr') {
    return new NextResponse(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="robots" content="noindex, nofollow">
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
            <h1 class="text-2xl font-bold text-slate-100">${escaparHtml(resolvedCardId)}</h1>
            <p class="text-slate-400 text-sm mt-2">
              Este dispositivo fue configurado por el administrador para uso exclusivo mediante <strong class="text-amber-400">Código QR</strong>.
            </p>
          </div>
        </div>
      </body>
      </html>
    `, {
      status: 403,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow'
      }
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

  // 5. Persistencia segura en Supabase y dbLocal (sin condición de carrera de 250ms)
  try {
    dbLocal.registerScan(resolvedCardId, device, referrer, scanType, groupName);
    if (supabase) {
      await supabase.from('scans').insert({
        id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        card_id: resolvedCardId,
        device,
        referrer,
        scan_type: scanType,
        group_name: groupName
      });
    }
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
        <meta name="robots" content="noindex, nofollow">
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
              ${escaparHtml(resolvedCardId)} • ${escaparHtml(groupName)}
            </span>
            <h1 class="text-2xl font-bold text-slate-100">${escaparHtml(cardLabel)}</h1>
            <p class="text-slate-400 text-sm mt-2">
              Este dispositivo no tiene un enlace asignado para escaneo mediante <strong class="text-amber-400 font-semibold">${escaparHtml(channelName)}</strong>.
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
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'X-Robots-Tag': 'noindex, nofollow'
      }
    });
  }

  // Sanitizar protocolo http/https
  if (!selectedUrl.startsWith('http://') && !selectedUrl.startsWith('https://')) {
    selectedUrl = `https://${selectedUrl}`;
  }

  // Validar URL final; si falla, usar fallback seguro
  let safeTargetUrl = selectedUrl;
  try {
    safeTargetUrl = new URL(selectedUrl).toString();
  } catch {
    safeTargetUrl = 'https://google.com';
  }

  const displayCommerceName =
    cardLabel && cardLabel !== 'Dispositivo TAP'
      ? cardLabel
      : groupName && groupName !== 'General'
      ? groupName
      : cardLabel || resolvedCardId;

  const safeCardIdJson = JSON.stringify(resolvedCardId);
  const safeGroupNameJson = JSON.stringify(groupName);
  const safeScanTypeJson = JSON.stringify(scanType);
  const safeDeviceJson = JSON.stringify(device);
  const safeTargetUrlJson = JSON.stringify(safeTargetUrl);

  // 6. Pantalla Puente de 2 Segundos (Diseño Oscuro starTAP Panamá + Ad Slot + Anti-Rebote GA4 + SEO Noindex)
  return new NextResponse(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Redirigiendo a ${escaparHtml(displayCommerceName)} | starTAP Panamá</title>
  <!-- Google Analytics 4 (G-VQH5VW4KF9) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-VQH5VW4KF9"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-VQH5VW4KF9', { send_page_view: true });

    // Evento 1 (Segundo 0): Escaneo inicial starTAP
    gtag('event', 'scan_startap', {
      card_id: ${safeCardIdJson},
      group_name: ${safeGroupNameJson},
      scan_type: ${safeScanTypeJson},
      device: ${safeDeviceJson}
    });
  </script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: radial-gradient(circle at 50% 0%, #1e293b 0%, #020617 70%);
      color: #f8fafc;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 24px 16px;
      overflow-x: hidden;
    }
    .bridge-card {
      width: 100%;
      max-width: 420px;
      margin: auto;
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(245, 158, 11, 0.22);
      border-radius: 28px;
      padding: 28px 22px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(245, 158, 11, 0.08);
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .status-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .verified-seal {
      width: 46px;
      height: 46px;
      border-radius: 16px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34d399;
      font-size: 22px;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 999px;
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fbbf24;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .status-title {
      font-size: 16px;
      line-height: 1.45;
      color: #cbd5e1;
      font-weight: 500;
    }
    .status-title strong {
      color: #ffffff;
      font-weight: 800;
      display: block;
      font-size: 22px;
      margin-top: 4px;
      letter-spacing: -0.01em;
    }
    /* Espacio Publicitario Preparado (Ad Slot) */
    .ad-slot {
      position: relative;
      background: linear-gradient(145deg, rgba(30, 41, 59, 0.85), rgba(2, 6, 23, 0.95));
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: 20px;
      padding: 20px 18px;
      text-align: left;
      overflow: hidden;
    }
    .ad-slot-tag {
      display: inline-block;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #fbbf24;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.25);
      padding: 3px 9px;
      border-radius: 6px;
      margin-bottom: 12px;
    }
    .ad-slot-body {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .ad-slot-icon {
      width: 46px;
      height: 46px;
      border-radius: 14px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #020617;
      font-weight: 900;
      font-size: 19px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 8px 18px rgba(245, 158, 11, 0.25);
    }
    .ad-slot-copy h3 {
      font-size: 15px;
      font-weight: 800;
      color: #f8fafc;
      margin-bottom: 4px;
    }
    .ad-slot-copy p {
      font-size: 13px;
      color: #cbd5e1;
      line-height: 1.4;
    }
    .skip-btn {
      width: 100%;
      padding: 15px 18px;
      border-radius: 14px;
      border: none;
      background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
      color: #020617;
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.02em;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.45);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
    }
    .skip-btn:active {
      transform: scale(0.98);
    }
    .brand-footer {
      margin-top: 16px;
      text-align: center;
    }
    .brand-footer a {
      color: #64748b;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
      transition: color 0.2s ease;
    }
    .brand-footer a:hover {
      color: #fbbf24;
    }
  </style>
</head>
<body>
  <div></div>

  <main class="bridge-card">
    <!-- 1. Encabezado de Estado (Sello fijo sin movimiento distractor) -->
    <div class="status-header">
      <div class="verified-seal" aria-hidden="true">✓</div>
      <span class="status-badge">Conexión Verificada • ${escaparHtml(resolvedCardId)}</span>
      <p class="status-title">
        Estás siendo dirigido a
        <strong>${escaparHtml(displayCommerceName)}</strong>
      </p>
    </div>

    <!-- 2. Espacio Publicitario Preparado (Ad Slot) -->
    <section id="startap-ad-slot" class="ad-slot" aria-label="Espacio patrocinado starTAP">
      <span class="ad-slot-tag">Verificación Oficial • Espacio Destacado</span>
      <div class="ad-slot-body">
        <div class="ad-slot-icon">★</div>
        <div class="ad-slot-copy">
          <h3>starTAP Panamá • Tap &amp; Connect</h3>
          <p>Dispositivo inteligente verificado. Impulsa tus reseñas de Google, redes y catálogo digital al instante.</p>
        </div>
      </div>
    </section>

    <!-- 3. Botón de Continuar Inmediato -->
    <button type="button" id="skip-btn" class="skip-btn">
      <span>Continuar ahora →</span>
    </button>
  </main>

  <!-- 4. Pie de marca -->
  <footer class="brand-footer">
    <a href="/" target="_blank" rel="noopener noreferrer">
      Tecnología sin contacto por starTAP Panamá
    </a>
  </footer>

  <script>
    (function() {
      var targetUrl = ${safeTargetUrlJson};
      var hasRedirected = false;
      var skipBtn = document.getElementById('skip-btn');

      function executeRedirect(method) {
        if (hasRedirected) return;
        hasRedirected = true;

        try {
          if (typeof gtag === 'function') {
            // Evento 2: Sesión con interacción (Anti-Rebote GA4) con beacon
            gtag('event', 'redirect_complete', {
              card_id: ${safeCardIdJson},
              group_name: ${safeGroupNameJson},
              method: method,
              engagement_time_msec: 6000,
              transport_type: 'beacon'
            });
          }
        } catch (e) {}

        window.location.replace(targetUrl);
      }

      if (skipBtn) {
        skipBtn.addEventListener('click', function() {
          executeRedirect('skip_button');
        });
      }

      // Redirección silenciosa a los 6 segundos sin barras ni contadores que distraigan la lectura
      setTimeout(function() {
        executeRedirect('auto_6s');
      }, 6000);
    })();
  </script>
</body>
</html>`, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0, private',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow'
    }
  });
}


