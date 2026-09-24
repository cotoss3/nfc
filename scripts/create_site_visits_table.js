const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.xnepnlaoiflngtikozqd:6713Lastenia4341@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');

  await client.query(`
    CREATE TABLE IF NOT EXISTS site_visits (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      page TEXT NOT NULL,
      referrer TEXT,
      device TEXT,
      ip TEXT,
      country TEXT DEFAULT 'Panamá',
      province TEXT DEFAULT 'Panamá',
      district TEXT DEFAULT 'Bella Vista',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON site_visits (created_at);
    CREATE INDEX IF NOT EXISTS idx_site_visits_session_id ON site_visits (session_id);
  `);
  console.log('Table site_visits created successfully!');

  // Notify PostgREST to reload schema
  await client.query("NOTIFY pgrst, 'reload schema';");
  console.log('PostgREST schema reloaded!');

  await client.end();
}

main().catch(err => {
  console.error('Error creating table:', err);
  process.exit(1);
});
