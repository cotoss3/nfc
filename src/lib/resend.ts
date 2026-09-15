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

  // Remitente predeterminado con la marca starTAP Panamá a través de DataKorex
  const from = payload.from || 'starTAP Panamá <pedidos@datakorex.com>';

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

    let data = await res.json();

    if (!res.ok) {
      console.error('[RESEND_API_ERROR]', res.status, data);

      // Si el dominio aún no está verificado en Resend, Resend retorna 403 permitiendo enviar solo a fbcontrerras@gmail.com
      if (res.status === 403 && data.message?.includes('fbcontrerras@gmail.com')) {
        console.warn('[RESEND_FALLBACK] El dominio no está verificado en Resend. Reintentando envío a fbcontrerras@gmail.com...');
        
        const fallbackRes = await fetch(RESEND_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from,
            to: ['fbcontrerras@gmail.com'],
            subject: `[PROPIETARIO] ${payload.subject}`,
            html: payload.html,
            reply_to: payload.reply_to || 'info@datakorex.com',
          }),
          cache: 'no-store',
        });

        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok) {
          return {
            success: true,
            id: fallbackData.id,
          };
        } else {
          console.error('[RESEND_FALLBACK_ERROR]', fallbackRes.status, fallbackData);
        }
      }

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
