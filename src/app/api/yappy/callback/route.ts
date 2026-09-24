import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { dbLocal } from '@/lib/db';

/**
 * IPN del Boton de Pago Yappy (Banco General).
 *
 * Firma verificada contra la documentacion oficial:
 * https://www.yappy.com.pa/comercial/desarrolladores/boton-de-pago-yappy-nueva-integracion/
 *   HMAC-SHA256 sobre `orderId + status + domain`, con la clave secreta
 *   decodificada de base64 y partida por '.', usando la primera parte.
 *
 * Se usa la llave service_role a proposito: la tabla `orders` tiene RLS
 * activado sin politicas, asi que la llave anon no puede escribir ahi.
 */

export const dynamic = 'force-dynamic';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = url && serviceKey ? createClient(url, serviceKey) : null;

/** Estados que devuelve Yappy y a que se traduce cada uno en el pedido. */
type EstadoPago = 'completed' | 'failed';
type EstadoPedido = 'processing' | 'cancelled';

const ESTADOS: Record<string, { payment_status: EstadoPago; status: EstadoPedido; nota: string }> = {
  E: { payment_status: 'completed', status: 'processing', nota: 'Ejecutado: el cliente confirmo el pago' },
  R: { payment_status: 'failed',    status: 'cancelled',  nota: 'Rechazado: el cliente no confirmo en 5 minutos' },
  C: { payment_status: 'failed',    status: 'cancelled',  nota: 'Cancelado por el cliente en la app de Yappy' },
  X: { payment_status: 'failed',    status: 'cancelled',  nota: 'Expirado: el cliente nunca inicio el pago' },
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    const hash = searchParams.get('hash');
    const domain = searchParams.get('domain');

    const CLAVE_SECRETA = (process.env.YAPPY_SECRET_KEY || '').trim().replace(/['"]/g, '');

    if (!CLAVE_SECRETA) {
      console.error('[YAPPY_IPN] YAPPY_SECRET_KEY no esta configurada');
      return NextResponse.json(
        { success: false, error: 'Configuracion de YAPPY_SECRET_KEY faltante en el servidor' },
        { status: 500 }
      );
    }

    if (!orderId || !status || !hash || !domain) {
      return NextResponse.json({ success: false, error: 'Parametros faltantes' });
    }

    const values = Buffer.from(CLAVE_SECRETA, 'base64').toString('utf-8');
    const secrete = values.split('.');

    const signature = crypto
      .createHmac('sha256', secrete[0])
      .update(orderId + status + domain)
      .digest('hex');

    // Comparacion en tiempo constante: evita filtrar la firma por temporizacion.
    const iguales =
      hash.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));

    if (!iguales) {
      console.warn(`[YAPPY_IPN] Hash invalido para orden ${orderId}`);
      return NextResponse.json({ success: false });
    }

    const destino = ESTADOS[status];
    if (!destino) {
      console.warn(`[YAPPY_IPN] Estado desconocido "${status}" para orden ${orderId}`);
      return NextResponse.json({ success: true });
    }

    console.log(`[YAPPY_IPN] Orden ${orderId} validada. ${destino.nota}`);

    // dbLocal (legado) no conoce el estado 'failed'; ahi un pago no completado
    // se queda en 'pending' y lo que manda es el `status: cancelled`.
    dbLocal.updateOrderDetails(orderId, {
      payment_status: destino.payment_status === 'completed' ? 'completed' : 'pending',
      status: destino.status,
    });

    if (!admin) {
      console.error('[YAPPY_IPN] Falta SUPABASE_SERVICE_ROLE_KEY: el pedido no se pudo actualizar en la base.');
      return NextResponse.json({ success: true });
    }

    // Yappy devuelve el id limpio (STP12345678) pero el pedido puede estar
    // guardado como STP-12345678: se busca por ambas columnas.
    const { data: encontrados, error: errorBusqueda } = await admin
      .from('orders')
      .select('id')
      .or(`yappy_order_id.eq.${orderId},id.eq.${orderId}`)
      .limit(1);

    if (errorBusqueda) {
      console.error(`[YAPPY_IPN_ERROR_BUSQUEDA] orderId=${orderId}`, errorBusqueda);
      return NextResponse.json({ success: true });
    }

    if (!encontrados || encontrados.length === 0) {
      console.error(`[YAPPY_IPN_SIN_COINCIDENCIA] orderId=${orderId} estado=${status}`);
      return NextResponse.json({ success: true });
    }

    const idReal = String(encontrados[0].id);

    if (destino.status === 'cancelled') {
      try {
        dbLocal.liberarTagsYRevertirStock(orderId);
      } catch (errLiberar) {
        console.error('[YAPPY_IPN_ERROR_LIBERAR_STOCK]', errLiberar);
      }
    }

    const { data: actualizados, error: errorUpdate } = await admin
      .from('orders')
      .update({ payment_status: destino.payment_status, status: destino.status })
      .eq('id', idReal)
      .select();

    if (errorUpdate) {
      console.error(`[YAPPY_IPN_ERROR_UPDATE] orderId=${orderId} id=${idReal}`, errorUpdate);
    } else if (!actualizados || actualizados.length === 0) {
      console.error(`[YAPPY_IPN_SIN_COINCIDENCIA] orderId=${orderId} id=${idReal}`);
    } else {
      console.log(`[YAPPY_IPN] Orden ${idReal} -> ${destino.payment_status}/${destino.status}`);
    }

    if (destino.status === 'cancelled') {
      await admin.from('nfc_cards').update({
        claimed: false,
        estado: 'en_stock',
        order_id: null,
        is_active: false,
        owner_id: 'unassigned',
        owner_name: 'Sin Asignar (Stock)',
        owner_email: 'admin@startap.com.pa'
      }).eq('order_id', idReal);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[YAPPY_IPN_ERROR]', error);
    return NextResponse.json({ success: false });
  }
}
