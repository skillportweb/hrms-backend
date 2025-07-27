import { pgTable, serial, integer } from "drizzle-orm/pg-core";

export const userleave = pgTable("userleave", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),

  totalLeaves: integer("total_leaves").notNull(),
  usedLeaves: integer("used_leaves").notNull(),
  remainingLeaves: integer("remaining_leaves").notNull(),

  casualLeave: integer("casual_leave").notNull(),
  sickLeave: integer("sick_leave").notNull(),
  paidLeave: integer("paid_leave").notNull(),
  optionalLeave: integer("optional_leave").notNull(),
});
