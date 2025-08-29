"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payrolls = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.payrolls = (0, pg_core_1.pgTable)("payrolls", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    newDesignation: (0, pg_core_1.varchar)("new_designation", { length: 255 }).notNull(),
    promotionDate: (0, pg_core_1.date)("promotion_date").notNull(),
    currentPayroll: (0, pg_core_1.numeric)("current_payroll", { precision: 10, scale: 2 }).notNull(),
    promotedPayroll: (0, pg_core_1.numeric)("promoted_payroll", { precision: 10, scale: 2 }).notNull(),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.date)("created_at").defaultNow(),
});
