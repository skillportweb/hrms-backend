"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_kit_1 = require("drizzle-kit");
exports.default = (0, drizzle_kit_1.defineConfig)({
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
