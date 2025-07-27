CREATE TABLE "user_leave_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"leave_type" varchar(50) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"message" varchar(255) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
DROP TABLE "leaveapplications" CASCADE;