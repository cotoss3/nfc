import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';
import { buildWelcomeSubscriptionEmailHtml } from '@/components/email/SubscribeEmailTemplate';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Por favor ingresa un correo electrónico válido.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const html = buildWelcomeSubscriptionEmailHtml(cleanEmail);

    // 1. Correo de bienvenida al suscriptor
    const welcomeRes = await sendEmail({
      to: cleanEmail,
      subject: '⭐ ¡Bienvenido a starTAP Panamá!',
      html,
    });

    // 2. Alerta interna de nuevo suscriptor
    sendEmail({
      to: 'info@datakorex.com',
      subject: `📩 Nuevo Suscriptor: ${cleanEmail}`,
      html: `<p>Se ha registrado un nuevo correo en la web de starTAP: <strong>${cleanEmail}</strong></p>`,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      emailSent: welcomeRes.success,
    });
  } catch (error: any) {
    console.error('[EMAIL_SUBSCRIBE_ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al procesar la suscripción.' },
      { status: 500 }
    );
  }
}
