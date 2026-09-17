import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';
import { buildQuoteEmailHtml, QuoteEmailParams } from '@/components/email/QuoteEmailTemplate';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as QuoteEmailParams;

    if (!body.email || !body.name || !body.businessName) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos obligatorios para la cotización.' },
        { status: 400 }
      );
    }

    const html = buildQuoteEmailHtml(body);

    // Enviar a admin + copia a cliente
    const result = await sendEmail({
      to: ['ventas@startap.com.pa', body.email],
      subject: `💼 Solicitud de Cotización B2B: ${body.businessName} (${body.quantity} uds)`,
      html,
      reply_to: body.email,
    });

    return NextResponse.json({
      success: result.success,
      error: result.error,
    });
  } catch (error: any) {
    console.error('[EMAIL_QUOTE_ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al procesar solicitud de cotización.' },
      { status: 500 }
    );
  }
}
