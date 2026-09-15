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
  <html>
  <head>
    <meta charset="utf-8">
    <title>Solicitud de Cotización Corporativa - starTAP</title>
  </head>
  <body style="font-family: sans-serif; background-color: #f8fafc; padding: 24px; color: #0f172a;">
    <table width="100%" max-width="600" style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; padding:24px; border:1px solid #cbd5e1;">
      <tr style="background:#0f172a; color:#ffffff; padding:16px;">
        <td style="padding:16px; border-radius:8px;">
          <h2 style="margin:0; font-size:20px;">💼 Cotización B2B Solicitada</h2>
          <p style="margin:4px 0 0 0; font-size:12px; color:#94a3b8;">starTAP Panamá Corporativo</p>
        </td>
      </tr>
      <tr>
        <td style="padding-top:20px;">
          <p><strong>Empresa / Local:</strong> ${data.businessName}</p>
          <p><strong>Contacto:</strong> ${data.name} (${data.email})</p>
          <p><strong>Teléfono / WhatsApp:</strong> ${data.phone}</p>
          <hr style="border:none; border-top:1px solid #e2e8f0; margin:16px 0;" />
          <p><strong>Producto:</strong> ${data.productType}</p>
          <p><strong>Cantidad:</strong> ${data.quantity} unidades</p>
          <p><strong>Descuento por Volumen:</strong> ${data.discountPercent}% OFF</p>
          <h3 style="color:#059669; font-size:18px; margin-top:8px;">Estimado Total: $${data.totalEstimated.toFixed(2)} USD</h3>
          ${data.message ? `<p><strong>Mensaje adicional:</strong> ${data.message}</p>` : ''}
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}
