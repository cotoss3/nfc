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
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a;">
          <strong>${item.quantity}x ${item.product_name}</strong><br/>
          <span style="font-size: 11px; color: #64748b;">
            ${item.selected_color ? `Acabado: ${item.selected_color}` : ''}
            ${item.business_name ? ` • Negocio: <strong>${item.business_name}</strong>` : ''}
            ${item.has_custom_logo ? ` • Logo (+ $5.00)` : ''}
            ${item.has_qr_code ? ` • Código QR (+ $3.00)` : ''}
          </span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: bold; color: #0f172a; text-align: right;">
          $${(item.price * item.quantity).toFixed(2)} USD
        </td>
      </tr>
    `
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Pedido - starTAP Panamá</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc; padding: 24px 12px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            
            <!-- Header Banner -->
            <tr>
              <td style="background-color:#020617; padding: 28px 24px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">
                  starTAP<span style="color:#f59e0b;">.</span>
                </h1>
                <p style="color:#94a3b8; font-size:12px; margin:4px 0 0 0; font-weight:bold; text-transform:uppercase; letter-spacing:1px;">
                  Confirmación de Pedido #${data.orderId}
                </p>
              </td>
            </tr>

            <!-- Content Body -->
            <tr>
              <td style="padding: 32px 24px;">
                <h2 style="color:#0f172a; font-size: 18px; font-weight: 800; margin:0 0 12px 0;">
                  ¡Gracias por tu compra, ${data.customerName}!
                </h2>
                <p style="color:#475569; font-size:14px; line-height: 1.6; margin:0 0 24px 0;">
                  Hemos recibido tu pedido correctamente. Nuestro equipo ya está preparando y programando tus dispositivos NFC con la ficha de tu negocio en Panamá.
                </p>

                <!-- Order Summary Table -->
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-bottom: 24px; background-color:#f8fafc; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0;">
                  <thead>
                    <tr style="background-color:#0f172a; color:#ffffff;">
                      <th style="padding: 10px 12px; text-align:left; font-size:11px; text-transform:uppercase; font-weight:bold;">Producto / Especificación</th>
                      <th style="padding: 10px 12px; text-align:right; font-size:11px; text-transform:uppercase; font-weight:bold;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>

                <!-- Totals Summary -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                  <tr>
                    <td style="font-size:13px; color:#64748b; padding:4px 0;">Subtotal:</td>
                    <td style="font-size:13px; color:#0f172a; font-weight:bold; text-align:right; padding:4px 0;">$${data.subtotal.toFixed(2)} USD</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px; color:#64748b; padding:4px 0;">Envío:</td>
                    <td style="font-size:13px; color:${data.shipping === 0 ? '#059669' : '#0f172a'}; font-weight:bold; text-align:right; padding:4px 0;">
                      ${data.shipping === 0 ? 'GRATIS' : `$${data.shipping.toFixed(2)} USD`}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:15px; color:#0f172a; font-weight:900; padding:8px 0; border-top: 2px solid #e2e8f0;">Total Final:</td>
                    <td style="font-size:18px; color:#0f172a; font-weight:900; text-align:right; padding:8px 0; border-top: 2px solid #e2e8f0;">$${data.total.toFixed(2)} USD</td>
                  </tr>
                </table>

                <!-- Delivery Details Card -->
                <div style="background-color:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding: 16px; margin-bottom: 24px;">
                  <h3 style="color:#166534; font-size: 13px; font-weight:800; margin:0 0 8px 0; text-transform:uppercase;">
                    📦 Datos de Despacho y Entrega
                  </h3>
                  <p style="color:#15803d; font-size: 13px; margin: 0; line-height: 1.5;">
                    <strong>Dirección:</strong> ${data.address}, ${data.district}, ${data.province}<br/>
                    <strong>Teléfono WhatsApp:</strong> ${data.customerPhone}<br/>
                    <strong>Método de Pago:</strong> ${data.paymentMethod.toUpperCase()} (${data.paymentStatus === 'completed' ? 'Pagado' : 'Pendiente de verificación'})
                  </p>
                </div>

                <!-- Guarantee Seal -->
                <div style="background-color:#fffbeb; border:1px solid #fef08a; border-radius:12px; padding: 16px; text-align:center;">
                  <p style="color:#92400e; font-size:12px; font-weight:bold; margin:0 0 4px 0;">
                    🛡️ Incluye Garantía starTAP de 90 Días
                  </p>
                  <p style="color:#b45309; font-size:11px; margin:0;">
                    Cualquier fallo de chip o reemplazo se gestiona directamente a nuestro WhatsApp oficial: <strong>+507 6713-4341</strong>
                  </p>
                </div>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f1f5f9; padding: 20px 24px; text-align:center; border-top:1px solid #e2e8f0;">
                <p style="color:#64748b; font-size:11px; margin:0 0 4px 0;">
                  starTAP Panamá — Marca registrada de DataKorex
                </p>
                <p style="color:#94a3b8; font-size:10px; margin:0;">
                  Arraiján, Panamá Oeste | Envíos a todo el país | info@datakorex.com
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
    .map((i) => `• ${i.quantity}x ${i.product_name} (${i.business_name || 'Sin nombre'}) - $${(i.price * i.quantity).toFixed(2)}`)
    .join('<br/>');

  return `
  <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
    <h2 style="color: #0f172a;">🔔 ¡Nuevo Pedido Recibido en starTAP!</h2>
    <p><strong>N° de Orden:</strong> ${data.orderId}</p>
    <p><strong>Cliente:</strong> ${data.customerName} (${data.customerEmail})</p>
    <p><strong>Teléfono:</strong> ${data.customerPhone}</p>
    <p><strong>Provincia / Dirección:</strong> ${data.province} - ${data.district} (${data.address})</p>
    <p><strong>Método de Pago:</strong> ${data.paymentMethod.toUpperCase()} | <strong>Estado:</strong> ${data.paymentStatus}</p>
    <hr/>
    <h3>Productos:</h3>
    <p>${itemsText}</p>
    <h3 style="color: #059669;">Total: $${data.total.toFixed(2)} USD</h3>
  </div>
  `;
}
