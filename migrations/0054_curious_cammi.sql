CREATE TABLE "payrolls" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"new_designation" varchar(255) NOT NULL,
	"promotion_date" date NOT NULL,
	"current_payroll" numeric(10, 2) NOT NULL,
	"promoted_payroll" numeric(10, 2) NOT NULL,
	"notes" text,
	"created_at" date DEFAULT now()
);
