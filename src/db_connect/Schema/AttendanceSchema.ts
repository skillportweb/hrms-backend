// src/db_connect/Schema/UserAttendanceSchema.ts
import {
  pgTable,
  serial,
  integer,
  date,
  text,
  time,
  timestamp
} from "drizzle-orm/pg-core";
import { users } from "./UserSchema";

export const userAttendance = pgTable("user_attendance", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  date: date("date").notNull(),
  dayName: text("day_name").notNull(),

  punchIn: time("punch_in"),
  punchInDate: timestamp("punch_in_date"),
  punchInLocation: text("punch_in_location"),
  punchInLatitude: text("punch_in_latitude"), // ✅
  punchInLongitude: text("punch_in_longitude"), // ✅

  punchOut: time("punch_out"),
  punchOutDate: timestamp("punch_out_date"),
  punchOutLocation: text("punch_out_location"),

  status: text("status").notNull().default("Absent"),
});


