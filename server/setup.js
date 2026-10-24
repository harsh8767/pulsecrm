import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Lead',
    deal_value INTEGER NOT NULL DEFAULT 0,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE,
    notes JSONB NOT NULL DEFAULT '[]'
  )
`);

await pool.query(`
  ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE
`);

await pool.query(
  "CREATE INDEX IF NOT EXISTS customers_owner_id_idx ON customers (owner_id)"
);

const removed = await pool.query("DELETE FROM customers WHERE owner_id IS NULL");
console.log(`Database ready. Removed ${removed.rowCount} old customers with no owner.`);

await pool.end();