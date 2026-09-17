export function buildWelcomeSubscriptionEmailHtml(email: string): string {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Bienvenido a starTAP Panamá!</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc; padding: 32px 12px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:20px; overflow:hidden; border:1px solid #e2e8f0; box-shadow: 0 10px 30px -5px rgba(15,23,42,0.08);">
            
            <!-- Header con Logo Blanco y Barra de Marca (Outlook Compatible) -->
            <tr>
              <td bgcolor="#0f172a" style="background-color: #0f172a; padding: 30px 24px; text-align:center; border-bottom: 4px solid #f59e0b;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <img src="https://startap.com.pa/email-logo-white.png" width="200" height="38" alt="starTAP Panamá" style="width: 200px; height: 38px; max-width: 200px; max-height: 38px; display: block; margin: 0 auto; border: 0;" />
                      <!-- Fallback para clientes que bloquean imágenes -->
                      <div style="font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; font-family: sans-serif; margin-top: 6px;">
                        starTAP<span style="color: #f59e0b;">.</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top: 10px;">
                      <span style="color: #fbbf24; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; font-family: sans-serif;">
                        TECNOLOGÍA NFC CONTACTLESS PANAMÁ
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Banner Hero de Bienvenida -->
            <tr>
              <td style="padding: 36px 32px 24px 32px; text-align: center;">
                <div style="display: inline-block; background-color: #fef3c7; border: 1px solid #fde68a; padding: 6px 14px; border-radius: 50px; font-size: 11px; font-weight: 800; color: #92400e; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">
                  ⭐ BIENVENIDO A LA COMUNIDAD
                </div>

                <h1 style="color:#0f172a; font-size: 24px; font-weight: 900; margin:0 0 14px 0; line-height: 1.3; letter-spacing: -0.5px;">
                  Multiplica las Reseñas de 5 Estrellas de tu Negocio en Panamá
                </h1>

                <p style="color:#475569; font-size:14px; line-height: 1.6; margin:0 0 24px 0;">
                  Gracias por suscribirte. Tu correo <strong style="color:#0f172a;">${email}</strong> ha sido registrado en nuestra comunidad de comercios líderes. A partir de hoy recibirás guías prácticas de SEO Local, lanzamientos prioritarios y ofertas exclusivas.
                </p>
              </td>
            </tr>

            <!-- REGALO DE BIENVENIDA / CUPÓN -->
            <tr>
              <td style="padding: 0 32px 28px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffbe6; border: 2px dashed #f59e0b; border-radius: 16px; padding: 22px; text-align: center;">
                  <tr>
                    <td>
                      <span style="font-size: 11px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 6px;">
                        🎁 REGALO DE BIENVENIDA PARA TU PRIMERA COMPRA
                      </span>
                      <h3 style="color: #78350f; font-size: 18px; font-weight: 900; margin: 0 0 10px 0;">
                        Envío Gratis a Todo Panamá
                      </h3>
                      <p style="color: #92400e; font-size: 12px; margin: 0 0 14px 0; line-height: 1.4;">
                        Ingresa este código durante el checkout para obtener envío gratis a cualquier provincia:
                      </p>
                      <div style="display: inline-block; background-color: #0f172a; color: #fbbf24; font-size: 18px; font-weight: 900; font-family: monospace; padding: 10px 24px; border-radius: 10px; letter-spacing: 3px; box-shadow: 0 4px 10px rgba(15,23,42,0.15);">
                        CUPÓN: EVG
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- BENEFICIOS EXCLUSIVOS -->
            <tr>
              <td style="padding: 0 32px 28px 32px;">
                <h3 style="color:#0f172a; font-size: 15px; font-weight: 900; margin:0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                  🚀 ¿Qué recibirás como suscriptor VIP?
                </h3>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                  <tr>
                    <td width="36" valign="top">
                      <div style="width: 28px; height: 28px; background-color: #dbeafe; border-radius: 8px; text-align: center; line-height: 28px; font-size: 14px; font-weight: bold; color: #1d4ed8;">⚡</div>
                    </td>
                    <td style="padding-left: 10px;" valign="top">
                      <strong style="color: #0f172a; font-size: 13px; display: block; margin-bottom: 2px;">Novedades y Nuevos Lanzamientos</strong>
                      <span style="color: #64748b; font-size: 12px; line-height: 1.4; display: block;">Acceso anticipado a nuevas placas de acrílico, stands de mesa y accesorios NFC para tu local.</span>
                    </td>
                  </tr>
                </table>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                  <tr>
                    <td width="36" valign="top">
                      <div style="width: 28px; height: 28px; background-color: #dcfce7; border-radius: 8px; text-align: center; line-height: 28px; font-size: 14px; font-weight: bold; color: #15803d;">📈</div>
                    </td>
                    <td style="padding-left: 10px;" valign="top">
                      <strong style="color: #0f172a; font-size: 13px; display: block; margin-bottom: 2px;">Guías Prácticas de SEO Local</strong>
                      <span style="color: #64748b; font-size: 12px; line-height: 1.4; display: block;">Aprende cómo solicitar valoraciones en caja de cobro sin incomodar al cliente y sin penalizaciones.</span>
                    </td>
                  </tr>
                </table>

                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="36" valign="top">
                      <div style="width: 28px; height: 28px; background-color: #fef3c7; border-radius: 8px; text-align: center; line-height: 28px; font-size: 14px; font-weight: bold; color: #b45309;">⚙️</div>
                    </td>
                    <td style="padding-left: 10px;" valign="top">
                      <strong style="color: #0f172a; font-size: 13px; display: block; margin-bottom: 2px;">Panel de Control Inteligente</strong>
                      <span style="color: #64748b; font-size: 12px; line-height: 1.4; display: block;">Actualizaciones continuas en nuestra plataforma de ruteo para cambiar enlaces en tiempo real.</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- PRODUCT SHOWCASE -->
            <tr>
              <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                <h3 style="color:#0f172a; font-size: 14px; font-weight: 900; margin:0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">
                  Dispositivos Más Populares en Panamá
                </h3>

                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <!-- Placa Mostrador -->
                    <td width="48%" valign="top" style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px; text-align: center;">
                      <img src="https://startap.com.pa/products/NFC_10001/NFC_10001_Placa.webp" width="90" height="90" alt="Placa NFC Mostrador" style="width: 90px; height: 90px; object-fit: contain; margin-bottom: 8px;" />
                      <strong style="color: #0f172a; font-size: 12px; display: block; margin-bottom: 4px;">Placa NFC para Mostrador</strong>
                      <span style="color: #d97706; font-size: 13px; font-weight: 900; display: block; margin-bottom: 8px;">$30.00 USD</span>
                      <a href="https://startap.com.pa/catalogo?producto=placa-nfc-mostrador" style="display: block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 800; padding: 8px 0; border-radius: 8px;">Ver Placa</a>
                    </td>

                    <td width="4%"></td>

                    <!-- Tarjeta Bolsillo -->
                    <td width="48%" valign="top" style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px; text-align: center;">
                      <img src="https://startap.com.pa/products/tarjeta-nfc/tarjeta-nfc-bolsillo-resenas-google-panama.webp" width="90" height="90" alt="Tarjeta NFC de Bolsillo" style="width: 90px; height: 90px; object-fit: contain; margin-bottom: 8px;" />
                      <strong style="color: #0f172a; font-size: 12px; display: block; margin-bottom: 4px;">Tarjeta NFC de Bolsillo</strong>
                      <span style="color: #d97706; font-size: 13px; font-weight: 900; display: block; margin-bottom: 8px;">$20.00 USD</span>
                      <a href="https://startap.com.pa/catalogo?producto=tarjeta-nfc-bolsillo" style="display: block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 800; padding: 8px 0; border-radius: 8px;">Ver Tarjeta</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- CTA PRINCIPAL -->
            <tr>
              <td style="padding: 32px; text-align: center;">
                <div style="margin-bottom: 16px;">
                  <a href="https://startap.com.pa/catalogo" style="display:inline-block; background-color:#f59e0b; color:#0f172a; font-size:15px; font-weight:900; padding:16px 36px; border-radius:12px; text-decoration:none; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(245,158,11,0.35);">
                    🛒 Explorar Catálogo starTAP
                  </a>
                </div>

                <div style="margin-top: 16px;">
                  <a href="https://wa.me/50767134341?text=Hola%2C%20acabo%20de%20suscribirme%20al%20bolet%C3%ADn%20y%20tengo%20una%20consulta%20sobre%20los%20dispositivos%20NFC." style="display:inline-block; background-color:#10b981; color:#ffffff; font-size:12px; font-weight:800; padding:10px 20px; border-radius:50px; text-decoration:none;">
                    💬 Asistencia por WhatsApp (+507 6713-4341)
                  </a>
                </div>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td bgcolor="#0f172a" style="background-color:#0f172a; padding: 24px; text-align:center; border-top:1px solid #1e293b; color:#94a3b8;">
                <p style="color:#ffffff; font-size:12px; font-weight:bold; margin:0 0 6px 0;">
                  starTAP Panamá — Marca de DataKorex
                </p>
                <p style="font-size:11px; margin:0 0 8px 0; color:#cbd5e1;">
                  Ciudad de Panamá | <a href="mailto:info@startap.com.pa" style="color:#fbbf24; text-decoration:none;">info@startap.com.pa</a>
                </p>
                <p style="font-size:10px; margin:0; color:#64748b; line-height: 1.4;">
                  Recibiste este correo porque te suscribiste en <a href="https://startap.com.pa" style="color:#94a3b8; text-decoration:underline;">startap.com.pa</a>.<br/>
                  © ${new Date().getFullYear()} starTAP Panamá. Todos los derechos reservados.
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
