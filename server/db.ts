import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("Falta DATABASE_URL en variables de entorno.");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });