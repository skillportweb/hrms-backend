import { pgTable, serial, varchar, boolean, integer } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firstname: varchar('firstname', { length: 255 }),
  lastname: varchar('lastname', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 15 }),
  password: varchar('password', { length: 255 }),
  dob: varchar('dob', { length: 255 }),
  role: serial('role'),
  designation: varchar('designation', { length: 255 }),
  approved: boolean('approved').default(false),
  isBlocked: boolean('isBlocked').default(false), 
     departmentId: integer('department_id'),
});
