ALTER TABLE "holidays" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "holidays" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "holidays" ALTER COLUMN "date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "holidays" ALTER COLUMN "day" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "holidays" ALTER COLUMN "day" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "holidays" ALTER COLUMN "title" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "holidays" ALTER COLUMN "title" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "holidays" ALTER COLUMN "message" DROP NOT NULL;