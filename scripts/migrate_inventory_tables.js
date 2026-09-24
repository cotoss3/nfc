const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.xnepnlaoiflngtikozqd:6713Lastenia4341@aws-0-us-east-1.pooler.supabase.com:6543/postgres'
});

async function run() {
  await client.connect();

  console.log('--- CREATING INVENTORY TABLES IN SUPABASE ---');

  await client.query(`
    CREATE TABLE IF NOT EXISTS inventory_stocks (
      product_id TEXT PRIMARY KEY,
      sku TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      current_stock INTEGER NOT NULL DEFAULT 0,
      min_alert_stock INTEGER NOT NULL DEFAULT 10,
      unit_cost NUMERIC NOT NULL DEFAULT 0,
      selling_price NUMERIC NOT NULL DEFAULT 0,
      is_bundle BOOLEAN DEFAULT FALSE,
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS inventory_batches (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity_initial INTEGER NOT NULL,
      quantity_remaining INTEGER NOT NULL,
      unit_cost NUMERIC NOT NULL,
      supplier TEXT,
      received_at TIMESTAMPTZ DEFAULT now(),
      status TEXT DEFAULT 'active',
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS inventory_kardex (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT now(),
      type TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity_change INTEGER NOT NULL,
      resulting_stock INTEGER NOT NULL,
      reference TEXT NOT NULL,
      channel TEXT DEFAULT 'web'
    );
  `);

  console.log('Tables created successfully.');

  // Notify PostgREST to reload schema
  await client.query(`NOTIFY pgrst, 'reload schema';`);
  console.log('Schema reload notified.');

  await client.end();
}

run();
