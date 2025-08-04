CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_title" varchar(255) NOT NULL,
	"job_id" varchar(100) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"country" varchar(100) NOT NULL,
	"work_arrangement" varchar(50) NOT NULL,
	"area_of_work" varchar(255) NOT NULL,
	"employment_type" varchar(50) NOT NULL,
	"position_type" varchar(50) NOT NULL,
	"travel_required" varchar(50) NOT NULL,
	"shift" varchar(50) NOT NULL,
	"education" varchar(100) NOT NULL,
	"introduction" text NOT NULL,
	"responsibilities" text NOT NULL,
	"skills" text NOT NULL
);
