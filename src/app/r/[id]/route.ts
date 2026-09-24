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
      <body class="bg-slate-50 text-slate-900 min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-xl space-y-6">
          <div class="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto text-3xl">
            🚫
          </div>
          <div>
            <span class="inline-block px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
              DISPOSITIVO INACTIVO
            </span>
            <h1 class="text-2xl font-black text-slate-900">${escaparHtml(resolvedCardId)}</h1>
            <p class="text-slate-600 text-sm mt-2">
              Este ID de dispositivo está inactivo. El administrador debe habilitar este código desde el Panel Administrativo para permitir la redirección.
            </p>
          </div>
          <div class="bg-slate-50 p-4 rounded-xl text-xs text-slate-600 border border-slate-200 text-left space-y-1">
            <p class="font-bold text-slate-800">🔒 Control Exclusivo de Administrador</p>
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
      <body class="bg-slate-50 text-slate-900 min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-xl space-y-6">
          <div class="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-3xl">
            ⚠️
          </div>
          <div>
            <span class="inline-block px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
              CANAL QR DESHABILITADO
            </span>
            <h1 class="text-2xl font-black text-slate-900">${escaparHtml(resolvedCardId)}</h1>
            <p class="text-slate-600 text-sm mt-2">
              Este dispositivo fue configurado por el administrador para uso exclusivo mediante <strong class="text-amber-700">Chip NFC</strong>.
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
      <body class="bg-slate-50 text-slate-900 min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-xl space-y-6">
          <div class="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-3xl">
            ⚠️
          </div>
          <div>
            <span class="inline-block px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
              CANAL NFC DESHABILITADO
            </span>
            <h1 class="text-2xl font-black text-slate-900">${escaparHtml(resolvedCardId)}</h1>
            <p class="text-slate-600 text-sm mt-2">
              Este dispositivo fue configurado por el administrador para uso exclusivo mediante <strong class="text-amber-700">Código QR</strong>.
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
      <body class="bg-slate-50 text-slate-900 min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-xl space-y-6">
          <div class="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">
            ⚠️
          </div>
          <div>
            <span class="inline-block px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold rounded-full mb-3 uppercase tracking-wider">
              ${escaparHtml(resolvedCardId)} • ${escaparHtml(groupName)}
            </span>
            <h1 class="text-2xl font-black text-slate-900">${escaparHtml(cardLabel)}</h1>
            <p class="text-slate-600 text-sm mt-2">
              Este dispositivo no tiene un enlace asignado para escaneo mediante <strong class="text-amber-700 font-semibold">${escaparHtml(channelName)}</strong>.
            </p>
          </div>
          <div class="bg-slate-50 p-4 rounded-xl text-xs text-slate-600 border border-slate-200 text-left space-y-1">
            <p class="font-bold text-slate-800">💡 ¿Eres el administrador?</p>
            <p>Puedes configurar y cambiar este enlace en cualquier momento desde tu panel de control.</p>
          </div>
          <a href="/dashboard" class="block w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition shadow-md">
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

  // 6. Pantalla Puente Clara Ejecutiva (6 Segundos + Anuncio Visual starTAP + Anti-Rebote GA4 + SEO Noindex)
  return new NextResponse(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>${escaparHtml(displayCommerceName)} | Conexión Verificada starTAP</title>
  <link rel="preload" as="image" href="/images/startap-bridge-ad.jpg">
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
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", Helvetica, Arial, sans-serif;
      background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
      color: #0f172a;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 18px 14px;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }
    .bridge-card {
      width: 100%;
      max-width: 420px;
      margin: auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 28px;
      padding: 22px 18px 20px;
      box-shadow: 0 20px 45px -15px rgba(15, 23, 42, 0.09), 0 4px 12px rgba(15, 23, 42, 0.03);
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    /* 1. Cabecera de Destino Verificado */
    .status-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 999px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #047857;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      display: inline-block;
    }
    .status-subtitle {
      font-size: 13px;
      color: #64748b;
      font-weight: 600;
      margin-top: 2px;
    }
    .commerce-name {
      color: #0f172a;
      font-weight: 900;
      font-size: 22px;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }
    /* 2. Espacio Publicitario Visual (Ad Slot) */
    .ad-slot {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      overflow: hidden;
      text-align: left;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .ad-slot:hover {
      border-color: #cbd5e1;
      box-shadow: 0 8px 20px -8px rgba(15, 23, 42, 0.08);
    }
    .ad-slot-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: #ffffff;
      border-bottom: 1px solid #f1f5f9;
    }
    .ad-slot-tag {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: #475569;
    }
    .ad-slot-pill {
      font-size: 10px;
      font-weight: 800;
      color: #b45309;
      background: #fef3c7;
      padding: 2px 8px;
      border-radius: 999px;
    }
    .ad-image-link {
      display: block;
      text-decoration: none;
      color: inherit;
    }
    .ad-image-wrap {
      width: 100%;
      aspect-ratio: 1 / 1;
      max-height: 295px;
      background: #f1f5f9;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ad-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .ad-cta-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 11px 14px;
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
    }
    .ad-cta-text {
      font-size: 12px;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.3;
    }
    .ad-cta-text span {
      display: block;
      font-size: 11px;
      font-weight: 500;
      color: #64748b;
    }
    .ad-cta-chip {
      flex-shrink: 0;
      font-size: 11px;
      font-weight: 800;
      color: #0f172a;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      border-radius: 10px;
      white-space: nowrap;
    }
    /* 3. Botón Principal de Continuar al Comercio */
    .skip-btn {
      width: 100%;
      padding: 15px 18px;
      border-radius: 16px;
      border: none;
      background: #0f172a;
      color: #ffffff;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.01em;
      cursor: pointer;
      transition: transform 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
      box-shadow: 0 10px 22px -6px rgba(15, 23, 42, 0.28);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
    }
    .skip-btn:hover {
      background: #1e293b;
    }
    .skip-btn:active {
      transform: scale(0.98);
    }
    .skip-arrow {
      color: #fbbf24;
      font-weight: 900;
      font-size: 16px;
    }
    /* 4. Pie Corporativo */
    .brand-footer {
      margin-top: 12px;
      text-align: center;
    }
    .brand-footer a {
      color: #64748b;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
      transition: color 0.2s ease;
    }
    .brand-footer a strong {
      color: #0f172a;
      font-weight: 800;
    }
    .brand-footer a:hover {
      color: #0f172a;
    }
  </style>
</head>
<body>
  <div></div>

  <main class="bridge-card">
    <!-- 1. Cabecera Clara de Destino Verificado -->
    <div class="status-header">
      <span class="status-badge">
        <span class="status-dot"></span>
        Conexión Verificada • ${escaparHtml(resolvedCardId)}
      </span>
      <p class="status-subtitle">Estás entrando al perfil oficial de</p>
      <h1 class="commerce-name">${escaparHtml(displayCommerceName)}</h1>
    </div>

    <!-- 2. Espacio Publicitario Visual (Ad Slot con Imagen Oficial starTAP) -->
    <section id="startap-ad-slot" class="ad-slot" aria-label="Espacio patrocinado starTAP Panamá">
      <div class="ad-slot-header">
        <span class="ad-slot-tag">Destacado • starTAP Panamá</span>
        <span class="ad-slot-pill">★ Google Reviews NFC</span>
      </div>
      <a
        id="ad-slot-link"
        href="/catalogo?utm_source=bridge_ad&amp;utm_medium=nfc_qr&amp;utm_campaign=startap_stand"
        target="_blank"
        rel="noopener noreferrer"
        class="ad-image-link"
      >
        <div class="ad-image-wrap">
          <img
            src="/images/startap-bridge-ad.jpg"
            alt="Tecnología Contactless de starTAP: Rápido y sin complicaciones"
            class="ad-image"
            fetchpriority="high"
            decoding="async"
          />
        </div>
        <div class="ad-cta-bar">
          <div class="ad-cta-text">
            ¿Tienes un negocio? Impulsa tus reseñas en Google
            <span>Consigue tu Stand NFC personalizado en Panamá</span>
          </div>
          <span class="ad-cta-chip">Ver planes ↗</span>
        </div>
      </a>
    </section>

    <!-- 3. Botón Principal de Paso Inmediato -->
    <button type="button" id="skip-btn" class="skip-btn">
      <span>Continuar a ${escaparHtml(displayCommerceName)}</span>
      <span class="skip-arrow">→</span>
    </button>
  </main>

  <!-- 4. Pie de marca -->
  <footer class="brand-footer">
    <a href="/" target="_blank" rel="noopener noreferrer">
      Tecnología sin contacto verificada por <strong>starTAP Panamá</strong>
    </a>
  </footer>

  <script>
    (function() {
      var targetUrl = ${safeTargetUrlJson};
      var hasRedirected = false;
      var skipBtn = document.getElementById('skip-btn');
      var adLink = document.getElementById('ad-slot-link');

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

      if (adLink) {
        adLink.addEventListener('click', function() {
          try {
            if (typeof gtag === 'function') {
              gtag('event', 'ad_click_startap', {
                card_id: ${safeCardIdJson},
                group_name: ${safeGroupNameJson},
                ad_id: 'startap_google_reviews_stand',
                transport_type: 'beacon'
              });
            }
          } catch (e) {}
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


