import { NextRequest, NextResponse } from 'next/server';
import { dbLocal } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cardId = params.id;
  
  // Buscar tarjeta en la base de datos local / Supabase
  const card = dbLocal.getCardById(cardId);
  
  if (!card) {
    // Si la tarjeta no existe aún en la base de datos, redirigir al portal para que la active el comprador
    return NextResponse.redirect(new URL(`/dashboard?claim=${cardId}`, request.url));
  }

  if (card.claimed === false || !card.is_active) {
    // Si el dispositivo existe pero aún no ha sido reclamado, invitar al cliente a vincular su cuenta
    return NextResponse.redirect(new URL(`/dashboard?claim=${cardId}`, request.url));
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
  // Generalmente las tarjetas NFC se graban con un identificador de medio o vienen del aire
  const urlObj = new URL(request.url);
  const medium = urlObj.searchParams.get('m') || 'NFC Scan'; 
  const referrer = medium === 'qr' ? 'QR Code' : 'NFC Scan';

  // Registrar analíticas en la base de datos de manera asíncrona (simulada)
  try {
    dbLocal.registerScan(cardId, device, referrer);
  } catch (err) {
    console.error('Error registrando analítica:', err);
  }

  // Redirección rápida al destino deseado
  let targetUrl = (card.target_url || '').trim();
  if (targetUrl && !targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  try {
    return NextResponse.redirect(new URL(targetUrl));
  } catch (err) {
    console.error('Error al redirigir URL:', err);
    return NextResponse.redirect(new URL(`/dashboard?claim=${cardId}`, request.url));
  }
}
