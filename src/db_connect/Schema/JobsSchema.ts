
import { pgTable, serial, text, varchar,boolean } from "drizzle-orm/pg-core";

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  jobTitle: varchar("job_title", { length: 255 }).notNull(),
  jobId: varchar("job_id", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  workArrangement: varchar("work_arrangement", { length: 50 }).notNull(),
  areaOfWork: varchar("area_of_work", { length: 255 }).notNull(),
  employmentType: varchar("employment_type", { length: 50 }).notNull(),
  positionType: varchar("position_type", { length: 50 }).notNull(),
  travelRequired: varchar("travel_required", { length: 50 }).notNull(),
  shift: varchar("shift", { length: 50 }).notNull(),
  education: varchar("education", { length: 100 }).notNull(),
  introduction: text("introduction").notNull(),
  responsibilities: text("responsibilities").notNull(),
  skills: text("skills").notNull(),
  status: boolean("status").default(false).notNull(),
});
