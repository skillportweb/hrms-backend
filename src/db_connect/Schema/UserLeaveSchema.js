"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userleave = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.userleave = (0, pg_core_1.pgTable)("userleave", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    totalLeaves: (0, pg_core_1.integer)("total_leaves").notNull(),
    usedLeaves: (0, pg_core_1.integer)("used_leaves").notNull(),
    remainingLeaves: (0, pg_core_1.integer)("remaining_leaves").notNull(),
    casualLeave: (0, pg_core_1.integer)("casual_leave").notNull(),
    sickLeave: (0, pg_core_1.integer)("sick_leave").notNull(),
    paidLeave: (0, pg_core_1.integer)("paid_leave").notNull(),
    optionalLeave: (0, pg_core_1.integer)("optional_leave").notNull(),
});
