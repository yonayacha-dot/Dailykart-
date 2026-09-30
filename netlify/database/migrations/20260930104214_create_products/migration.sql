CREATE TABLE "products" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"mrp" integer NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"category" text NOT NULL,
	"image_url" text NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"tag" text DEFAULT 'normal' NOT NULL,
	"delivery_time" text DEFAULT '15 mins' NOT NULL,
	"size" text DEFAULT 'normal' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
