export function buildWelcomeSubscriptionEmailHtml(email: string): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Bienvenido a starTAP Panamá</title>
  </head>
  <body style="margin:0; padding:24px; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#0f172a;">
    <table width="100%" max-width="550" style="max-width:550px; margin:0 auto; background:#ffffff; border-radius:16px; padding:32px; border:1px solid #e2e8f0; text-align:center;">
      <tr>
        <td>
          <h1 style="font-size:24px; font-weight:900; color:#0f172a; margin:0 0 12px 0;">
            ¡Bienvenido a starTAP Panamá! ⭐
          </h1>
          <p style="font-size:14px; color:#475569; line-height:1.6; margin:0 0 24px 0;">
            Gracias por suscribirte a nuestras novedades y actualizaciones. Has quedado registrado con el correo <strong>${email}</strong>.
          </p>
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:16px; text-align:left; margin-bottom:24px;">
            <p style="font-size:13px; font-weight:bold; color:#166534; margin:0 0 4px 0;">
              🚀 Potencia las reseñas de tu negocio
            </p>
            <p style="font-size:12px; color:#15803d; margin:0;">
              Te mantendremos al tanto de nuevos lanzamientos, funciones de nuestra plataforma de ruteo NFC y promociones exclusivas para comercios en Panamá.
            </p>
          </div>
          <a href="https://startap.com.pa/catalogo" style="display:inline-block; background:#0f172a; color:#ffffff; font-size:13px; font-weight:bold; padding:12px 24px; border-radius:10px; text-decoration:none;">
            Explorar Catálogo de Dispositivos NFC
          </a>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}
