ALTER TABLE "leaveapplications" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "leaveapplications" ADD COLUMN "leave_type" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "leaveapplications" ADD COLUMN "start_date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "leaveapplications" ADD COLUMN "end_date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "leaveapplications" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "leaveapplications" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "leaveapplications" DROP COLUMN "userId";--> statement-breakpoint
ALTER TABLE "leaveapplications" DROP COLUMN "leaveType";--> statement-breakpoint
ALTER TABLE "leaveapplications" DROP COLUMN "startDate";--> statement-breakpoint
ALTER TABLE "leaveapplications" DROP COLUMN "endDate";--> statement-breakpoint
ALTER TABLE "leaveapplications" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "leaveapplications" DROP COLUMN "updatedAt";