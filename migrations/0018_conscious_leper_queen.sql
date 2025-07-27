CREATE TABLE "leaveapplications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"leave_type" varchar(50) NOT NULL,
	"message" varchar(500) NOT NULL,
	"status" varchar(20) DEFAULT 'Pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
