import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';
import {
  buildCustomerOrderEmailHtml,
  buildAdminOrderEmailHtml,
  OrderEmailParams,
} from '@/components/email/OrderEmailTemplate';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OrderEmailParams;

    if (!body.orderId || !body.customerEmail || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos obligatorios del pedido.' },
        { status: 400 }
      );
    }

    // 1. Enviar recibo al cliente
    const customerHtml = buildCustomerOrderEmailHtml(body);
    const customerRes = await sendEmail({
      to: body.customerEmail,
      subject: `Confirmación de Pedido #${body.orderId} - starTAP Panamá`,
      html: customerHtml,
    });

    // 2. Alerta al administrador
    const adminHtml = buildAdminOrderEmailHtml(body);
    const adminRes = await sendEmail({
      to: 'info@datakorex.com',
      subject: `🔔 NUEVO PEDIDO #${body.orderId} - ${body.customerName} ($${body.total.toFixed(2)} USD)`,
      html: adminHtml,
    });

    return NextResponse.json({
      success: true,
      customerEmailSent: customerRes.success,
      adminEmailSent: adminRes.success,
    });
  } catch (error: any) {
    console.error('[EMAIL_ORDER_CONFIRMATION_ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno al enviar correo de orden.' },
      { status: 500 }
    );
  }
}
