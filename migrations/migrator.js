"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const migrator_1 = require("drizzle-orm/node-postgres/migrator");
const db_1 = require("../src/db_connect/db");
const path_1 = __importDefault(require("path"));
console.log("👉 Starting migration script...");
const migrationPath = path_1.default.resolve("migrations");
console.log("📂 Migration path resolved to:", migrationPath);
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_1.dbConnect)();
        yield (0, migrator_1.migrate)(db_1.db, { migrationsFolder: migrationPath });
        console.log("✅ Migration complete!");
        process.exit(0);
    }
    catch (err) {
        console.error("❌ Migration failed!", err);
        process.exit(1);
    }
}))();
