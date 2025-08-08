CREATE TABLE "members" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"department_id" integer NOT NULL,
	"member_name" text NOT NULL,
	"reason" text NOT NULL
);
