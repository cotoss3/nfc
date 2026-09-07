import { NextRequest, NextResponse } from 'next/server';
import { dbLocal } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cardId = params.id;
  
  // Buscar tarjeta en la base de datos local / Supabase
  const card = dbLocal.getCardById(cardId);
  
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
    dbLocal.registerScan(cardId, device, referrer);
  } catch (err) {
    console.error('Error registrando analítica:', err);
  }

  // Obtener URL de destino configurada
  let targetUrl = card?.target_url ? card.target_url.trim() : '';

  // Sanitizar cualquier placeholder con "..."
  if (targetUrl.includes('...')) {
    targetUrl = 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeoQI8Rk3_JiM7UtGU';
  }

  // Si la tarjeta no existe o no tiene una URL configurada, redirigir al portal para vincularla
  if (!targetUrl && (!card || card.claimed === false)) {
    return NextResponse.redirect(new URL(`/dashboard?claim=${cardId}`, request.url));
  }

  // Fallback si sigue vacía
  if (!targetUrl) {
    targetUrl = 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeoQI8Rk3_JiM7UtGU';
  }

  // Sanitizar protocolo http/https
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  try {
    // Redirección DIRECTA E INSTANTÁNEA a la URL del usuario
    return NextResponse.redirect(new URL(targetUrl));
  } catch (err) {
    console.error('Error procesando URL de redirección:', err);
    return NextResponse.redirect(new URL(`/dashboard?claim=${cardId}`, request.url));
  }
}
