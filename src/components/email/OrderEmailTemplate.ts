export interface OrderItemPayload {
  product_name: string;
  quantity: number;
  price: number;
  selected_color?: string;
  business_name?: string;
  has_custom_logo?: boolean;
  has_qr_code?: boolean;
}

export interface OrderEmailParams {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  district: string;
  province: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: OrderItemPayload[];
}

/**
 * Genera el cuerpo HTML del correo de confirmación de pedido para el cliente.
 */
export function buildCustomerOrderEmailHtml(data: OrderEmailParams): string {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 14px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a; vertical-align: top;">
          <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 4px;">
            ${item.quantity}x ${item.product_name}
          </div>
          ${
            item.business_name
              ? `<div style="font-size: 12px; color: #d97706; font-weight: 700; background-color: #fffbeb; border: 1px solid #fef3c7; padding: 4px 8px; border-radius: 6px; display: inline-block; margin-top: 4px; margin-bottom: 4px;">
                  📍 Negocio Grabado: ${item.business_name}
                </div><br/>`
              : ''
          }
          <div style="font-size: 11px; color: #64748b; line-height: 1.4;">
            ${item.selected_color ? `<strong>Acabado:</strong> ${item.selected_color}` : ''}
            ${item.has_custom_logo ? ` • <span style="color:#0284c7; font-weight:bold;">Logo Personalizado (+ $5.00)</span>` : ''}
            ${item.has_qr_code ? ` • <span style="color:#059669; font-weight:bold;">Código QR (+ $3.00)</span>` : ''}
          </div>
        </td>
        <td style="padding: 14px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 800; color: #0f172a; text-align: right; vertical-align: top;">
          $${(item.price * item.quantity).toFixed(2)} USD
        </td>
      </tr>
    `
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Pedido #${data.orderId} - starTAP Panamá</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding: 32px 12px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:18px; overflow:hidden; border:1px solid #cbd5e1; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08);">
            
            <!-- Header Banner con Logo Oficial -->
            <tr>
              <td style="background: linear-gradient(135deg, #020617 0%, #0f172a 100%); padding: 32px 24px; text-align:center; border-bottom: 3px solid #f59e0b;">
                <img src="https://startap.com.pa/logos/Logo.png" alt="starTAP Panamá Logo" style="height: 28px; width: auto; max-width: 140px; display: block; margin: 0 auto 10px auto;" />
                <div style="display: inline-block; background-color: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); padding: 4px 14px; border-radius: 20px;">
                  <span style="color: #fef08a; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;">
                    N° DE PEDIDO: #${data.orderId}
                  </span>
                </div>
              </td>
            </tr>

            <!-- Content Body -->
            <tr>
              <td style="padding: 32px 28px;">
                <!-- Saludo Personalizado -->
                <h1 style="color:#0f172a; font-size: 22px; font-weight: 900; margin:0 0 8px 0;">
                  ¡Gracias por tu compra, ${data.customerName}! ⭐
                </h1>
                <p style="color:#475569; font-size:14px; line-height: 1.6; margin:0 0 24px 0;">
                  Hemos confirmado tu pedido con éxito. Nuestro equipo en Panamá se encuentra preparando y programando la tecnología NFC de tus dispositivos para potenciar las reseñas de tu negocio.
                </p>

                <!-- Detalle de Productos -->
                <div style="margin-bottom: 24px;">
                  <div style="font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                    📋 Resumen de la Orden
                  </div>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; background-color:#fafafa; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0;">
                    <thead>
                      <tr style="background-color:#0f172a; color:#ffffff;">
                        <th style="padding: 12px 16px; text-align:left; font-size:11px; text-transform:uppercase; font-weight:800; letter-spacing: 0.5px;">Producto / Especificación</th>
                        <th style="padding: 12px 16px; text-align:right; font-size:11px; text-transform:uppercase; font-weight:800; letter-spacing: 0.5px;">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                </div>

                <!-- Totales -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px; background-color: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0;">
                  <tr>
                    <td style="font-size:13px; color:#64748b; padding:4px 0;">Subtotal de Productos:</td>
                    <td style="font-size:13px; color:#0f172a; font-weight:bold; text-align:right; padding:4px 0;">$${data.subtotal.toFixed(2)} USD</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px; color:#64748b; padding:4px 0;">Envío a Domicilio / Sucursal:</td>
                    <td style="font-size:13px; color:${data.shipping === 0 ? '#059669' : '#0f172a'}; font-weight:bold; text-align:right; padding:4px 0;">
                      ${data.shipping === 0 ? '✨ GRATIS (Promoción)' : `$${data.shipping.toFixed(2)} USD`}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:16px; color:#0f172a; font-weight:900; padding:10px 0 0 0; border-top: 2px solid #e2e8f0;">Total Pagado:</td>
                    <td style="font-size:20px; color:#059669; font-weight:900; text-align:right; padding:10px 0 0 0; border-top: 2px solid #e2e8f0;">
                      $${data.total.toFixed(2)} USD
                    </td>
                  </tr>
                </table>

                <!-- Ficha de Datos de Envío -->
                <div style="background-color:#f0fdf4; border:1px solid #bbf7d0; border-radius:14px; padding: 20px; margin-bottom: 24px;">
                  <h3 style="color:#166534; font-size: 13px; font-weight:900; margin:0 0 10px 0; text-transform:uppercase; letter-spacing: 0.5px;">
                    🚚 Datos de Despacho y Envío en Panamá
                  </h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #15803d; line-height: 1.6;">
                    <tr>
                      <td style="font-weight:bold; width: 140px; padding-bottom:4px;">Dirección de Entrega:</td>
                      <td style="padding-bottom:4px;">${data.address}, ${data.district}, ${data.province}</td>
                    </tr>
                    <tr>
                      <td style="font-weight:bold; padding-bottom:4px;">Teléfono WhatsApp:</td>
                      <td style="padding-bottom:4px;">${data.customerPhone}</td>
                    </tr>
                    <tr>
                      <td style="font-weight:bold; padding-bottom:4px;">Método de Pago:</td>
                      <td style="padding-bottom:4px;">
                        <span style="background-color:#dcfce7; color:#15803d; font-weight:bold; padding:2px 8px; border-radius:4px; font-size:11px;">
                          ${data.paymentMethod.toUpperCase()} (${data.paymentStatus === 'completed' || data.paymentStatus === 'aprobada' || data.paymentStatus === 'success' ? 'Aprobado ✅' : 'En proceso'})
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Botón CTA WhatsApp Directo -->
                <div style="text-align:center; margin-bottom: 24px;">
                  <a href="https://wa.me/50767134341?text=Hola%20starTAP,%20tengo%20una%20consulta%20sobre%20mi%20pedido%20%23${data.orderId}" target="_blank" style="display:inline-block; background-color:#25d366; color:#ffffff; font-size:14px; font-weight:800; padding:14px 28px; border-radius:12px; text-decoration:none; box-shadow: 0 4px 12px rgba(37,211,102,0.3);">
                    💬 Contactar Soporte WhatsApp (+507 6713-4341)
                  </a>
                </div>

                <!-- Tarjeta de Garantía starTAP -->
                <div style="background-color:#fffbeb; border:1px solid #fef08a; border-radius:14px; padding: 18px; text-align:center;">
                  <div style="color:#92400e; font-size:13px; font-weight:900; margin-bottom:4px;">
                    🛡️ Garantía de Satisfacción y Reemplazo starTAP (90 Días)
                  </div>
                  <p style="color:#b45309; font-size:12px; margin:0; line-height: 1.5;">
                    Tus tarjetas y placas NFC cuentan con garantía de chip de por vida y 90 días de soporte directo en Panamá.
                  </p>
                </div>

              </td>
            </tr>

            <!-- Footer Corporativo -->
            <tr>
              <td style="background-color:#0f172a; padding: 24px; text-align:center; border-top:1px solid #1e293b; color:#94a3b8;">
                <p style="color:#ffffff; font-size:12px; font-weight:bold; margin:0 0 6px 0;">
                  starTAP Panamá — Dispositivos Contactless NFC & QR
                </p>
                <p style="font-size:11px; margin:0 0 4px 0; color:#cbd5e1;">
                  Desarrollado y Operado por DataKorex (datakorex.com)
                </p>
                <p style="font-size:10px; margin:0; color:#64748b;">
                  Ciudad de Panamá | Arraiján | Tel: +507 6713-4341 | info@datakorex.com
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

/**
 * Genera el correo de alerta interna para el equipo de starTAP.
 */
export function buildAdminOrderEmailHtml(data: OrderEmailParams): string {
  const itemsText = data.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px; border-bottom:1px solid #e2e8f0; font-size:13px;"><strong>${i.quantity}x ${i.product_name}</strong></td>
          <td style="padding:8px; border-bottom:1px solid #e2e8f0; font-size:13px; color:#d97706; font-weight:bold;">${i.business_name || 'Sin especificar'}</td>
          <td style="padding:8px; border-bottom:1px solid #e2e8f0; font-size:13px; text-align:right;"><strong>$${(i.price * i.quantity).toFixed(2)}</strong></td>
        </tr>`
    )
    .join('');

  return `
  <div style="font-family: -apple-system, sans-serif; padding: 24px; background-color: #f8fafc; color: #0f172a;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #cbd5e1;">
      <div style="background-color: #0f172a; color: #ffffff; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 18px;">🔔 NUEVO PEDIDO RECIBIDO #${data.orderId}</h2>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #f59e0b; font-weight: bold;">Monto Total: $${data.total.toFixed(2)} USD</p>
      </div>

      <p><strong>Cliente:</strong> ${data.customerName} (&lt;${data.customerEmail}&gt;)</p>
      <p><strong>WhatsApp:</strong> <a href="https://wa.me/507${data.customerPhone.replace(/[^0-9]/g, '')}">${data.customerPhone}</a></p>
      <p><strong>Ubicación de Envío:</strong> ${data.province} - ${data.district} (${data.address})</p>
      <p><strong>Método de Pago:</strong> ${data.paymentMethod.toUpperCase()} | <strong>Estado:</strong> ${data.paymentStatus}</p>

      <h3 style="margin-top: 20px; font-size: 14px; text-transform: uppercase; color: #64748b;">Productos a Grabar y Preparar:</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f1f5f9; text-align: left; font-size: 11px; text-transform: uppercase;">
            <th style="padding: 8px;">Producto</th>
            <th style="padding: 8px;">Negocio en Grabado</th>
            <th style="padding: 8px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsText}
        </tbody>
      </table>

      <div style="background-color: #dcfce7; border: 1px solid #86efac; padding: 12px; border-radius: 8px; font-weight: bold; color: #166534; font-size: 13px;">
        ✅ Acción Requerida: Verificar grabado de negocio y coordinar despacho vía Uno Express / Servientrega.
      </div>
    </div>
  </div>
  `;
}
