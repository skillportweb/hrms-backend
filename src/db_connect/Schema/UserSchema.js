"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    firstname: (0, pg_core_1.varchar)("firstname", { length: 255 }),
    lastname: (0, pg_core_1.varchar)("lastname", { length: 255 }),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull(),
    phone: (0, pg_core_1.varchar)("phone", { length: 15 }),
    password: (0, pg_core_1.varchar)("password", { length: 255 }),
    dob: (0, pg_core_1.varchar)("dob", { length: 255 }),
    role: (0, pg_core_1.serial)("role"),
    designation: (0, pg_core_1.varchar)("designation", { length: 255 }),
    approved: (0, pg_core_1.boolean)("approved").default(false),
    isBlocked: (0, pg_core_1.boolean)("isBlocked").default(false),
    departmentId: (0, pg_core_1.integer)("department_id"),
    // Added for payroll
    currentPayroll: (0, pg_core_1.varchar)("current_payroll", { length: 255 }),
    promotionDate: (0, pg_core_1.varchar)("promotion_date", { length: 255 }),
});
