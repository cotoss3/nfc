const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.xnepnlaoiflngtikozqd:6713Lastenia4341@aws-0-us-east-1.pooler.supabase.com:6543/postgres'
});

async function run() {
  await client.connect();

  console.log('--- SEEDING INVENTORY TABLES IN SUPABASE ---');

  // 1. Initial Stocks
  await client.query(`
    DELETE FROM inventory_stocks;

    INSERT INTO inventory_stocks (product_id, sku, name, category, current_stock, min_alert_stock, unit_cost, selling_price, is_bundle, updated_at)
    VALUES
      ('stand-nfc-mesa', 'STP-0103', 'Stand NFC de Mesa (STTS-)', 'plates', 99, 10, 2.00, 35.00, false, now()),
      ('placa-nfc-mostrador', 'STP-0101', 'Placa NFC para Reseñas de Google (STT-)', 'plates', 50, 10, 2.25, 29.00, false, now()),
      ('tarjeta-nfc-bolsillo', 'STP-0102', 'Tarjeta NFC de Bolsillo (STTT-)', 'cards', 18, 10, 1.50, 25.00, false, now()),
      ('pack-trio-comercial', 'STP-0104', 'Pack Trío Comercial (1 Placa + 2 Tarjetas)', 'plates', 9, 10, 5.25, 49.99, true, now());
  `);

  // 2. Initial Batches
  await client.query(`
    DELETE FROM inventory_batches;

    INSERT INTO inventory_batches (id, product_id, product_name, quantity_initial, quantity_remaining, unit_cost, supplier, received_at, status, notes)
    VALUES
      ('LOTE-2026-10S', 'stand-nfc-mesa', 'Stand NFC para Reseñas de Google', 100, 99, 2.00, 'Shenzhen Micro-NFC Tech', now() - interval '2 days', 'active', 'Stand Acrílico triangular 3mm + Impresión UV + Chip NTAG216. 1 unidad vendida en visita (STTS-1051).'),
      ('LOTE-2026-09A', 'placa-nfc-mostrador', 'Placa NFC para Reseñas de Google', 50, 50, 2.25, 'Shenzhen Micro-NFC Tech', now() - interval '12 days', 'active', 'Acrílico 3mm + Impresión UV + Chip NTAG216'),
      ('LOTE-2026-08B', 'tarjeta-nfc-bolsillo', 'Tarjeta NFC de Bolsillo', 20, 18, 1.50, 'SmartCard Global Panama', now() - interval '25 days', 'active', 'PVC Mate 0.76mm contactless. 2 unidades entregadas como regalía (STTT-1003, STTT-1004).');
  `);

  // 3. Kardex Movements
  await client.query(`
    DELETE FROM inventory_kardex;

    INSERT INTO inventory_kardex (id, created_at, type, product_id, product_name, quantity_change, resulting_stock, reference, channel)
    VALUES
      ('MOV-INI-01', now() - interval '25 days', 'entrada_lote', 'tarjeta-nfc-bolsillo', 'Tarjeta NFC de Bolsillo', 20, 20, 'LOTE-2026-08B', 'deposito'),
      ('MOV-INI-02', now() - interval '12 days', 'entrada_lote', 'placa-nfc-mostrador', 'Placa NFC para Reseñas de Google', 50, 50, 'LOTE-2026-09A', 'deposito'),
      ('MOV-INI-03', now() - interval '2 days', 'entrada_lote', 'stand-nfc-mesa', 'Stand NFC de Mesa', 100, 100, 'LOTE-2026-10S', 'deposito'),
      ('MOV-VENTA-STTS1051', '2026-09-24 01:30:00+00', 'salida_visita', 'stand-nfc-mesa', 'Stand NFC de Mesa', -1, 99, 'Venta Presencial #PED-VISITA-STTS1051 ($50.00)', 'visita'),
      ('MOV-REG-STTT1003', '2026-09-24 01:30:00+00', 'salida_regalia', 'tarjeta-nfc-bolsillo', 'Tarjeta NFC de Bolsillo', -1, 19, 'Regalía Pack Trío #PED-VISITA-STTT1003 ($0.00)', 'visita'),
      ('MOV-REG-STTT1004', '2026-09-24 01:30:00+00', 'salida_regalia', 'tarjeta-nfc-bolsillo', 'Tarjeta NFC de Bolsillo', -1, 18, 'Regalía Pack Trío #PED-VISITA-STTT1004 ($0.00)', 'visita');
  `);

  console.log('Seeded inventory_stocks, inventory_batches, and inventory_kardex successfully.');
  await client.end();
}

run();
