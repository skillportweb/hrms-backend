"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobs = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.jobs = (0, pg_core_1.pgTable)("jobs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    jobTitle: (0, pg_core_1.varchar)("job_title", { length: 255 }).notNull(),
    jobId: (0, pg_core_1.varchar)("job_id", { length: 100 }).notNull(),
    city: (0, pg_core_1.varchar)("city", { length: 100 }).notNull(),
    state: (0, pg_core_1.varchar)("state", { length: 100 }).notNull(),
    country: (0, pg_core_1.varchar)("country", { length: 100 }).notNull(),
    workArrangement: (0, pg_core_1.varchar)("work_arrangement", { length: 50 }).notNull(),
    areaOfWork: (0, pg_core_1.varchar)("area_of_work", { length: 255 }).notNull(),
    employmentType: (0, pg_core_1.varchar)("employment_type", { length: 50 }).notNull(),
    positionType: (0, pg_core_1.varchar)("position_type", { length: 50 }).notNull(),
    travelRequired: (0, pg_core_1.varchar)("travel_required", { length: 50 }).notNull(),
    shift: (0, pg_core_1.varchar)("shift", { length: 50 }).notNull(),
    education: (0, pg_core_1.varchar)("education", { length: 100 }).notNull(),
    introduction: (0, pg_core_1.text)("introduction").notNull(),
    responsibilities: (0, pg_core_1.text)("responsibilities").notNull(),
    skills: (0, pg_core_1.text)("skills").notNull(),
    status: (0, pg_core_1.boolean)("status").default(false).notNull(),
});
