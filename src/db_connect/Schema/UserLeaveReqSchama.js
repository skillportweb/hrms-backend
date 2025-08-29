"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLeaveRequests = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.userLeaveRequests = (0, pg_core_1.pgTable)("user_leave_requests", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    leaveType: (0, pg_core_1.varchar)("leave_type", { length: 50 }).notNull(),
    startDate: (0, pg_core_1.date)("start_date").notNull(),
    endDate: (0, pg_core_1.date)("end_date").notNull(),
    message: (0, pg_core_1.varchar)("message").notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("pending").notNull(),
});
