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

    let subtotal: number;
    let envio: number;
    let calculatedTotal: number;
    try {
      const calculo = await calcularTotal(
        items as ItemEntrada[],
        String(shippingMethod || 'local'),
        couponCode ? String(couponCode) : undefined
      );
      subtotal = calculo.subtotal;
      envio = calculo.envio;
      calculatedTotal = calculo.total;
    } catch (e: any) {
      console.error('[TILOPAY_CALCULO_TOTAL_ERROR]', e);
      return NextResponse.json(
        { success: false, error: e?.message || 'No pudimos calcular el total del pedido.' },
        { status: 400 }
      );
    }

    if (calculatedTotal <= 0) {
      return NextResponse.json(
        { success: false, error: 'El monto del pedido no es válido.' },
        { status: 400 }
      );
    }

    // Validación de Integridad Financiera: si el cliente envía un total que difiere del catálogo, rechazar
    if (totalCliente !== undefined && Math.abs(Number(totalCliente) - calculatedTotal) > 0.05) {
      console.error(
        `[TILOPAY_PRICE_TAMPERING_BLOCKED] cliente=${totalCliente} servidor=${calculatedTotal} subtotal=${subtotal} envio=${envio} cupon=${couponCode}`
      );
      return NextResponse.json(
        {
          success: false,
          error: 'El monto del pedido no coincide con nuestro catálogo oficial. Vuelve a cargar el carrito o contáctanos por WhatsApp.',
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
      // confirma contra /consult: el monto real lo calcula el servidor.
      amount: calculatedTotal,
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
