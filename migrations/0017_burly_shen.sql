CREATE TABLE "userleave" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"total_leaves" integer NOT NULL,
	"used_leaves" integer NOT NULL,
	"remaining_leaves" integer NOT NULL,
	"casual_leave" integer NOT NULL,
	"sick_leave" integer NOT NULL,
	"paid_leave" integer NOT NULL,
	"optional_leave" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"firstname" varchar(255),
	"lastname" varchar(255),
	"email" varchar(255) NOT NULL,
	"phone" varchar(15),
	"password" varchar(255),
	"dob" varchar(255),
	"role" serial NOT NULL,
	"designation" varchar(255),
	"approved" boolean DEFAULT false
);
