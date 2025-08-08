import { pgTable, serial, varchar, text, timestamp ,integer} from "drizzle-orm/pg-core";

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  headName: varchar("head_name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  status: integer("status").default(0)
});
