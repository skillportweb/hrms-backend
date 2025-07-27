ALTER TABLE "user_attendance" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "user_attendance" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_attendance" ALTER COLUMN "user_id" SET DATA TYPE integer;