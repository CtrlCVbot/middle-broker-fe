CREATE TYPE "public"."company_status" AS ENUM('활성', '비활성');--> statement-breakpoint
CREATE TYPE "public"."company_type" AS ENUM('화주', '운송사', '주선사');--> statement-breakpoint
CREATE TYPE "public"."statement_type" AS ENUM('매입처', '매출처');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('배차', '정산', '관리');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('활성', '비활성');--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"type" "company_type" NOT NULL,
	"statement_type" "statement_type" NOT NULL,
	"business_number" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"representative" varchar(100) NOT NULL,
	"email" varchar(100),
	"phone_number" varchar(20) NOT NULL,
	"fax_number" varchar(20),
	"manager_name" varchar(100),
	"manager_phone_number" varchar(20),
	"status" "company_status" DEFAULT '활성' NOT NULL,
	"warnings" json DEFAULT '[]'::json,
	"files" json DEFAULT '[]'::json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_code_unique" UNIQUE("code"),
	CONSTRAINT "companies_business_number_unique" UNIQUE("business_number")
);
--> statement-breakpoint
CREATE TABLE "company_status_change_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"previous_status" "company_status" NOT NULL,
	"new_status" "company_status" NOT NULL,
	"changed_by" uuid NOT NULL,
	"reason" text,
	"changed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_login_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"login_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(50),
	"user_agent" varchar(500),
	"success" boolean NOT NULL,
	"fail_reason" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "user_status_change_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"previous_status" "user_status" NOT NULL,
	"new_status" "user_status" NOT NULL,
	"changed_by" uuid NOT NULL,
	"reason" text,
	"changed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"manager_id" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(100) NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"roles" json DEFAULT '[]'::json NOT NULL,
	"department" varchar(100),
	"position" varchar(100),
	"rank" varchar(100),
	"status" "user_status" DEFAULT '활성' NOT NULL,
	"company_id" uuid,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_manager_id_unique" UNIQUE("manager_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "company_status_change_logs" ADD CONSTRAINT "company_status_change_logs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_login_logs" ADD CONSTRAINT "user_login_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_status_change_logs" ADD CONSTRAINT "user_status_change_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_status_change_logs" ADD CONSTRAINT "user_status_change_logs_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;