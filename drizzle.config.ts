
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db_connect/Schema/mainSchema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: "localhost",
    port: 3307,
    user: "postgres",
    password: "root",
    database: "hrms",
    ssl: false                          
  }
});
