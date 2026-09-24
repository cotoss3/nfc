const { createClient } = require('@supabase/supabase-js');

const url = 'https://xnepnlaoiflngtikozqd.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuZXBubGFvaWZsbmd0aWtvenFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODc4NDI4NiwiZXhwIjoyMTA0MzYwMjg2fQ.VedI_FsJMBU1X1HSeJQxd4hXoRYVRxyJ_OU1eXp_q_w';
const supabase = createClient(url, key);

async function syncUserActivations() {
  console.log('--- 1. Actualizando nfc_cards en Supabase ---');
  
  // 1. STTS-1051 -> Venta de $50
  const orderId50 = 'PED-VISITA-STTS1051';
  const { error: err1 } = await supabase
    .from('nfc_cards')
    .update({
      tipo_activacion: 'venta',
      precio_venta: 50,
      claimed: true,
      estado: 'configurado',
      order_id: orderId50,
      is_active: true
    })
    .eq('card_id', 'STTS-1051');
  console.log('Update STTS-1051 ($50):', err1 || 'OK');

  // 2. STTT-1003 -> Prueba $0
  const orderId0_1 = 'PED-VISITA-STTT1003';
  const { error: err2 } = await supabase
    .from('nfc_cards')
    .update({
      tipo_activacion: 'prueba',
      precio_venta: 0,
      claimed: true,
      estado: 'configurado',
      order_id: orderId0_1,
      is_active: true
    })
    .eq('card_id', 'STTT-1003');
  console.log('Update STTT-1003 ($0):', err2 || 'OK');

  // 3. STTT-1004 -> Prueba $0
  const orderId0_2 = 'PED-VISITA-STTT1004';
  const { error: err3 } = await supabase
    .from('nfc_cards')
    .update({
      tipo_activacion: 'prueba',
      precio_venta: 0,
      claimed: true,
      estado: 'configurado',
      order_id: orderId0_2,
      is_active: true
    })
    .eq('card_id', 'STTT-1004');
  console.log('Update STTT-1004 ($0):', err3 || 'OK');

  console.log('\n--- 2. Creando Órdenes en la tabla orders de Supabase ---');

  const ordersToInsert = [
    {
      id: orderId50,
      customer_name: 'Cliente Visita Presencial (Stant STTS-1051)',
      customer_email: 'venta.visita@startap.com.pa',
      customer_phone: '6483-9004',
      shipping_province: 'Panamá',
      shipping_district: 'Venta Presencial',
      shipping_address: 'Stant - Activación en Campo',
      payment_method: 'presencial',
      payment_status: 'completed',
      status: 'delivered',
      canal: 'visita',
      total: 50.00,
      admin_notes: 'Venta comercial en visita presencial con TAG STTS-1051 por $50.00 USD',
      items: [
        {
          id: 'item-STTS-1051',
          product_id: 'stand-nfc-mesa',
          product_name: 'Stand NFC de Mesa',
          quantity: 1,
          price: 50.00,
          business_name: 'Stant',
          initial_redirect_url: 'https://search.google.com/local/writereview?placeid=ChIJkag-znaZrI8RH8OQEHwhcFE'
        }
      ],
      created_at: '2026-09-22T23:46:16.361Z'
    },
    {
      id: orderId0_1,
      customer_name: 'Muestra / Prueba (STTT-1003)',
      customer_email: 'prueba.visita@startap.com.pa',
      customer_phone: '6483-9004',
      shipping_province: 'Panamá',
      shipping_district: 'Venta Presencial',
      shipping_address: 'Prueba / Demo en Campo',
      payment_method: 'presencial',
      payment_status: 'completed',
      status: 'delivered',
      canal: 'visita',
      total: 0.00,
      admin_notes: 'Activación de Muestra/Prueba (Demo) con TAG STTT-1003 ($0.00 USD)',
      items: [
        {
          id: 'item-STTT-1003',
          product_id: 'tarjeta-nfc-bolsillo',
          product_name: 'Tarjeta NFC de Bolsillo',
          quantity: 1,
          price: 0.00,
          business_name: 'Demo Reseñas',
          initial_redirect_url: 'https://search.google.com/local/writereview?placeid=ChIJq-9x93SXrI8RCA0Ewoz6iz4'
        }
      ],
      created_at: '2026-09-20T04:05:24.172Z'
    },
    {
      id: orderId0_2,
      customer_name: 'Muestra / Prueba (STTT-1004)',
      customer_email: 'prueba.visita@startap.com.pa',
      customer_phone: '6483-9004',
      shipping_province: 'Panamá',
      shipping_district: 'Venta Presencial',
      shipping_address: 'Prueba / Demo en Campo',
      payment_method: 'presencial',
      payment_status: 'completed',
      status: 'delivered',
      canal: 'visita',
      total: 0.00,
      admin_notes: 'Activación de Muestra/Prueba (Demo) con TAG STTT-1004 ($0.00 USD)',
      items: [
        {
          id: 'item-STTT-1004',
          product_id: 'tarjeta-nfc-bolsillo',
          product_name: 'Tarjeta NFC de Bolsillo',
          quantity: 1,
          price: 0.00,
          business_name: 'Demo Reseñas',
          initial_redirect_url: 'https://search.google.com/local/writereview?placeid=ChIJq-9x93SXrI8RCA0Ewoz6iz4'
        }
      ],
      created_at: '2026-09-20T05:05:24.172Z'
    }
  ];

  const { data: insertedOrders, error: orderErr } = await supabase
    .from('orders')
    .upsert(ordersToInsert)
    .select();

  console.log('Orders upserted:', { count: insertedOrders?.length, error: orderErr });

  // Verificar pedidos en Supabase
  const { data: allOrders } = await supabase.from('orders').select('id, customer_name, total, payment_status, canal');
  console.log('\n--- 3. Reporte de Órdenes Actual en Supabase ---');
  console.log(allOrders);
}

syncUserActivations().catch(console.error);
