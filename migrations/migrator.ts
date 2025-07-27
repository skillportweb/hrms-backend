import { migrate } from "drizzle-orm/node-postgres/migrator";
import { dbConnect, db } from "../src/db_connect/db";
import path from "path";

console.log("👉 Starting migration script...");
const migrationPath = path.resolve("migrations");
console.log("📂 Migration path resolved to:", migrationPath);

(async () => {
  try {
    await dbConnect(); 
    await migrate(db, { migrationsFolder: migrationPath }); 
    console.log("✅ Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed!", err);
    process.exit(1);
  }
})();
