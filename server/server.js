import express from "express";
import pg from "pg";

const app = express();
const PORT = process.env.PORT || 3001;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const customerColumns = `
  id, name, company, status,
  deal_value AS "dealValue",
  to_char(created_at, 'YYYY-MM-DD') AS "createdAt",
  notes
`;

// request field name -> database column name
const editableColumns = {
  name: "name",
  company: "company",
  status: "status",
  dealValue: "deal_value",
  notes: "notes",
};

app.use(express.json());

app.get("/api/customers", async (request, response) => {
  const { rows } = await pool.query(
    `SELECT ${customerColumns} FROM customers ORDER BY id`
  );
  response.json(rows);
});

app.post("/api/customers", async (request, response) => {
  const { name, company, dealValue } = request.body;

  if (!name || !company) {
    return response.status(400).json({ message: "Name and company are required" });
  }

  const { rows } = await pool.query(
    `INSERT INTO customers (name, company, deal_value)
     VALUES ($1, $2, $3)
     RETURNING ${customerColumns}`,
    [name, company, Number(dealValue) || 0]
  );

  response.status(201).json(rows[0]);
});

app.patch("/api/customers/:id", async (request, response) => {
  const customerId = Number(request.params.id);

  if (!Number.isInteger(customerId)) {
    return response.status(400).json({ message: "Invalid customer id" });
  }

  const assignments = [];
  const values = [];

  for (const [fieldName, columnName] of Object.entries(editableColumns)) {
    if (fieldName in request.body) {
      const fieldValue = request.body[fieldName];
      values.push(fieldName === "notes" ? JSON.stringify(fieldValue) : fieldValue);
      assignments.push(`${columnName} = $${values.length}`);
    }
  }

  if (assignments.length === 0) {
    return response.status(400).json({ message: "No editable fields provided" });
  }

  values.push(customerId);

  const { rows } = await pool.query(
    `UPDATE customers SET ${assignments.join(", ")}
     WHERE id = $${values.length}
     RETURNING ${customerColumns}`,
    values
  );

  if (rows.length === 0) {
    return response.status(404).json({ message: "Customer not found" });
  }

  response.json(rows[0]);
});

app.delete("/api/customers/:id", async (request, response) => {
  const customerId = Number(request.params.id);

  if (!Number.isInteger(customerId)) {
    return response.status(400).json({ message: "Invalid customer id" });
  }

  const result = await pool.query("DELETE FROM customers WHERE id = $1", [customerId]);

  if (result.rowCount === 0) {
    return response.status(404).json({ message: "Customer not found" });
  }

  response.status(204).end();
});

app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).json({ message: "Something went wrong on the server" });
});

app.listen(PORT, () => {
  console.log(`PulseCRM API running at http://localhost:${PORT}`);
});