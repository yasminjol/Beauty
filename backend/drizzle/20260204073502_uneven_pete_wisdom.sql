CREATE TABLE "otp_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "client_profiles" ALTER COLUMN "preferred_categories" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "client_profiles" ALTER COLUMN "preferred_categories" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "client_profiles" ADD COLUMN "phone_number" text;--> statement-breakpoint
ALTER TABLE "client_profiles" ADD COLUMN "location_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "provider_profiles" ADD COLUMN "country" text NOT NULL;--> statement-breakpoint
ALTER TABLE "provider_profiles" ADD COLUMN "state_province" text NOT NULL;--> statement-breakpoint
ALTER TABLE "provider_profiles" ADD COLUMN "phone_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "provider_profiles" ADD COLUMN "street_address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "provider_profiles" ADD COLUMN "zip_code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "provider_profiles" ADD COLUMN "service_provision_method" text NOT NULL;--> statement-breakpoint
ALTER TABLE "provider_profiles" DROP COLUMN "service_address";