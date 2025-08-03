import { pgTable, serial, varchar, date } from "drizzle-orm/pg-core";

export const holidays = pgTable("holidays", {
  id: serial("id").primaryKey(), 
  date: date("date").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: varchar("message", { length: 500 }).notNull(),
});
