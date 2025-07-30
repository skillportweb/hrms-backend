CREATE TABLE "miss_punch_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" date NOT NULL,
	"punch_out" time NOT NULL,
	"reason" text NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'Pending'
);
--> statement-breakpoint
ALTER TABLE "miss_punch_requests" ADD CONSTRAINT "miss_punch_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;