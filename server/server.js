import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import pg from "pg";
import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const distFolder = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../dist"
);

app.set("trust proxy", 1);
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const SESSION_DAYS = 7;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const scryptAsync = promisify(scrypt);

if (!JWT_SECRET) {
  console.error("JWT_SECRET is missing. Add it to your .env file.");
  process.exit(1);
}

const allowedStatuses = ["Active", "Lead", "Churned"];

const starterCustomers = [
  ["Aarav Sharma", "Nimbus Tech", "Active", 12000, "2026-05-12"],
  ["Priya Nair", "BrightPath", "Lead", 8000, "2026-06-03"],
  ["Rohan Mehta", "Orbit Labs", "Churned", 5000, "2026-08-19"],
  ["Sneha Iyer", "Greenleaf", "Active", 15000, "2026-09-27"],
];

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
app.use(cookieParser());

// ---------- password and session helpers ----------

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = await scryptAsync(password, salt, 64);
  return `${salt}:${key.toString("hex")}`;
}

async function verifyPassword(password, storedHash) {
  const [salt, storedKeyHex] = storedHash.split(":");
  const key = await scryptAsync(password, salt, 64);
  return timingSafeEqual(key, Buffer.from(storedKeyHex, "hex"));
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: IS_PRODUCTION,
};

function startSession(response, userId) {
  const token = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: `${SESSION_DAYS}d`,
  });
  response.cookie("session", token, {
    ...cookieOptions,
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
  });
}

function requireLogin(request, response, next) {
  const token = request.cookies.session;

  if (!token) {
    return response.status(401).json({ message: "Please log in" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    request.userId = payload.userId;
    next();
  } catch {
    response
      .status(401)
      .json({ message: "Your session has expired. Please log in again." });
  }
}

// ---------- auth routes ----------

app.post("/api/auth/register", async (request, response) => {
  const { name, email, password } = request.body;
  const cleanName = String(name || "").trim();
  const cleanEmail = String(email || "").trim().toLowerCase();

  if (!cleanName || !cleanEmail.includes("@")) {
    return response
      .status(400)
      .json({ message: "Enter your name and a valid email address" });
  }

  if (typeof password !== "string" || password.length < 8) {
    return response
      .status(400)
      .json({ message: "Password must be at least 8 characters" });
  }

  const passwordHash = await hashPassword(password);

  let user;
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (email, name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [cleanEmail, cleanName, passwordHash]
    );
    user = rows[0];
  } catch (error) {
    if (error.code === "23505") {
      return response
        .status(409)
        .json({ message: "An account with this email already exists" });
    }
    throw error;
  }

  startSession(response, user.id);
  response.status(201).json(user);
});

app.post("/api/auth/login", async (request, response) => {
  const { email, password } = request.body;
  const cleanEmail = String(email || "").trim().toLowerCase();

  const { rows } = await pool.query(
    "SELECT id, name, email, password_hash FROM users WHERE email = $1",
    [cleanEmail]
  );
  const user = rows[0];

  const isPasswordCorrect =
    user && typeof password === "string"
      ? await verifyPassword(password, user.password_hash)
      : false;

  if (!isPasswordCorrect) {
    return response.status(401).json({ message: "Incorrect email or password" });
  }

  startSession(response, user.id);
  response.json({ id: user.id, name: user.name, email: user.email });
});

app.post("/api/auth/logout", (request, response) => {
  response.clearCookie("session", cookieOptions);
  response.status(204).end();
});

app.get("/api/auth/me", requireLogin, async (request, response) => {
  const { rows } = await pool.query(
    "SELECT id, name, email FROM users WHERE id = $1",
    [request.userId]
  );

  if (rows.length === 0) {
    return response.status(401).json({ message: "Please log in" });
  }

  response.json(rows[0]);
});

// ---------- customer routes (each user sees only their own) ----------

app.get("/api/customers", requireLogin, async (request, response) => {
  const { rows } = await pool.query(
    `SELECT ${customerColumns} FROM customers WHERE owner_id = $1 ORDER BY id`,
    [request.userId]
  );
  response.json(rows);
});

app.post("/api/customers", requireLogin, async (request, response) => {
  const { name, company, dealValue } = request.body;

  if (!name || !company) {
    return response.status(400).json({ message: "Name and company are required" });
  }

  const { rows } = await pool.query(
    `INSERT INTO customers (name, company, deal_value, owner_id)
     VALUES ($1, $2, $3, $4)
     RETURNING ${customerColumns}`,
    [name, company, Number(dealValue) || 0, request.userId]
  );

  response.status(201).json(rows[0]);
});

app.post("/api/customers/sample", requireLogin, async (request, response) => {
  const existing = await pool.query(
    "SELECT 1 FROM customers WHERE owner_id = $1 LIMIT 1",
    [request.userId]
  );

  if (existing.rowCount > 0) {
    return response
      .status(409)
      .json({ message: "Sample data can only be added to an empty workspace" });
  }

  for (const [name, company, status, dealValue, createdAt] of starterCustomers) {
    await pool.query(
      `INSERT INTO customers (name, company, status, deal_value, created_at, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, company, status, dealValue, createdAt, request.userId]
    );
  }

  const { rows } = await pool.query(
    `SELECT ${customerColumns} FROM customers WHERE owner_id = $1 ORDER BY id`,
    [request.userId]
  );
  response.json(rows);
});

app.patch("/api/customers/:id", requireLogin, async (request, response) => {
  const customerId = Number(request.params.id);

  if (!Number.isInteger(customerId)) {
    return response.status(400).json({ message: "Invalid customer id" });
  }

  if ("status" in request.body && !allowedStatuses.includes(request.body.status)) {
    return response.status(400).json({ message: "Invalid status" });
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

  values.push(customerId, request.userId);

  const { rows } = await pool.query(
    `UPDATE customers SET ${assignments.join(", ")}
     WHERE id = $${values.length - 1} AND owner_id = $${values.length}
     RETURNING ${customerColumns}`,
    values
  );

  if (rows.length === 0) {
    return response.status(404).json({ message: "Customer not found" });
  }

  response.json(rows[0]);
});

app.delete("/api/customers/:id", requireLogin, async (request, response) => {
  const customerId = Number(request.params.id);

  if (!Number.isInteger(customerId)) {
    return response.status(400).json({ message: "Invalid customer id" });
  }

  const result = await pool.query(
    "DELETE FROM customers WHERE id = $1 AND owner_id = $2",
    [customerId, request.userId]
  );

  if (result.rowCount === 0) {
    return response.status(404).json({ message: "Customer not found" });
  }

  response.status(204).end();
});

// Serve the built React app (used when the project is deployed)
app.use(express.static(distFolder));

app.use((request, response, next) => {
  if (request.method !== "GET" || request.path.startsWith("/api")) {
    return next();
  }
  response.sendFile(path.join(distFolder, "index.html"));
});

app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).json({ message: "Something went wrong on the server" });
});

app.listen(PORT, () => {
  console.log(`PulseCRM API running at http://localhost:${PORT}`);
});