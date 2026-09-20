import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calcularTotal, type ItemEntrada } from '@/lib/checkout-total';

/**
 * Registra el pedido en el servidor ANTES de iniciar el pago.
 *
 * Antes el pedido solo vivia en el localStorage del navegador: si el cliente
 * cerraba la pestana, el pedido no existia para nadie. Aqui se guarda en
 * Supabase con la llave service_role y con el total recalculado en servidor.
 */

export const dynamic = 'force-dynamic';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!url || !serviceKey) {
      console.error('[PEDIDOS] Falta NEXT_PUBLIC_SUPABASE_URL o llave de Supabase.');
      return NextResponse.json(
        {
          success: false,
          error: 'El servidor no tiene configurada la llave de Supabase (SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY). No se puede registrar el pedido.',
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      orderNumber,
      items,
      shippingMethod,
      couponCode,
      customer,
      paymentMethod,
      yappyOrderId,
    } = body || {};

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: 'Falta el numero de orden.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'El pedido no tiene productos.' },
        { status: 400 }
      );
    }

    // Validar disponibilidad de inventario en servidor
    const { dbLocal } = await import('@/lib/db');
    const stockCheck = dbLocal.validateOrderItemsStock(items);
    if (!stockCheck.valid) {
      return NextResponse.json(
        { success: false, error: stockCheck.message || 'Producto agotado en inventario.' },
        { status: 400 }
      );
    }

    const cliente = customer || {};

    let total: number;
    try {
      const calculo = await calcularTotal(
        items as ItemEntrada[],
        String(shippingMethod || 'local'),
        couponCode ? String(couponCode) : undefined
      );
      total = calculo.total;
    } catch (e: any) {
      console.error('[PEDIDOS_CALCULO_TOTAL_ERROR]', e);
      return NextResponse.json(
        { success: false, error: e?.message || 'No pudimos calcular el total del pedido.' },
        { status: 400 }
      );
    }

    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json(
        { success: false, error: 'El monto del pedido no es válido.' },
        { status: 400 }
      );
    }

    const admin = createClient(url, serviceKey);

    const fila: Record<string, any> = {
      id: String(orderNumber),
      customer_name: String(cliente.name || ''),
      customer_email: String(cliente.email || ''),
      customer_phone: String(cliente.phone || ''),
      shipping_province: String(cliente.province || ''),
      shipping_district: String(cliente.district || ''),
      shipping_address: String(cliente.address || ''),
      payment_method: String(paymentMethod || 'tarjeta'),
      payment_status: 'pending',
      status: 'pending',
      total: Number(total.toFixed(2)),
      items: items,
    };

    if (yappyOrderId) {
      fila.yappy_order_id = String(yappyOrderId);
    }

    const { error } = await admin.from('orders').upsert(fila, { onConflict: 'id' });

    if (error) {
      console.error('[PEDIDOS] Supabase rechazó la escritura del pedido', error);
      return NextResponse.json(
        { success: false, error: 'No se pudo registrar el pedido en el servidor.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, orderNumber });
  } catch (error: any) {
    console.error('[PEDIDOS_ERROR]', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error interno al registrar el pedido.' },
      { status: 500 }
    );
  }
}
