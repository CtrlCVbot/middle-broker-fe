CREATE TYPE "public"."change_actor_role" AS ENUM('shipper', 'broker', 'admin');--> statement-breakpoint
ALTER TYPE "public"."order_change_type" ADD VALUE 'updatePrice' BEFORE 'cancel';--> statement-breakpoint
ALTER TYPE "public"."order_change_type" ADD VALUE 'updatePriceSales' BEFORE 'cancel';--> statement-breakpoint
ALTER TYPE "public"."order_change_type" ADD VALUE 'updatePricePurchase' BEFORE 'cancel';--> statement-breakpoint
ALTER TYPE "public"."order_change_type" ADD VALUE 'updateDispatch' BEFORE 'cancel';--> statement-breakpoint
ALTER TYPE "public"."order_change_type" ADD VALUE 'cancelDispatch' BEFORE 'cancel';--> statement-breakpoint
ALTER TABLE "purchase_item_adjustments" DROP CONSTRAINT "purchase_item_adjustments_bundle_item_id_purchase_bundle_items_";
--> statement-breakpoint
DROP INDEX "idx_orders_company_delivery_created";--> statement-breakpoint
DROP INDEX "idx_orders_company_pickup_created";--> statement-breakpoint
DROP INDEX "idx_orders_distance_method";--> statement-breakpoint
DROP INDEX "idx_orders_estimated_distance";--> statement-breakpoint
DROP INDEX "idx_distance_cache_address_pair";--> statement-breakpoint
DROP INDEX "idx_distance_cache_latest";--> statement-breakpoint
DROP INDEX "idx_distance_cache_valid";--> statement-breakpoint
DROP INDEX "idx_kakao_api_usage_daily_stats";--> statement-breakpoint
DROP INDEX "idx_kakao_api_usage_errors";--> statement-breakpoint
DROP INDEX "idx_kakao_api_usage_performance";--> statement-breakpoint
DROP INDEX "idx_kakao_api_usage_success_date";--> statement-breakpoint
DROP INDEX "idx_kakao_api_usage_type_date";--> statement-breakpoint
DROP INDEX "idx_kakao_api_usage_user_date";--> statement-breakpoint
DROP INDEX "idx_sales_bundles_company_bn";--> statement-breakpoint
DROP INDEX "idx_sales_bundles_company_name";--> statement-breakpoint
DROP INDEX "idx_purchase_bundles_company_bn";--> statement-breakpoint
DROP INDEX "idx_purchase_bundles_company_name";--> statement-breakpoint
ALTER TABLE "order_change_logs" ADD COLUMN "changed_by_role" "change_actor_role" DEFAULT 'broker' NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_item_adjustments" ADD CONSTRAINT "purchase_item_adjustments_bundle_item_id_purchase_bundle_items_id_fk" FOREIGN KEY ("bundle_item_id") REFERENCES "public"."purchase_bundle_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_orders_company_delivery_created" ON "orders" USING btree ("company_id","created_at" DESC NULLS LAST) WHERE "orders"."delivery_address_snapshot" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_orders_company_pickup_created" ON "orders" USING btree ("company_id","created_at" DESC NULLS LAST) WHERE "orders"."pickup_address_snapshot" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_orders_distance_method" ON "orders" USING btree ("distance_calculation_method","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_orders_estimated_distance" ON "orders" USING btree ("estimated_distance_km","created_at" DESC NULLS LAST) WHERE "orders"."estimated_distance_km" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_distance_cache_address_pair" ON "distance_cache" USING btree ("pickup_address_id","delivery_address_id","route_priority");--> statement-breakpoint
CREATE INDEX "idx_distance_cache_latest" ON "distance_cache" USING btree ("pickup_address_id","delivery_address_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_distance_cache_valid" ON "distance_cache" USING btree ("is_valid","created_at" DESC NULLS LAST) WHERE "distance_cache"."is_valid" = true;--> statement-breakpoint
CREATE INDEX "idx_kakao_api_usage_daily_stats" ON "kakao_api_usage" USING btree (DATE("created_at"),"api_type","success");--> statement-breakpoint
CREATE INDEX "idx_kakao_api_usage_errors" ON "kakao_api_usage" USING btree ("response_status","created_at" DESC NULLS LAST) WHERE "kakao_api_usage"."success" = false;--> statement-breakpoint
CREATE INDEX "idx_kakao_api_usage_performance" ON "kakao_api_usage" USING btree ("response_time_ms","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_kakao_api_usage_success_date" ON "kakao_api_usage" USING btree ("success","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_kakao_api_usage_type_date" ON "kakao_api_usage" USING btree ("api_type","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_kakao_api_usage_user_date" ON "kakao_api_usage" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_sales_bundles_company_bn" ON "sales_bundles" USING btree ("company_business_number");--> statement-breakpoint
CREATE INDEX "idx_sales_bundles_company_name" ON "sales_bundles" USING btree ("company_name");--> statement-breakpoint
CREATE INDEX "idx_purchase_bundles_company_bn" ON "purchase_bundles" USING btree ("company_business_number");--> statement-breakpoint
CREATE INDEX "idx_purchase_bundles_company_name" ON "purchase_bundles" USING btree ("company_name");