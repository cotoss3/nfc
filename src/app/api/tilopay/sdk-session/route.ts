import { NextRequest, NextResponse } from 'next/server';
import { getTilopaySdkToken } from '@/lib/tilopay';
import { calcularTotal, type ItemEntrada } from '@/lib/checkout-total';

/**
 * Abre una sesion de pago para el SDK V2 de Tilopay.
 *
 * Devuelve al navegador solo tres cosas: el token del SDK (vida 1 hora),
 * el monto autoritativo calculado aqui y el numero de orden. Ni apiuser,
 * ni password, ni la key salen del servidor.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, shippingMethod, couponCode, total: totalCliente, orderNumber: clientOrderNumber } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'El pedido no tiene productos.' },
        { status: 400 }
      );
    }

    const { subtotal, envio, total } = await calcularTotal(
      items as ItemEntrada[],
      String(shippingMethod || 'local'),
      couponCode ? String(couponCode) : undefined
    );

    if (total <= 0) {
      return NextResponse.json(
        { success: false, error: 'El monto del pedido no es válido.' },
        { status: 400 }
      );
    }

    // Si el navegador y el servidor no coinciden, NO se cobra.
    if (totalCliente !== undefined && Math.abs(Number(totalCliente) - total) > 0.05) {
      console.error(
        `[TILOPAY_TOTAL_MISMATCH] cliente=${totalCliente} servidor=${total} subtotal=${subtotal} envio=${envio} cupon=${couponCode}`
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

    const { token, key } = await getTilopaySdkToken();

    return NextResponse.json({
      success: true,
      token,
      key,
      orderNumber,
      subtotal,
      envio,
      // El navegador se lo pasa a Tilopay.Init(). Al volver, el callback
      // confirma contra /consult: el monto real lo dice Tilopay, no el cliente.
      amount: total,
      redirect: `${baseUrl}/api/tilopay/callback`,
    });
  } catch (error: any) {
    console.error('[TILOPAY_SDK_SESSION_ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno al comunicarse con Tilopay.' },
      { status: 500 }
    );
  }
}
