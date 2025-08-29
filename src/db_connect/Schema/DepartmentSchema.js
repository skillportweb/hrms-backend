"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departments = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.departments = (0, pg_core_1.pgTable)("departments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    headName: (0, pg_core_1.varchar)("head_name", { length: 255 }).notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    status: (0, pg_core_1.integer)("status").default(0)
});
