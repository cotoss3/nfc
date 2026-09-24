const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.xnepnlaoiflngtikozqd:6713Lastenia4341@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');

  // Inspect nfc_cards columns
  const resCards = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'nfc_cards'
    ORDER BY ordinal_position;
  `);
  console.log('nfc_cards columns:', resCards.rows.map(r => `${r.column_name} (${r.data_type})`));

  // Inspect orders columns
  const resOrders = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'orders'
    ORDER BY ordinal_position;
  `);
  console.log('orders columns:', resOrders.rows.map(r => `${r.column_name} (${r.data_type})`));

  // Add missing columns to nfc_cards
  await client.query(`
    ALTER TABLE nfc_cards ADD COLUMN IF NOT EXISTS tipo_activacion TEXT DEFAULT NULL;
    ALTER TABLE nfc_cards ADD COLUMN IF NOT EXISTS precio_venta NUMERIC DEFAULT 0;
  `);
  console.log('Added tipo_activacion and precio_venta to nfc_cards');

  // Add missing columns to orders if any
  await client.query(`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS canal TEXT DEFAULT 'web';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_notes TEXT DEFAULT NULL;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT DEFAULT NULL;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_courier TEXT DEFAULT NULL;
  `);
  console.log('Added canal, admin_notes, tracking columns to orders');

  // Reload schema cache in PostgREST
  await client.query("NOTIFY pgrst, 'reload schema';");
  console.log('Notified PostgREST to reload schema cache!');

  await client.end();
}

main().catch(err => {
  console.error('Error migrating Supabase:', err);
  process.exit(1);
});
