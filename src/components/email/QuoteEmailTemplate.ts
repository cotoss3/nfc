export interface QuoteEmailParams {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  productType: string;
  quantity: number;
  discountPercent: number;
  totalEstimated: number;
  message?: string;
}

export function buildQuoteEmailHtml(data: QuoteEmailParams): string {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solicitud de Cotización B2B - starTAP Panamá</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding: 32px 12px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:18px; overflow:hidden; border:1px solid #cbd5e1; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08);">
            
            <!-- Header con Logo Blanco y Soporte para Outlook -->
            <tr>
              <td bgcolor="#0f172a" style="background-color: #0f172a; padding: 28px 24px; text-align:center; border-bottom: 3px solid #f59e0b;">
                <img src="https://startap.com.pa/logos/email-logo-white.png" width="160" height="30" alt="starTAP Panamá" style="width: 160px; height: 30px; max-width: 160px; max-height: 30px; display: block; margin: 0 auto 10px auto; border: 0;" />
                <span style="color: #fbbf24; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px;">
                  💼 COTIZACIÓN B2B SOLICITADA
                </span>
              </td>
            </tr>

            <!-- Contenido Principal -->
            <tr>
              <td style="padding: 32px 28px;">
                <h2 style="color:#0f172a; font-size: 20px; font-weight: 900; margin:0 0 12px 0;">
                  Solicitud de Pedido Corporativo B2B
                </h2>
                <p style="color:#475569; font-size:14px; line-height: 1.6; margin:0 0 20px 0;">
                  Se ha recibido una nueva solicitud de cotización por volumen desde la plataforma web.
                </p>

                <!-- Datos del Cliente / Empresa -->
                <div style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding: 18px; margin-bottom: 20px;">
                  <h3 style="color:#0f172a; font-size:13px; font-weight:800; text-transform:uppercase; margin:0 0 10px 0;">
                    🏢 Datos de la Empresa y Contacto
                  </h3>
                  <p style="margin:0 0 6px 0; font-size:13px; color:#334155;"><strong>Empresa / Local:</strong> ${data.businessName}</p>
                  <p style="margin:0 0 6px 0; font-size:13px; color:#334155;"><strong>Persona de Contacto:</strong> ${data.name}</p>
                  <p style="margin:0 0 6px 0; font-size:13px; color:#334155;"><strong>Correo Electrónico:</strong> ${data.email}</p>
                  <p style="margin:0; font-size:13px; color:#334155;"><strong>Teléfono / WhatsApp:</strong> <a href="https://wa.me/507${data.phone.replace(/[^0-9]/g, '')}" style="color:#25d366; font-weight:bold;">${data.phone}</a></p>
                </div>

                <!-- Detalle del Pedido Requerido -->
                <div style="background-color:#fffbeb; border:1px solid #fef08a; border-radius:12px; padding: 18px; margin-bottom: 20px;">
                  <h3 style="color:#92400e; font-size:13px; font-weight:800; text-transform:uppercase; margin:0 0 10px 0;">
                    📦 Requerimiento Estimado
                  </h3>
                  <p style="margin:0 0 6px 0; font-size:13px; color:#78350f;"><strong>Producto Solicitado:</strong> ${data.productType}</p>
                  <p style="margin:0 0 6px 0; font-size:13px; color:#78350f;"><strong>Volumen:</strong> ${data.quantity} unidades</p>
                  <p style="margin:0 0 6px 0; font-size:13px; color:#78350f;"><strong>Descuento Aplicado:</strong> ${data.discountPercent}% OFF</p>
                  <p style="margin:8px 0 0 0; font-size:18px; font-weight:900; color:#059669;">
                    Estimado Total: $${data.totalEstimated.toFixed(2)} USD
                  </p>
                  ${data.message ? `<p style="margin:10px 0 0 0; font-size:12px; color:#78350f; border-top:1px solid #fde68a; padding-top:8px;"><strong>Mensaje adicional:</strong> ${data.message}</p>` : ''}
                </div>

                <div style="background-color:#dcfce7; border:1px solid #86efac; border-radius:12px; padding: 14px; text-align:center; font-weight:bold; color:#166534; font-size:13px;">
                  ⚡ Acción: Responder a este cliente directamente a <strong>${data.email}</strong> o WhatsApp <strong>${data.phone}</strong>.
                </div>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#0f172a; padding: 20px 24px; text-align:center; border-top:1px solid #1e293b; color:#94a3b8;">
                <p style="color:#ffffff; font-size:12px; font-weight:bold; margin:0 0 4px 0;">
                  starTAP Panamá B2B Corporativo — DataKorex
                </p>
                <p style="font-size:10px; margin:0; color:#64748b;">
                  Arraiján, Panamá | info@datakorex.com
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
