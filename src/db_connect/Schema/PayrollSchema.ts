import { pgTable, serial, integer, varchar, numeric, date, text } from "drizzle-orm/pg-core";

export const payrolls = pgTable("payrolls", {
  id: serial("id").primaryKey(),

  userId: integer("user_id").notNull(),

  newDesignation: varchar("new_designation", { length: 255 }).notNull(),
  promotionDate: date("promotion_date").notNull(),
  currentPayroll: numeric("current_payroll", { precision: 10, scale: 2 }).notNull(),
  promotedPayroll: numeric("promoted_payroll", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),

  createdAt: date("created_at").defaultNow(),
});
