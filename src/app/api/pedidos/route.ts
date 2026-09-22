import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calcularTotal, type ItemEntrada } from '@/lib/checkout-total';
import { getProductById } from '@/config/products';

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

/**
 * Cuantos tags de cada tipo consume el pedido.
 * - Pack Trio: 1 placa (STT-) + 2 tarjetas (STTT-) por unidad.
 * - Tarjeta de bolsillo: 1 tarjeta (STTT-) por unidad.
 * - Resto (placa de mostrador, stand): 1 placa (STT-) por unidad.
 */
function contarTagsNecesarios(items: any[]): { placas: number; tarjetas: number } {
  let placas = 0;
  let tarjetas = 0;

  for (const item of items || []) {
    const pId = String(item?.product_id || item?.id || '').toLowerCase();
    const pName = String(item?.product_name || item?.name || '').toLowerCase();
    const qty = Number(item?.quantity || 1) || 1;

    const producto = getProductById(pId);
    const canonico = (producto?.id || pId).toLowerCase();

    // Mapa explicito producto -> tipo de tag fisico. Es explicito a proposito:
    // de esto depende QUE placa o QUE tarjeta se le manda al cliente, y una
    // heuristica por substring se rompe en silencio al anadir un producto.
    const esPack = Boolean(producto?.isPack) || canonico.includes('pack');
    const esTarjetaBolsillo =
      canonico === 'tarjeta-nfc-bolsillo' ||
      canonico.includes('tarjeta') ||
      canonico.includes('llavero') ||
      (!canonico && pName.includes('tarjeta'));

    if (esPack) {
      placas += 1 * qty;
      tarjetas += 2 * qty;
    } else if (esTarjetaBolsillo) {
      tarjetas += 1 * qty;
    } else {
      placas += 1 * qty;
    }
  }

  return { placas, tarjetas };
}

/**
 * Asigna tags que YA existen en stock. Nunca inventa codigos.
 * El update lleva la condicion `claimed = false` para que dos pedidos
 * simultaneos no se lleven el mismo tag: si vuelve vacio, lo gano otro pedido.
 * Devuelve los codigos que si consiguio.
 */
async function asignarTags(
  admin: any,
  prefijo: 'STT-' | 'STTT-',
  cantidad: number,
  orderId: string,
  ownerName: string,
  ownerEmail: string
): Promise<string[]> {
  if (cantidad <= 0) return [];

  const asignados: string[] = [];
  // Se piden de mas por si algun candidato lo gana otro pedido mientras tanto.
  const { data: candidatos, error } = await admin
    .from('nfc_cards')
    .select('card_id')
    .like('card_id', `${prefijo}%`)
    .eq('claimed', false)
    .order('card_id', { ascending: true })
    .limit(cantidad * 3);

  if (error) {
    console.error('[PEDIDOS_TAGS] No se pudieron leer los tags libres', error);
    return [];
  }

  for (const candidato of (candidatos || [])) {
    if (asignados.length >= cantidad) break;
    const codigo = String(candidato.card_id);

    // El prefijo STT- tambien casa con STTT-: hay que descartarlos a mano.
    if (prefijo === 'STT-' && codigo.toUpperCase().startsWith('STTT-')) continue;

    const { data: actualizado, error: errUpd } = await admin
      .from('nfc_cards')
      .update({
        estado: 'asignado',
        claimed: true,
        is_active: false,
        order_id: orderId,
        owner_name: ownerName,
        owner_email: ownerEmail,
      })
      .eq('card_id', codigo)
      .eq('claimed', false)
      .select();

    if (errUpd) {
      console.error('[PEDIDOS_TAGS] Error asignando el tag', codigo, errUpd);
      continue;
    }
    // Vacio = otro pedido se lo llevo primero. Se salta y se prueba el siguiente.
    if (actualizado && actualizado.length > 0) {
      asignados.push(codigo);
    }
  }

  return asignados;
}

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

    // --- Asignacion de tags en stock (nunca se inventan codigos) ---
    const necesarios = contarTagsNecesarios(items);
    const ownerName = String(cliente.name || '');
    const ownerEmail = String(cliente.email || '').trim().toLowerCase();

    const placasAsignadas = await asignarTags(admin, 'STT-', necesarios.placas, String(orderNumber), ownerName, ownerEmail);
    const tarjetasAsignadas = await asignarTags(admin, 'STTT-', necesarios.tarjetas, String(orderNumber), ownerName, ownerEmail);

    const tagsAsignados = [...placasAsignadas, ...tarjetasAsignadas];
    const tagsPendientes =
      (necesarios.placas - placasAsignadas.length) + (necesarios.tarjetas - tarjetasAsignadas.length);

    // Si no alcanzan los tags el pedido NO falla: queda con tags pendientes.
    if (tagsPendientes > 0) {
      console.warn(`[PEDIDOS_TAGS_PENDIENTES] orderNumber=${orderNumber} faltan=${tagsPendientes}`);
    }

    const { error: errPendientes } = await admin
      .from('orders')
      .update({ tags_pendientes: tagsPendientes })
      .eq('id', String(orderNumber));

    if (errPendientes) {
      console.error('[PEDIDOS_TAGS] No se pudo guardar tags_pendientes', errPendientes);
    }

    return NextResponse.json({ success: true, orderNumber, tagsAsignados, tagsPendientes });
  } catch (error: any) {
    console.error('[PEDIDOS_ERROR]', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error interno al registrar el pedido.' },
      { status: 500 }
    );
  }
}
