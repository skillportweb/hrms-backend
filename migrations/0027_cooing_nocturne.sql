CREATE TABLE "user_attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"day_name" text NOT NULL,
	"punch_in" time,
	"punch_in_date" timestamp,
	"punch_in_location" text,
	"punch_out" time,
	"punch_out_date" timestamp,
	"punch_out_location" text,
	"status" text DEFAULT 'Absent' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_attendance" ADD CONSTRAINT "user_attendance_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;