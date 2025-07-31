ALTER TABLE "holidays" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "holidays" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "holidays" ALTER COLUMN "date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "holidays" ALTER COLUMN "day" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "holidays" ALTER COLUMN "title" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "holidays" ALTER COLUMN "message" SET DATA TYPE varchar(500);