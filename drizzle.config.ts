
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db_connect/Schema/mainSchema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: 'localhost',
  user: 'postgres',
  port: 5432,
  password: 'Dinesh@23',
  database: 'hrms',
  ssl: false
  }
});
