import { NextRequest, NextResponse } from 'next/server';
import { consultTilopayPayment } from '@/lib/tilopay';

export async function GET(req: NextRequest) {
  return handleCallback(req);
}

export async function POST(req: NextRequest) {
  return handleCallback(req);
}

/**
 * Retorno del cliente desde Tilopay.
 *
 * IMPORTANTE: los parámetros de esta URL vienen por el navegador del cliente y
 * se pueden escribir a mano. Nunca se usan para dar un pago por bueno.
 * El estado real se confirma consultando la transacción contra la API de Tilopay.
 */
async function handleCallback(req: NextRequest) {
  const host = req.headers.get('host') || 'startap.com.pa';
  const protocol =
    req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

  const searchParams = req.nextUrl.searchParams;
  let order: string | null = searchParams.get('order') || searchParams.get('orderNumber');
  let reason: string | null = searchParams.get('reason') || searchParams.get('message') || '';

  if (req.method === 'POST') {
    try {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const body = await req.json();
        order =
          order || (body.order ? String(body.order) : null) || (body.orderNumber ? String(body.orderNumber) : null);
        reason = reason || (body.reason ? String(body.reason) : null) || (body.message ? String(body.message) : null);
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await req.formData();
        order = order || (formData.get('order') as string) || (formData.get('orderNumber') as string);
        reason = reason || (formData.get('reason') as string) || (formData.get('message') as string);
      }
    } catch (e) {
      console.warn('[TILOPAY_CALLBACK_BODY_PARSE_WARN]', e);
    }
  }

  let isSuccess = false;

  if (order) {
    try {
      // Fuente de verdad: la API de Tilopay, no la URL de retorno.
      const consulta = await consultTilopayPayment(order);
      const estado = String(
        consulta?.status ?? consulta?.code ?? consulta?.response ?? ''
      ).toLowerCase();

      isSuccess =
        estado === '1' ||
        estado === '100' ||
        estado === 'success' ||
        estado === 'completed' ||
        estado === 'approved' ||
        consulta?.approved === true;

      if (!isSuccess && !reason) {
        reason = consulta?.description || consulta?.message || 'Pago no confirmado';
      }
    } catch (e) {
      console.error('[TILOPAY_CALLBACK_CONSULT_ERROR]', e);
      reason = reason || 'No pudimos confirmar el estado del pago';
    }
  } else {
    reason = reason || 'Pedido no identificado en el retorno de Tilopay';
  }

  const url = new URL('/checkout', baseUrl);
  url.searchParams.set('status', isSuccess ? 'success' : 'failed');
  if (order) url.searchParams.set('order', order);
  if (!isSuccess && reason) url.searchParams.set('reason', reason);

  return NextResponse.redirect(url.toString(), 303);
}
