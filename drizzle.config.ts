
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db_connect/Schema/mainSchema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: "localhost",
    port: 5432, 
    user: "postgres",
    password: "Dinesh@23",
    database: "hrms",
    ssl: false
  }
});
