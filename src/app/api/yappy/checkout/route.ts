import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { orderNumber, total, name, email, phone } = await req.json();

    if (!orderNumber || !total) {
      return NextResponse.json({ success: false, error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    const merchantId = process.env.YAPPY_MERCHANT_ID;
    const domain = process.env.NEXT_PUBLIC_SITE_URL || 'https://startap.com.pa';

    if (!merchantId) {
      console.warn('YAPPY_MERCHANT_ID no está configurado en .env');
      return NextResponse.json({ success: false, error: 'Yappy no está configurado' }, { status: 500 });
    }

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
      console.error('[Yappy Validate Error]', validateData);
      return NextResponse.json({ success: false, error: 'Error al validar comercio en Yappy' }, { status: 500 });
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
        aliasYappy: phone ? phone.replace(/[^0-9]/g, '').slice(0, 8) : undefined, // Número panameño (opcional)
        ipnUrl: `${domain}/api/yappy/callback`,
        discount: "0.00",
        taxes: "0.00",
        subtotal: total.toFixed(2),
        total: total.toFixed(2)
      })
    });

    const orderData = await createOrderRes.json();

    if (!orderData?.body?.transactionId || !orderData?.body?.documentName) {
      console.error('[Yappy Create Order Error]', orderData);
      return NextResponse.json({ success: false, error: 'Error al crear orden en Yappy' }, { status: 500 });
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
