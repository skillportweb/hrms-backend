
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db_connect/Schema/mainSchema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: 'localhost',
  user: 'postgres',
  port: 3307,
  password: 'root',
  database: 'hrms',
  ssl: false
  }
});
