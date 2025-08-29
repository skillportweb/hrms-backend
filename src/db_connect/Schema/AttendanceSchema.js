"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAttendance = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const UserSchema_1 = require("./UserSchema");
exports.userAttendance = (0, pg_core_1.pgTable)("user_attendance", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id")
        .references(() => UserSchema_1.users.id, { onDelete: "cascade" })
        .notNull(),
    date: (0, pg_core_1.date)("date").notNull(),
    dayName: (0, pg_core_1.text)("day_name").notNull(),
    punchIn: (0, pg_core_1.time)("punch_in"),
    punchInDate: (0, pg_core_1.timestamp)("punch_in_date"),
    punchInLocation: (0, pg_core_1.text)("punch_in_location"),
    punchInLatitude: (0, pg_core_1.text)("punch_in_latitude"),
    punchInLongitude: (0, pg_core_1.text)("punch_in_longitude"),
    punchOut: (0, pg_core_1.time)("punch_out"),
    punchOutDate: (0, pg_core_1.timestamp)("punch_out_date"),
    punchOutLocation: (0, pg_core_1.text)("punch_out_location"),
    status: (0, pg_core_1.text)("status").notNull().default("Absent"),
    missPunchStatus: (0, pg_core_1.smallint)("miss_punch_status").default(0)
});
