import { pgTable, serial, integer, date, time, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./UserSchema";

export const missPunchRequests = pgTable("miss_punch_requests", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  date: date("date").notNull(),
  punchOut: time("punch_out").notNull(),
  reason: text("reason").notNull(),

  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  status: text("status").default("Pending"),
});
