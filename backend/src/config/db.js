import pg from "pg";
import { createOrgsTable } from "../models/Organization.js";
import { createUsersTable } from "../models/User.js";
import { createTasksTable } from "../models/Task.js";
import { createAuditTable } from "../models/AuditLog.js";

const { Pool } = pg;

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function connectDB() {
  try {
    const client = await db.connect();
    console.log("Connected to PostgreSQL");

    // Initialize tables in correct order
    await client.query("BEGIN");
    await client.query(createOrgsTable);
    await client.query(createUsersTable);
    await client.query(createTasksTable);
    await client.query(createAuditTable);

    // Migrations: add forgot-password columns if they don't exist yet
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ`);

    await client.query("COMMIT");
    console.log("Database tables initialized successfully");
    
    client.release();
  } catch (err) {
    console.error("Database connection/init error:", err);
    process.exit(1);
  }
}
