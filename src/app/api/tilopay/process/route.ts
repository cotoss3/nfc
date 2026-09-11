import { NextRequest, NextResponse } from 'next/server';
import { createTilopayPayment } from '@/lib/tilopay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      province,
      district,
      address,
      total,
      orderNumber: clientOrderNumber
    } = body;

    if (!name || !email || !total) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos obligatorios para procesar el pago.' },
        { status: 400 }
      );
    }

    const orderNumber = clientOrderNumber || `STP-${Date.now().toString().slice(-8)}`;

    // Build absolute callback URL
    const host = req.headers.get('host') || 'startap.com.pa';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    const redirectUrl = `${baseUrl}/api/tilopay/callback`;

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'StarTAP';

    const paymentRes = await createTilopayPayment({
      orderNumber,
      amount: Number(total),
      billToFirstName: firstName,
      billToLastName: lastName,
      billToEmail: email,
      billToTelephone: phone || '67134341',
      billToAddress: address || 'Panamá',
      billToAddress2: district || '',
      billToCity: province || 'Panamá',
      billToState: 'PA-8',
      billToCountry: 'PA',
      redirectUrl,
    });

    if (paymentRes.url) {
      return NextResponse.json({
        success: true,
        redirectUrl: paymentRes.url,
        orderNumber,
      });
    } else {
      return NextResponse.json(
        { success: false, error: paymentRes.message || 'No se recibió la URL de pago de Tilopay.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[TILOPAY_PROCESS_ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno al comunicarse con Tilopay.' },
      { status: 500 }
    );
  }
}
