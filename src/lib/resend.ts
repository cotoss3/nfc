const RESEND_API_URL = 'https://api.resend.com/emails';

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  reply_to?: string;
}

export interface ResendResponse {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Helper para enviar correos transaccionales a través de la API de Resend.
 */
export async function sendEmail(payload: SendEmailPayload): Promise<ResendResponse> {
  const apiKey = process.env.RESEND_API_KEY?.replace(/["']/g, '').trim();

  if (!apiKey) {
    console.error('[RESEND_ERROR] Falta RESEND_API_KEY en las variables de entorno.');
    return {
      success: false,
      error: 'RESEND_API_KEY no está configurada.',
    };
  }

  // Remitente predeterminado (Resend permite onboarding@resend.dev por defecto antes de verificar el dominio)
  const from = payload.from || 'starTAP Panamá <onboarding@resend.dev>';

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        reply_to: payload.reply_to || 'info@datakorex.com',
      }),
      cache: 'no-store',
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[RESEND_API_ERROR]', res.status, data);
      return {
        success: false,
        error: data.message || data.name || 'Error al enviar correo vía Resend.',
      };
    }

    return {
      success: true,
      id: data.id,
    };
  } catch (error: any) {
    console.error('[RESEND_FETCH_EXCEPTION]', error);
    return {
      success: false,
      error: error.message || 'Excepción al conectar con Resend API.',
    };
  }
}
