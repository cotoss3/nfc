import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbLocal } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    const hash = searchParams.get('hash');
    const domain = searchParams.get('domain');

    const CLAVE_SECRETA = process.env.YAPPY_SECRET_KEY;

    if (!CLAVE_SECRETA) {
      console.error('[YAPPY_IPN] YAPPY_SECRET_KEY no está configurada');
      return NextResponse.json({ success: false, error: 'Configuración faltante' });
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
      console.log(`[YAPPY_IPN] Orden ${orderId} validada. Estado: ${status}`);
      
      // status = 'E' (Ejecutado), 'R' (Rechazado), 'C' (Cancelado), 'X' (Expirado)
      if (status === 'E') {
        const order = dbLocal.getOrderById(orderId);
        if (order) {
           dbLocal.updateOrderDetails(orderId, {
             payment_status: 'completed',
             status: 'processing'
           });
           console.log(`[YAPPY_IPN] Orden ${orderId} marcada como pagada`);
        }
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
