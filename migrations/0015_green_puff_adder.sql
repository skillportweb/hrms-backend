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
