"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.holidays = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.holidays = (0, pg_core_1.pgTable)("holidays", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    date: (0, pg_core_1.date)("date").notNull(),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    message: (0, pg_core_1.varchar)("message", { length: 500 }).notNull(),
});
