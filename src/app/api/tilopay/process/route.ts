import { NextRequest, NextResponse } from 'next/server';
import { createTilopayPayment } from '@/lib/tilopay';
import { calcularTotal, type ItemEntrada } from '@/lib/checkout-total';

/**
 * Pagina alojada de Tilopay (redireccion). Se deja como respaldo del
 * SDK: si el SDK no carga o el comercio prefiere la pagina de Tilopay,
 * este endpoint sigue devolviendo la URL de la pasarela.
 */
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
      items,
      shippingMethod,
      total: totalCliente,
      orderNumber: clientOrderNumber,
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos obligatorios para procesar el pago.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'El pedido no tiene productos.' },
        { status: 400 }
      );
    }

    // Monto autoritativo: se calcula aquí, nunca se toma del navegador.
    let subtotal: number;
    let envio: number;
    let total: number;
    try {
      const calculo = await calcularTotal(items as ItemEntrada[], String(shippingMethod || 'local'));
      subtotal = calculo.subtotal;
      envio = calculo.envio;
      total = calculo.total;
    } catch (e: any) {
      console.error('[TILOPAY_CALCULO_TOTAL_ERROR]', e);
      return NextResponse.json(
        { success: false, error: e?.message || 'No pudimos calcular el total del pedido.' },
        { status: 400 }
      );
    }

    if (total <= 0) {
      return NextResponse.json(
        { success: false, error: 'El monto del pedido no es válido.' },
        { status: 400 }
      );
    }

    // Mismo criterio que en sdk-session: si no coincide, no se cobra.
    if (totalCliente !== undefined && Math.abs(Number(totalCliente) - total) > 0.01) {
      console.error(
        `[TILOPAY_TOTAL_MISMATCH] cliente=${totalCliente} servidor=${total} subtotal=${subtotal} envio=${envio}`
      );
      return NextResponse.json(
        {
          success: false,
          error:
            'El monto del pedido no coincide con nuestro catálogo. No cobramos nada. Vuelve a cargar el carrito o escríbenos por WhatsApp.',
        },
        { status: 409 }
      );
    }

    const orderNumber = clientOrderNumber || `STP-${Date.now().toString().slice(-8)}`;

    const host = req.headers.get('host') || 'startap.com.pa';
    const protocol =
      req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    const redirectUrl = `${baseUrl}/api/tilopay/callback`;

    const nameParts = String(name).trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'StarTAP';

    const paymentRes = await createTilopayPayment({
      orderNumber,
      amount: total,
      billToFirstName: firstName,
      billToLastName: lastName,
      billToEmail: email,
      billToTelephone: phone || '64839004',
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
        subtotal,
        envio,
        total,
      });
    }

    return NextResponse.json(
      { success: false, error: paymentRes.message || 'No se recibió la URL de pago de Tilopay.' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('[TILOPAY_PROCESS_ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno al comunicarse con Tilopay.' },
      { status: 500 }
    );
  }
}
