import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  date,
} from "drizzle-orm/pg-core";

export const supportRequests = pgTable("support_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  employeeName: varchar("employee_name", { length: 255 }).notNull(),
  departmentId: integer("department_id").notNull(),
  employeeEmail: varchar("employee_email", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  priority: varchar("priority", { length: 50 }).default("Medium"),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 50 }).default("0").notNull(),
  resolutionNotes: text("resolution_notes"),
  createdAt: date("created_at").defaultNow().notNull(),
});
