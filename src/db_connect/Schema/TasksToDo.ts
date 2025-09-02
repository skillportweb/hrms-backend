import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  todo: text("todo").notNull(),
  status: integer("status").notNull().default(0), 
});
