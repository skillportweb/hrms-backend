ALTER TABLE "users" ADD COLUMN "current_payroll" varchar(255);--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "promotion_date";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "promotion_notes";