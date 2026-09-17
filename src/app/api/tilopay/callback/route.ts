import { NextRequest, NextResponse } from 'next/server';
import { consultTilopayPayment } from '@/lib/tilopay';
import { sendEmail } from '@/lib/resend';
import { buildCustomerOrderEmailHtml } from '@/components/email/OrderEmailTemplate';

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
  let customerEmail = 'info@startap.com.pa';
  let totalAmount = 0;

  if (order) {
    try {
      // Fuente de verdad: la API de Tilopay
      const consulta = await consultTilopayPayment(order);

      // Tilopay devuelve la transaccion dentro de un arreglo en consulta.response[0]
      const primerItem = Array.isArray(consulta?.response)
        ? consulta.response[0]
        : (typeof consulta?.response === 'object' && consulta?.response ? consulta.response : null);

      const codeItem = String(primerItem?.code ?? consulta?.code ?? '').toLowerCase();
      const responseItem = String(primerItem?.response ?? consulta?.response ?? '').toLowerCase();
      const messageTop = String(consulta?.message ?? '').toLowerCase();

      isSuccess =
        codeItem === '1' ||
        codeItem === '100' ||
        responseItem.includes('approved') ||
        responseItem.includes('success') ||
        messageTop === 'success' ||
        consulta?.approved === true;

      if (primerItem?.email) {
        customerEmail = primerItem.email;
      }
      if (primerItem?.amount) {
        totalAmount = Number(primerItem.amount);
      }

      if (!isSuccess && !reason) {
        reason = primerItem?.response || consulta?.description || consulta?.message || 'Pago no confirmado';
      }
    } catch (e) {
      console.error('[TILOPAY_CALLBACK_CONSULT_ERROR]', e);
      reason = reason || 'No pudimos confirmar el estado del pago';
    }
  } else {
    reason = reason || 'Pedido no identificado en el retorno de Tilopay';
  }

  if (isSuccess && order) {
    // 1. Actualizar estado de pago en el servidor (Fuente de verdad)
    try {
      const { dbLocal } = await import('@/lib/db');
      dbLocal.updateOrderPaymentStatus(order, 'completed');
    } catch (dbErr) {
      console.error('[CALLBACK_DB_UPDATE_ERROR]', dbErr);
    }

    // 2. ENVIAR CORREO DE CONFIRMACIÓN A CLIENTE Y VENDEDOR VÍA RESEND API
    try {
      const recipients = Array.from(new Set([customerEmail, 'ventas@startap.com.pa']));
      const html = buildCustomerOrderEmailHtml({
        orderId: order,
        customerName: customerEmail.split('@')[0] || 'Cliente',
        customerEmail: customerEmail,
        customerPhone: '67134341',
        address: 'Envío registrado',
        district: 'Panamá',
        province: 'Panamá',
        paymentMethod: 'Tarjeta (Tilopay)',
        paymentStatus: 'completed',
        subtotal: totalAmount > 0 ? totalAmount : 20,
        shipping: 0,
        total: totalAmount > 0 ? totalAmount : 20,
        items: [
          {
            product_name: 'Dispositivo NFC starTAP',
            quantity: 1,
            price: totalAmount > 0 ? totalAmount : 20,
            business_name: 'Pago confirmado por Tilopay',
          },
        ],
      });

      await sendEmail({
        to: recipients,
        subject: `✅ ¡Pago Aprobado! Pedido #${order} - starTAP Panamá`,
        html,
      });
    } catch (emailErr) {
      console.error('[CALLBACK_EMAIL_SEND_ERROR]', emailErr);
    }
  }

  const url = new URL('/checkout', baseUrl);
  url.searchParams.set('status', isSuccess ? 'success' : 'failed');
  if (order) url.searchParams.set('order', order);
  if (!isSuccess && reason) url.searchParams.set('reason', reason);

  return NextResponse.redirect(url.toString(), 303);
}
