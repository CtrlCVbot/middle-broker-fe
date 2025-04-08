ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'active';--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('logistics', 'settlement', 'sales', 'etc');--> statement-breakpoint
ALTER TABLE "public"."user_status_change_logs" ALTER COLUMN "previous_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "public"."user_status_change_logs" ALTER COLUMN "new_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."user_status";--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'locked');--> statement-breakpoint
ALTER TABLE "public"."user_status_change_logs" ALTER COLUMN "previous_status" SET DATA TYPE "public"."user_status" USING "previous_status"::"public"."user_status";--> statement-breakpoint
ALTER TABLE "public"."user_status_change_logs" ALTER COLUMN "new_status" SET DATA TYPE "public"."user_status" USING "new_status"::"public"."user_status";--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "status" SET DATA TYPE "public"."user_status" USING "status"::"public"."user_status";