CREATE TABLE "holidays" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"day" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL
);
