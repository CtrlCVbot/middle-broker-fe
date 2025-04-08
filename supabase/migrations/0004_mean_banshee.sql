CREATE TYPE "public"."user_domain" AS ENUM('logistics', 'settlement', 'sales', 'etc');--> statement-breakpoint
ALTER TYPE "public"."user_role" RENAME TO "system_access_level";--> statement-breakpoint
CREATE TABLE "user_change_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"changed_by" uuid NOT NULL,
	"changed_by_name" varchar(100) NOT NULL,
	"changed_by_email" varchar(100) NOT NULL,
	"changed_by_access_level" varchar(50),
	"change_type" varchar(20) NOT NULL,
	"diff" json NOT NULL,
	"reason" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "manager_id" TO "auth_id";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "roles" TO "system_access_level";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_manager_id_unique";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "domains" json DEFAULT '[]'::json NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_by" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_by" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "user_change_logs" ADD CONSTRAINT "user_change_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_change_logs" ADD CONSTRAINT "user_change_logs_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_auth_id_unique" UNIQUE("auth_id");--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "system_access_level" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."system_access_level";--> statement-breakpoint
CREATE TYPE "public"."system_access_level" AS ENUM('platform_admin', 'broker_admin', 'shipper_admin', 'broker_member', 'shipper_member', 'viewer', 'guest');--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "system_access_level" SET DATA TYPE "public"."system_access_level" USING "system_access_level"::"public"."system_access_level";