import { pgTable, serial, varchar, integer, date } from "drizzle-orm/pg-core";

export const userLeaveRequests = pgTable("user_leave_requests", {
  id: serial("id").primaryKey(),

  userId: integer("user_id").notNull(),

  leaveType: varchar("leave_type", { length: 50 }).notNull(),

  startDate: date("start_date").notNull(),

  endDate: date("end_date").notNull(),

  message: varchar("message").notNull(),

  status: varchar("status", { length: 20 }).default("pending").notNull(),
});
