import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, addContactToResend } from '@/lib/resend';
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

    // 1. Agregar contacto a la audiencia en Resend Dashboard
    addContactToResend(cleanEmail).catch((err) =>
      console.error('[RESEND_CONTACT_SYNC_ERROR]', err)
    );

    // 2. Correo de bienvenida al suscriptor
    const welcomeRes = await sendEmail({
      to: cleanEmail,
      subject: '⭐ ¡Bienvenido a starTAP Panamá! | Tu regalo de bienvenida dentro',
      html,
    });

    // 3. Alerta interna de nuevo suscriptor
    sendEmail({
      to: 'info@startap.com.pa',
      subject: `📩 Nuevo Suscriptor: ${cleanEmail}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f172a; margin-top: 0;">🎉 Nuevo Suscriptor en starTAP Panamá</h2>
          <p style="color: #334155; font-size: 14px;">Se ha registrado una nueva suscripción al boletín desde el sitio web:</p>
          <div style="background-color: #ffffff; padding: 12px 16px; border-radius: 8px; border: 1px solid #cbd5e1; font-weight: bold; font-family: monospace; color: #0284c7;">
            ${cleanEmail}
          </div>
          <p style="color: #64748b; font-size: 12px; margin-bottom: 0; margin-top: 16px;">El contacto ha sido sincronizado con Resend y recibió el correo de bienvenida.</p>
        </div>
      `,
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
