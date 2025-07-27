CREATE TABLE "leaveapplications" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"leaveType" varchar(50) NOT NULL,
	"message" varchar(500) NOT NULL,
	"startDate" date NOT NULL,
	"endDate" date NOT NULL,
	"status" varchar(20) DEFAULT 'Pending' NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
