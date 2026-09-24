const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:6713Lastenia4341@db.xnepnlaoiflngtikozqd.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to Postgres');

  // Inspect nfc_cards columns
  const resCards = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'nfc_cards';
  `);
  console.log('nfc_cards columns:', resCards.rows.map(r => r.column_name));

  // Inspect orders columns
  const resOrders = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'orders';
  `);
  console.log('orders columns:', resOrders.rows.map(r => r.column_name));

  // Add missing columns if needed
  await client.query(`
    ALTER TABLE nfc_cards ADD COLUMN IF NOT EXISTS tipo_activacion TEXT DEFAULT NULL;
    ALTER TABLE nfc_cards ADD COLUMN IF NOT EXISTS precio_venta NUMERIC DEFAULT 0;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS canal TEXT DEFAULT 'web';
  `);
  console.log('Columns added or confirmed in nfc_cards and orders.');

  await client.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
