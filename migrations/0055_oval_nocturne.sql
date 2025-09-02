CREATE TABLE "support_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"employee_name" varchar(255) NOT NULL,
	"department_id" integer NOT NULL,
	"employee_email" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"priority" varchar(50) DEFAULT 'Medium',
	"category" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"created_at" date DEFAULT now() NOT NULL
);
