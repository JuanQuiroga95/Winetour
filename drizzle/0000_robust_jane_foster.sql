CREATE TYPE "public"."quote_status" AS ENUM('Pendiente', 'En Gestión', 'Confirmado', 'Cancelado');--> statement-breakpoint
CREATE TABLE "combos" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"days" integer NOT NULL,
	"description" text NOT NULL,
	"items" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote_id" uuid NOT NULL,
	"winery_id" integer NOT NULL,
	"day" integer NOT NULL,
	"winery_name" text NOT NULL,
	"experience" text NOT NULL,
	"unit_price_usd" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"notes" text NOT NULL,
	"travel_date" date NOT NULL,
	"days" integer NOT NULL,
	"pax" integer NOT NULL,
	"private_transfer" boolean NOT NULL,
	"experiences_usd" integer NOT NULL,
	"transfer_usd" integer NOT NULL,
	"total_usd" integer NOT NULL,
	"exchange_rate_ars" double precision DEFAULT 0 NOT NULL,
	"total_ars" double precision DEFAULT 0 NOT NULL,
	"policy_text" text DEFAULT '' NOT NULL,
	"policy_accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "quote_status" DEFAULT 'Pendiente' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "regions_name_unique" UNIQUE("name"),
	CONSTRAINT "regions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "site_content" (
	"id" integer PRIMARY KEY NOT NULL,
	"content" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wineries" (
	"id" integer PRIMARY KEY NOT NULL,
	"region_id" integer NOT NULL,
	"name" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"tier" text NOT NULL,
	"experience" text NOT NULL,
	"price_usd" integer NOT NULL,
	CONSTRAINT "wineries_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_winery_id_wineries_id_fk" FOREIGN KEY ("winery_id") REFERENCES "public"."wineries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wineries" ADD CONSTRAINT "wineries_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "quote_day_winery_idx" ON "quote_items" USING btree ("quote_id","day","winery_id");