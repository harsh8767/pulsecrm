import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

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

const { rows } = await pool.query("SELECT COUNT(*) AS total FROM customers");

if (Number(rows[0].total) === 0) {
  const startingCustomers = [
    ["Aarav Sharma", "Nimbus Tech", "Active", 12000, "2026-05-12"],
    ["Priya Nair", "BrightPath", "Lead", 8000, "2026-06-03"],
    ["Rohan Mehta", "Orbit Labs", "Churned", 5000, "2026-08-19"],
    ["Sneha Iyer", "Greenleaf", "Active", 15000, "2026-09-27"],
  ];

  for (const [name, company, status, dealValue, createdAt] of startingCustomers) {
    await pool.query(
      `INSERT INTO customers (name, company, status, deal_value, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [name, company, status, dealValue, createdAt]
    );
  }
  console.log("Table created and starting customers added.");
} else {
  console.log("Table already has data, nothing added.");
}

await pool.end();