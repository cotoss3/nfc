import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { orderNumber, total, name, email, phone } = await req.json();

    if (!orderNumber || !total) {
      return NextResponse.json({ success: false, error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    const digits = (phone || '').replace(/[^0-9]/g, '');
    const aliasYappy = digits.length >= 8 ? digits.slice(-8) : '';

    if (!aliasYappy || aliasYappy.length !== 8) {
      return NextResponse.json({ 
        success: false, 
        error: 'Por favor ingresa tu número de celular de Panamá de 8 dígitos registrado en Yappy.' 
      }, { status: 400 });
    }

    const merchantId = process.env.YAPPY_MERCHANT_ID || '49bccdf9-4185-4732-83e0-e0cdf851b6de';
    // Yappy exige exactamente el dominio registrado en el Portal Comercial (sin barras finales o puertos locales)
    const domain = 'https://startap.com.pa';

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
    const createOrderRes = await fetch('https://apipagosbg.bgeneral.cloud/payments/payment-wc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        merchantId,
        orderId: orderNumber.replace(/[^A-Za-z0-9]/g, '').slice(0, 15), // Máximo 15 caracteres alfanuméricos
        domain,
        paymentDate: Math.floor(Date.now() / 1000), // epoch time
        aliasYappy, // Requerido obligatoriamente por Yappy (número de 8 dígitos)
        ipnUrl: `${domain}/api/yappy/callback`,
        discount: "0.00",
        taxes: "0.00",
        subtotal: total.toFixed(2),
        total: total.toFixed(2)
      })
    });

    const orderData = await createOrderRes.json();

    if (!orderData?.body?.transactionId || !orderData?.body?.documentName) {
      console.error('[Yappy Create Order Error]', JSON.stringify(orderData));
      const errorMsg = orderData?.status?.description || 'Error al generar la orden en Yappy';
      return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
    }

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
