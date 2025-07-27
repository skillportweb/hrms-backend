ALTER TABLE "leaveapplications" RENAME COLUMN "updated_at" TO "userId";--> statement-breakpoint
ALTER TABLE "leaveapplications" ADD COLUMN "leaveType" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "leaveapplications" ADD COLUMN "startDate" date NOT NULL;--> statement-breakpoint
ALTER TABLE "leaveapplications" ADD COLUMN "endDate" date NOT NULL;--> statement-breakpoint
ALTER TABLE "leaveapplications" ADD COLUMN "createdAt" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "leaveapplications" ADD COLUMN "updatedAt" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "leaveapplications" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "leaveapplications" DROP COLUMN "leave_type";--> statement-breakpoint
ALTER TABLE "leaveapplications" DROP COLUMN "created_at";