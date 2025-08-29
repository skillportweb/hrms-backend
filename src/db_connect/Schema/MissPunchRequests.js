"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.missPunchRequests = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const UserSchema_1 = require("./UserSchema");
exports.missPunchRequests = (0, pg_core_1.pgTable)("miss_punch_requests", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id")
        .references(() => UserSchema_1.users.id, { onDelete: "cascade" })
        .notNull(),
    date: (0, pg_core_1.date)("date").notNull(),
    punchOut: (0, pg_core_1.time)("punch_out").notNull(),
    reason: (0, pg_core_1.text)("reason").notNull(),
    requestedAt: (0, pg_core_1.timestamp)("requested_at").defaultNow().notNull(),
    status: (0, pg_core_1.text)("status").default("Pending"),
});
