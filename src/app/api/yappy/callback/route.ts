import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbLocal, supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    const hash = searchParams.get('hash');
    const domain = searchParams.get('domain');

    const CLAVE_SECRETA = (process.env.YAPPY_SECRET_KEY || '').trim().replace(/['"]/g, '');

    if (!CLAVE_SECRETA) {
      console.error('[YAPPY_IPN] YAPPY_SECRET_KEY no está configurada');
      return NextResponse.json({ success: false, error: 'Configuración de YAPPY_SECRET_KEY faltante en el servidor' }, { status: 500 });
    }

    if (!orderId || !status || !hash || !domain) {
      return NextResponse.json({ success: false, error: 'Parámetros faltantes' });
    }

    // Validar hash
    const values = Buffer.from(CLAVE_SECRETA, 'base64').toString('utf-8');
    const secrete = values.split('.');

    const signature = crypto.createHmac('sha256', secrete[0])
                            .update(orderId + status + domain)
                            .digest('hex');

    const success = hash === signature;

    if (success) {
      console.log(`[YAPPY_IPN] Orden ${orderId} validada. Estado recibido de Yappy: ${status}`);
      
      // status = 'E' (Ejecutado), 'R' (Rechazado), 'C' (Cancelado), 'X' (Expirado)
      if (status === 'E') {
        dbLocal.updateOrderDetails(orderId, {
          payment_status: 'completed',
          status: 'processing'
        });
        if (supabase) {
          // Yappy devuelve el id limpio (STP12345678) pero el pedido se guarda
          // como STP-12345678: se busca por ambas columnas para tolerar los dos.
          let idReal: string | null = null;
          const { data: encontrados } = await supabase
            .from('orders')
            .select('id')
            .or(`yappy_order_id.eq.${orderId},id.eq.${orderId}`)
            .limit(1);

          if (encontrados && encontrados.length > 0) {
            idReal = String(encontrados[0].id);
          }

          const { data: actualizados, error: errorUpdate } = idReal
            ? await supabase.from('orders').update({
                payment_status: 'completed',
                status: 'processing'
              }).eq('id', idReal).select()
            : { data: [] as any[], error: null };

          if (errorUpdate) {
            console.error(`[YAPPY_IPN_ERROR_UPDATE] orderId=${orderId}`, errorUpdate);
          }

          if (!actualizados || actualizados.length === 0) {
            console.error(`[YAPPY_IPN_SIN_COINCIDENCIA] orderId=${orderId}`);
          }
        }
        console.log(`[YAPPY_IPN] Orden ${orderId} marcada exitosamente como pagada (completed)`);
      }
    } else {
      console.warn(`[YAPPY_IPN] Hash inválido para orden ${orderId}`);
    }

    return NextResponse.json({ success });

  } catch (error: any) {
    console.error('[YAPPY_IPN_ERROR]', error);
    return NextResponse.json({ success: false });
  }
}
