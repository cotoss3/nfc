import { NextRequest, NextResponse } from 'next/server';
import { createTilopayPayment } from '@/lib/tilopay';
import { getProductById } from '@/config/products';
import { calculateShippingCost } from '@/config/shipping';

/** Extras que el cliente puede añadir en la landing de producto */
const PRECIO_LOGO = 5;
const PRECIO_QR = 3;

interface ItemEntrada {
  product_id?: string;
  quantity?: number;
  has_custom_logo?: boolean;
  has_qr_code?: boolean;
}

/**
 * Recalcula el total en el servidor a partir del catálogo.
 * El monto que manda el navegador NO se usa para cobrar: solo se compara.
 */
function calcularTotal(items: ItemEntrada[], shippingMethod: string) {
  let subtotal = 0;
  let hasPack = false;

  for (const item of items) {
    const product = getProductById(String(item.product_id || ''));
    if (!product) {
      throw new Error(`Producto no reconocido en el pedido: ${item.product_id}`);
    }

    const cantidad = Math.max(1, Math.min(500, Number(item.quantity) || 1));
    if (product.isPack) hasPack = true;

    const extras =
      (item.has_custom_logo ? PRECIO_LOGO : 0) + (item.has_qr_code ? PRECIO_QR : 0);

    subtotal += (product.price + extras) * cantidad;
  }

  const envio = calculateShippingCost(subtotal, shippingMethod, hasPack);
  return { subtotal, envio, total: Number((subtotal + envio).toFixed(2)) };
}

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
    const { subtotal, envio, total } = calcularTotal(items, String(shippingMethod || 'local'));

    if (total <= 0) {
      return NextResponse.json(
        { success: false, error: 'El monto del pedido no es válido.' },
        { status: 400 }
      );
    }

    // Si el navegador mandó otro número, se registra y se sigue con el del servidor.
    if (totalCliente !== undefined && Math.abs(Number(totalCliente) - total) > 0.01) {
      console.warn(
        `[TILOPAY_TOTAL_MISMATCH] cliente=${totalCliente} servidor=${total} subtotal=${subtotal} envio=${envio}`
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
