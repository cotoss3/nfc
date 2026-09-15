export function buildWelcomeSubscriptionEmailHtml(email: string): string {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Bienvenido a starTAP Panamá!</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding: 32px 12px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="580" cellpadding="0" cellspacing="0" style="max-width:580px; background-color:#ffffff; border-radius:18px; overflow:hidden; border:1px solid #cbd5e1; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08);">
            
            <!-- Header con Logo -->
            <tr>
              <td style="background: linear-gradient(135deg, #020617 0%, #0f172a 100%); padding: 32px 24px; text-align:center; border-bottom: 3px solid #f59e0b;">
                <img src="https://startap.com.pa/logos/Logo.png" alt="starTAP Panamá" style="height: 46px; width: auto; max-width: 200px; display: block; margin: 0 auto 8px auto;" />
                <span style="color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;">
                  TECNOLOGÍA NFC CONTACTLESS PANAMÁ
                </span>
              </td>
            </tr>

            <!-- Contenido Principal -->
            <tr>
              <td style="padding: 32px 28px; text-align: center;">
                <h1 style="color:#0f172a; font-size: 22px; font-weight: 900; margin:0 0 12px 0;">
                  ¡Bienvenido a la comunidad starTAP! ⭐
                </h1>
                <p style="color:#475569; font-size:14px; line-height: 1.6; margin:0 0 24px 0;">
                  Gracias por suscribirte. Has quedado registrado exitosamente con la dirección <strong style="color:#0f172a;">${email}</strong>.
                </p>

                <div style="background-color:#f0fdf4; border:1px solid #bbf7d0; border-radius:14px; padding: 20px; text-align: left; margin-bottom: 24px;">
                  <h3 style="color:#166534; font-size: 14px; font-weight: 900; margin:0 0 6px 0;">
                    🚀 ¿Qué recibirás como suscriptor?
                  </h3>
                  <ul style="margin: 0; padding-left: 20px; color:#15803d; font-size:13px; line-height: 1.6;">
                    <li>Notificaciones exclusivas de ofertas y nuevos dispositivos NFC.</li>
                    <li>Guías prácticas para multiplicar tus opiniones de 5 estrellas en Google Maps.</li>
                    <li>Actualizaciones sobre nuestra plataforma de ruteo inteligente.</li>
                  </ul>
                </div>

                <div style="margin-bottom: 24px;">
                  <a href="https://startap.com.pa/catalogo" style="display:inline-block; background-color:#0f172a; color:#ffffff; font-size:14px; font-weight:800; padding:14px 28px; border-radius:12px; text-decoration:none; box-shadow: 0 4px 12px rgba(15,23,42,0.25);">
                    🛒 Ver Catálogo de Placas y Tarjetas NFC
                  </a>
                </div>

                <p style="font-size:12px; color:#64748b; margin:0;">
                  ¿Tienes alguna duda sobre qué dispositivo se adapta mejor a tu local? Contáctanos directo por WhatsApp al <strong>+507 6713-4341</strong>.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#0f172a; padding: 20px 24px; text-align:center; border-top:1px solid #1e293b; color:#94a3b8;">
                <p style="color:#ffffff; font-size:12px; font-weight:bold; margin:0 0 4px 0;">
                  starTAP Panamá — Marca de DataKorex
                </p>
                <p style="font-size:10px; margin:0; color:#64748b;">
                  Ciudad de Panamá | info@datakorex.com
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}
