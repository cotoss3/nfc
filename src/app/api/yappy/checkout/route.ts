import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderNumber, total, name, email, phone } = body || {};

    const numTotal = typeof total === 'number' ? total : parseFloat(total);
    if (!orderNumber || isNaN(numTotal) || numTotal <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'El total de la orden debe ser mayor a $0.00 USD.' 
      }, { status: 400 });
    }

    const digits = (phone || '').toString().replace(/[^0-9]/g, '');
    const aliasYappy = digits.length >= 8 ? digits.slice(-8) : '';

    if (!aliasYappy || aliasYappy.length !== 8) {
      return NextResponse.json({ 
        success: false, 
        error: 'Por favor ingresa tu número de celular de Panamá de 8 dígitos registrado en Yappy.' 
      }, { status: 400 });
    }

    // Sanitizar y extraer exactamente el UUID de 36 caracteres para merchantId
    // Esto previene errores si la variable de entorno en Vercel tiene texto extra, saltos de línea o concatenaciones
    const rawMerchant = process.env.YAPPY_MERCHANT_ID || '';
    const uuidMatch = rawMerchant.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    const merchantId = uuidMatch ? uuidMatch[0] : '49bccdf9-4185-4732-83e0-e0cdf851b6de';
    
    // Dominio exacto registrado en el Portal Comercial de Banco General (sin barra final)
    const domain = 'https://startap.com.pa';

    console.log('[Yappy] Validando comercio:', { merchantId, domain, rawLen: rawMerchant.length });

    // Paso 1: Validar comercio y obtener token
    const validateRes = await fetch('https://apipagosbg.bgeneral.cloud/payments/validate/merchant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchantId,
        urlDomain: domain
      })
    });

    const validateData = await validateRes.json();
    
    if (!validateData?.body?.token) {
      console.error('[Yappy Validate Error]', JSON.stringify(validateData));
      const errorMsg = validateData?.status?.description || 'Error al validar comercio en Yappy';
      return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
    }

    const token = validateData.body.token;

    // Paso 2: Crear la orden
    const cleanOrderId = (orderNumber || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 15);
    const formattedTotal = numTotal.toFixed(2);

    console.log('[Yappy] Creando orden en Yappy:', {
      merchantId,
      orderId: cleanOrderId,
      aliasYappy,
      total: formattedTotal
    });

    const createOrderRes = await fetch('https://apipagosbg.bgeneral.cloud/payments/payment-wc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        merchantId,
        orderId: cleanOrderId,
        domain,
        paymentDate: Math.floor(Date.now() / 1000), // epoch time en segundos
        aliasYappy, // Requerido: 8 dígitos panameños
        ipnUrl: `${domain}/api/yappy/callback`,
        discount: "0.00",
        taxes: "0.00",
        subtotal: formattedTotal,
        total: formattedTotal
      })
    });

    const orderData = await createOrderRes.json();

    if (!orderData?.body?.transactionId || !orderData?.body?.documentName) {
      console.error('[Yappy Create Order Error]', JSON.stringify(orderData));
      const errorMsg = orderData?.status?.description || 'Error al generar la orden en Yappy';
      return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
    }

    console.log('[Yappy] Orden creada exitosamente:', {
      transactionId: orderData.body.transactionId,
      documentName: orderData.body.documentName
    });

    return NextResponse.json({
      success: true,
      transactionId: orderData.body.transactionId,
      documentName: orderData.body.documentName,
      token: orderData.body.token,
      orderId: orderNumber
    });

  } catch (error: any) {
    console.error('[YAPPY_API_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message || 'Error interno' }, { status: 500 });
  }
}
