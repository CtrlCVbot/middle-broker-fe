import { pgTable, foreignKey, uuid, text, timestamp, boolean, varchar, json, unique, jsonb, integer, numeric, index, date, time, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const adjustmentStatus = pgEnum("adjustment_status", ['draft', 'issued', 'processed', 'canceled'])
export const adjustmentType = pgEnum("adjustment_type", ['refund', 'additional', 'correction', 'other'])
export const bankCode = pgEnum("bank_code", ['001', '002', '003', '004', '007', '008', '011', '020', '023', '027', '031', '032', '034', '035', '037', '039', '045', '048', '050', '071', '081', '088', '089', '090', '092'])
export const bundleAdjType = pgEnum("bundle_adj_type", ['discount', 'surcharge'])
export const bundlePeriodType = pgEnum("bundle_period_type", ['departure', 'arrival', 'etc'])
export const calculationMethod = pgEnum("calculation_method", ['api', 'cached', 'manual'])
export const chargeReason = pgEnum("charge_reason", ['base_freight', 'extra_wait', 'night_fee', 'toll', 'discount', 'penalty', 'etc'])
export const chargeSide = pgEnum("charge_side", ['sales', 'purchase'])
export const chargeStage = pgEnum("charge_stage", ['estimate', 'progress', 'completed'])
export const companyStatus = pgEnum("company_status", ['active', 'inactive'])
export const companyType = pgEnum("company_type", ['broker', 'shipper', 'carrier'])
export const deliveryStatus = pgEnum("delivery_status", ['pending', 'success', 'failed', 'invalid_number'])
export const dispatchStatus = pgEnum("dispatch_status", ['배차대기', '배차완료', '상차중', '운송중', '하차완료', '정산완료'])
export const driverCompanyType = pgEnum("driver_company_type", ['개인', '소속'])
export const invoiceStatus = pgEnum("invoice_status", ['draft', 'issued', 'paid', 'canceled', 'void'])
export const kakaoApiType = pgEnum("kakao_api_type", ['directions', 'search-address'])
export const messageType = pgEnum("message_type", ['complete', 'update', 'cancel', 'custom'])
export const orderChangeType = pgEnum("order_change_type", ['create', 'update', 'updateStatus', 'cancel', 'delete'])
export const orderFlowStatus = pgEnum("order_flow_status", ['운송요청', '배차대기', '배차완료', '상차대기', '상차완료', '운송중', '하차완료', '운송완료'])
export const paymentMethod = pgEnum("payment_method", ['cash', 'bank_transfer', 'card', 'etc'])
export const paymentStatus = pgEnum("payment_status", ['draft', 'issued', 'paid', 'canceled', 'void'])
export const permissionType = pgEnum("permission_type", ['일반'])
export const priceType = pgEnum("price_type", ['기본', '계약'])
export const purchaseBundleStatus = pgEnum("purchase_bundle_status", ['draft', 'issued', 'paid', 'canceled'])
export const requestStatus = pgEnum("request_status", ['pending', 'dispatched', 'failed'])
export const roleType = pgEnum("role_type", ['requester', 'shipper', 'load', 'unload', 'broker', 'driver'])
export const routePriority = pgEnum("route_priority", ['RECOMMEND', 'TIME', 'DISTANCE'])
export const salesBundleStatus = pgEnum("sales_bundle_status", ['draft', 'issued', 'paid', 'canceled'])
export const sourceType = pgEnum("source_type", ['manual', 'system_imported'])
export const systemAccessLevel = pgEnum("system_access_level", ['platform_admin', 'broker_admin', 'shipper_admin', 'broker_member', 'shipper_member', 'viewer', 'guest'])
export const taxType = pgEnum("tax_type", ['비과세', '과세'])
export const userDomain = pgEnum("user_domain", ['logistics', 'settlement', 'sales', 'etc'])
export const userStatus = pgEnum("user_status", ['active', 'inactive', 'locked'])
export const vehicleConnection = pgEnum("vehicle_connection", ['24시', '원콜', '화물맨', '기타'])
export const vehicleType = pgEnum("vehicle_type", ['카고', '윙바디', '탑차', '냉장', '냉동', '트레일러'])
export const vehicleWeight = pgEnum("vehicle_weight", ['1톤', '1.4톤', '2.5톤', '3.5톤', '5톤', '8톤', '11톤', '18톤', '25톤'])


export const userTokens = pgTable("user_tokens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	refreshToken: text("refresh_token").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	isRevoked: boolean("is_revoked").default(false).notNull(),
	userAgent: text("user_agent"),
	ipAddress: text("ip_address"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_tokens_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const companyChangeLogs = pgTable("company_change_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	companyId: uuid("company_id").notNull(),
	changedBy: uuid("changed_by").notNull(),
	changedByName: varchar("changed_by_name", { length: 100 }).notNull(),
	changedByEmail: varchar("changed_by_email", { length: 100 }).notNull(),
	changedByAccessLevel: varchar("changed_by_access_level", { length: 50 }),
	changeType: varchar("change_type", { length: 30 }).notNull(),
	diff: json().notNull(),
	reason: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const userChangeLogs = pgTable("user_change_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	changedBy: uuid("changed_by").notNull(),
	changedByName: varchar("changed_by_name", { length: 100 }).notNull(),
	changedByEmail: varchar("changed_by_email", { length: 100 }).notNull(),
	changedByAccessLevel: varchar("changed_by_access_level", { length: 50 }),
	changeType: varchar("change_type", { length: 20 }).notNull(),
	diff: json().notNull(),
	reason: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const companies = pgTable("companies", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	businessNumber: varchar("business_number", { length: 20 }).notNull(),
	ceoName: varchar("ceo_name", { length: 50 }).notNull(),
	type: companyType().notNull(),
	status: companyStatus().default('active').notNull(),
	addressPostal: varchar("address_postal", { length: 10 }),
	addressRoad: varchar("address_road", { length: 200 }),
	addressDetail: varchar("address_detail", { length: 200 }),
	contactTel: varchar("contact_tel", { length: 20 }),
	contactMobile: varchar("contact_mobile", { length: 20 }),
	contactEmail: varchar("contact_email", { length: 100 }),
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	bankCode: bankCode("bank_code"),
	bankAccountNumber: varchar("bank_account_number", { length: 30 }),
	bankAccountHolder: varchar("bank_account_holder", { length: 50 }),
}, (table) => [
	unique("companies_business_number_unique").on(table.businessNumber),
]);

export const userLoginLogs = pgTable("user_login_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	loginAt: timestamp("login_at", { mode: 'string' }).defaultNow().notNull(),
	ipAddress: varchar("ip_address", { length: 50 }),
	userAgent: varchar("user_agent", { length: 500 }),
	success: boolean().notNull(),
	failReason: varchar("fail_reason", { length: 100 }),
});

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 100 }).notNull(),
	password: varchar({ length: 255 }),
	name: varchar({ length: 100 }).notNull(),
	phoneNumber: varchar("phone_number", { length: 20 }),
	companyId: uuid("company_id"),
	systemAccessLevel: systemAccessLevel("system_access_level").default('guest').notNull(),
	domains: json().default(["etc"]).notNull(),
	status: userStatus().default('active').notNull(),
	department: varchar({ length: 100 }),
	position: varchar({ length: 100 }),
	rank: varchar({ length: 100 }),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const companyWarningLogs = pgTable("company_warning_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	companyId: uuid("company_id"),
	warningId: uuid("warning_id"),
	action: varchar({ length: 20 }).notNull(),
	previousData: jsonb("previous_data"),
	newData: jsonb("new_data"),
	reason: text(),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const companyWarnings = pgTable("company_warnings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	companyId: uuid("company_id"),
	text: text().notNull(),
	category: varchar({ length: 50 }).default('기타'),
	sortOrder: integer("sort_order").default(0),
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const orderDispatches = pgTable("order_dispatches", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	brokerCompanyId: uuid("broker_company_id"),
	brokerCompanySnapshot: json("broker_company_snapshot"),
	brokerManagerId: uuid("broker_manager_id"),
	brokerManagerSnapshot: json("broker_manager_snapshot"),
	assignedDriverId: uuid("assigned_driver_id"),
	assignedDriverSnapshot: json("assigned_driver_snapshot"),
	assignedDriverPhone: varchar("assigned_driver_phone", { length: 100 }),
	assignedVehicleNumber: varchar("assigned_vehicle_number", { length: 20 }),
	assignedVehicleType: vehicleType("assigned_vehicle_type"),
	assignedVehicleWeight: vehicleWeight("assigned_vehicle_weight"),
	assignedVehicleConnection: vehicleConnection("assigned_vehicle_connection"),
	agreedFreightCost: numeric("agreed_freight_cost", { precision: 12, scale:  2 }),
	brokerMemo: varchar("broker_memo", { length: 500 }),
	createdBy: uuid("created_by").notNull(),
	updatedBy: uuid("updated_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	createdBySnapshot: json("created_by_snapshot"),
	updatedBySnapshot: json("updated_by_snapshot"),
	brokerFlowStatus: orderFlowStatus("broker_flow_status").default('배차대기').notNull(),
	isClosed: boolean("is_closed").default(false).notNull(),
	assignedDriverName: varchar("assigned_driver_name", { length: 100 }),
}, (table) => [
	foreignKey({
			columns: [table.assignedDriverId],
			foreignColumns: [drivers.id],
			name: "order_dispatches_assigned_driver_id_drivers_id_fk"
		}),
	foreignKey({
			columns: [table.brokerCompanyId],
			foreignColumns: [companies.id],
			name: "order_dispatches_broker_company_id_companies_id_fk"
		}),
	foreignKey({
			columns: [table.brokerManagerId],
			foreignColumns: [users.id],
			name: "order_dispatches_broker_manager_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "order_dispatches_created_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_dispatches_order_id_orders_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "order_dispatches_updated_by_users_id_fk"
		}),
]);

export const addresses = pgTable("addresses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	type: varchar({ length: 10 }).notNull(),
	roadAddress: text("road_address").notNull(),
	jibunAddress: text("jibun_address").notNull(),
	detailAddress: text("detail_address"),
	postalCode: varchar("postal_code", { length: 10 }),
	metadata: jsonb().default({}).notNull(),
	contactName: varchar("contact_name", { length: 50 }),
	contactPhone: varchar("contact_phone", { length: 20 }),
	memo: text(),
	isFrequent: boolean("is_frequent").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
	companyId: uuid("company_id"),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const driverAccounts = pgTable("driver_accounts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	driverId: uuid("driver_id").notNull(),
	email: varchar({ length: 100 }),
	permission: permissionType().default('일반').notNull(),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedBy: uuid("updated_by").notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "driver_accounts_created_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.driverId],
			foreignColumns: [drivers.id],
			name: "driver_accounts_driver_id_drivers_id_fk"
		}),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "driver_accounts_updated_by_users_id_fk"
		}),
]);

export const driverChangeLogs = pgTable("driver_change_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	driverId: uuid("driver_id").notNull(),
	changedBy: uuid("changed_by").notNull(),
	changedByName: varchar("changed_by_name", { length: 100 }).notNull(),
	changedByEmail: varchar("changed_by_email", { length: 100 }).notNull(),
	changedByAccessLevel: varchar("changed_by_access_level", { length: 50 }),
	changeType: varchar("change_type", { length: 30 }).notNull(),
	diff: json().notNull(),
	reason: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.changedBy],
			foreignColumns: [users.id],
			name: "driver_change_logs_changed_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.driverId],
			foreignColumns: [drivers.id],
			name: "driver_change_logs_driver_id_drivers_id_fk"
		}),
]);

export const addressChangeLogs = pgTable("address_change_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	addressId: uuid("address_id").notNull(),
	changedBy: uuid("changed_by").notNull(),
	changedByName: varchar("changed_by_name", { length: 100 }).notNull(),
	changedByEmail: varchar("changed_by_email", { length: 255 }).notNull(),
	changedByAccessLevel: varchar("changed_by_access_level", { length: 50 }),
	changeType: varchar("change_type", { length: 20 }).notNull(),
	changes: jsonb().notNull(),
	reason: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.addressId],
			foreignColumns: [addresses.id],
			name: "address_change_logs_address_id_addresses_id_fk"
		}),
]);

export const driverNotes = pgTable("driver_notes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	driverId: uuid("driver_id").notNull(),
	content: varchar({ length: 500 }).notNull(),
	date: timestamp({ mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedBy: uuid("updated_by").notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "driver_notes_created_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.driverId],
			foreignColumns: [drivers.id],
			name: "driver_notes_driver_id_drivers_id_fk"
		}),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "driver_notes_updated_by_users_id_fk"
		}),
]);

export const orders = pgTable("orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	companyId: uuid("company_id").notNull(),
	contactUserId: uuid("contact_user_id").notNull(),
	contactUserSnapshot: json("contact_user_snapshot"),
	flowStatus: orderFlowStatus("flow_status").default('운송요청').notNull(),
	cargoName: varchar("cargo_name", { length: 100 }),
	estimatedPriceAmount: numeric("estimated_price_amount", { precision: 12, scale:  2 }),
	pickupAddressId: uuid("pickup_address_id"),
	deliveryAddressId: uuid("delivery_address_id"),
	pickupAddressSnapshot: json("pickup_address_snapshot"),
	deliveryAddressSnapshot: json("delivery_address_snapshot"),
	pickupDate: date("pickup_date"),
	deliveryDate: date("delivery_date"),
	isCanceled: boolean("is_canceled").default(false),
	memo: varchar({ length: 500 }),
	createdBy: uuid("created_by").notNull(),
	createdBySnapshot: json("created_by_snapshot"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedBy: uuid("updated_by").notNull(),
	updatedBySnapshot: json("updated_by_snapshot"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	companySnapshot: json("company_snapshot"),
	contactUserPhone: varchar("contact_user_phone", { length: 100 }),
	contactUserMail: varchar("contact_user_mail", { length: 100 }),
	requestedVehicleType: vehicleType("requested_vehicle_type").default('카고').notNull(),
	requestedVehicleWeight: vehicleWeight("requested_vehicle_weight").default('1톤').notNull(),
	pickupAddressDetail: varchar("pickup_address_detail", { length: 100 }),
	pickupName: varchar("pickup_name", { length: 100 }),
	pickupContactName: varchar("pickup_contact_name", { length: 100 }),
	pickupContactPhone: varchar("pickup_contact_phone", { length: 100 }),
	deliveryAddressDetail: varchar("delivery_address_detail", { length: 100 }),
	deliveryName: varchar("delivery_name", { length: 100 }),
	deliveryContactName: varchar("delivery_contact_name", { length: 100 }),
	deliveryContactPhone: varchar("delivery_contact_phone", { length: 100 }),
	pickupTime: time("pickup_time"),
	deliveryTime: time("delivery_time"),
	transportOptions: json("transport_options"),
	priceSnapshot: json("price_snapshot"),
	priceType: priceType("price_type").default('기본').notNull(),
	taxType: taxType("tax_type").default('과세').notNull(),
	estimatedDistanceKm: numeric("estimated_distance_km", { precision: 10, scale:  2 }),
	estimatedDurationMinutes: integer("estimated_duration_minutes"),
	distanceCalculationMethod: calculationMethod("distance_calculation_method").default('api'),
	distanceCalculatedAt: timestamp("distance_calculated_at", { mode: 'string' }),
	distanceCacheId: uuid("distance_cache_id"),
	distanceMetadata: json("distance_metadata"),
}, (table) => [
	index("idx_orders_company_delivery_created").using("btree", table.companyId.asc().nullsLast().op("timestamp_ops"), table.createdAt.desc().nullsLast().op("uuid_ops")).where(sql`(delivery_address_snapshot IS NOT NULL)`),
	index("idx_orders_company_pickup_created").using("btree", table.companyId.asc().nullsLast().op("uuid_ops"), table.createdAt.desc().nullsLast().op("timestamp_ops")).where(sql`(pickup_address_snapshot IS NOT NULL)`),
	index("idx_orders_distance_method").using("btree", table.distanceCalculationMethod.asc().nullsLast().op("timestamp_ops"), table.createdAt.desc().nullsLast().op("timestamp_ops")),
	index("idx_orders_estimated_distance").using("btree", table.estimatedDistanceKm.asc().nullsLast().op("numeric_ops"), table.createdAt.desc().nullsLast().op("timestamp_ops")).where(sql`(estimated_distance_km IS NOT NULL)`),
]);

export const orderChangeLogs = pgTable("order_change_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	changeType: orderChangeType("change_type").notNull(),
	changedBy: uuid("changed_by").notNull(),
	changedByName: varchar("changed_by_name", { length: 100 }),
	changedByEmail: varchar("changed_by_email", { length: 100 }),
	changedByAccessLevel: varchar("changed_by_access_level", { length: 50 }),
	changedAt: timestamp("changed_at", { mode: 'string' }).defaultNow().notNull(),
	oldData: json("old_data"),
	newData: json("new_data"),
	reason: varchar({ length: 500 }),
});

export const drivers = pgTable("drivers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
	vehicleNumber: varchar("vehicle_number", { length: 20 }).notNull(),
	vehicleType: vehicleType("vehicle_type").notNull(),
	vehicleWeight: vehicleWeight("vehicle_weight").notNull(),
	addressSnapshot: json("address_snapshot"),
	companyId: uuid("company_id"),
	businessNumber: varchar("business_number", { length: 20 }).notNull(),
	manufactureYear: varchar("manufacture_year", { length: 10 }),
	isActive: boolean("is_active").default(true),
	inactiveReason: varchar("inactive_reason", { length: 200 }),
	lastDispatchedAt: timestamp("last_dispatched_at", { mode: 'string' }),
	createdBy: uuid("created_by"),
	createdBySnapshot: json("created_by_snapshot"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedBy: uuid("updated_by"),
	updatedBySnapshot: json("updated_by_snapshot"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	companyType: driverCompanyType("company_type").default('개인').notNull(),
	bankCode: bankCode("bank_code"),
	bankAccountNumber: varchar("bank_account_number", { length: 30 }),
	bankAccountHolder: varchar("bank_account_holder", { length: 50 }),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "drivers_company_id_companies_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "drivers_created_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "drivers_updated_by_users_id_fk"
		}),
]);

export const chargeGroups = pgTable("charge_groups", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	dispatchId: uuid("dispatch_id"),
	stage: chargeStage().notNull(),
	reason: chargeReason().notNull(),
	description: text(),
	isLocked: boolean("is_locked").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by").notNull(),
	updatedBy: uuid("updated_by").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "charge_groups_created_by_users_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.dispatchId],
			foreignColumns: [orderDispatches.id],
			name: "charge_groups_dispatch_id_order_dispatches_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "charge_groups_order_id_orders_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "charge_groups_updated_by_users_id_fk"
		}).onDelete("set null"),
]);

export const chargeLines = pgTable("charge_lines", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	groupId: uuid("group_id").notNull(),
	side: chargeSide().notNull(),
	amount: numeric({ precision: 14, scale:  2 }).notNull(),
	memo: text(),
	taxRate: numeric("tax_rate", { precision: 5, scale:  2 }).default('10'),
	taxAmount: numeric("tax_amount", { precision: 14, scale:  2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by").notNull(),
	updatedBy: uuid("updated_by").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "charge_lines_created_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [chargeGroups.id],
			name: "charge_lines_group_id_charge_groups_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "charge_lines_updated_by_users_id_fk"
		}),
]);

export const orderSales = pgTable("order_sales", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	companyId: uuid("company_id").notNull(),
	invoiceNumber: varchar("invoice_number", { length: 100 }),
	status: invoiceStatus().default('draft').notNull(),
	issueDate: timestamp("issue_date", { mode: 'string' }),
	dueDate: timestamp("due_date", { mode: 'string' }),
	subtotalAmount: numeric("subtotal_amount", { precision: 14, scale:  2 }).notNull(),
	taxAmount: numeric("tax_amount", { precision: 14, scale:  2 }),
	totalAmount: numeric("total_amount", { precision: 14, scale:  2 }).notNull(),
	financialSnapshot: jsonb("financial_snapshot"),
	memo: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "order_sales_company_id_companies_id_fk"
		}),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_sales_order_id_orders_id_fk"
		}).onDelete("cascade"),
]);

export const creditNotes = pgTable("credit_notes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderSaleId: uuid("order_sale_id"),
	salesBundleId: uuid("sales_bundle_id"),
	creditNoteNumber: varchar("credit_note_number", { length: 100 }),
	type: adjustmentType().notNull(),
	status: adjustmentStatus().default('draft').notNull(),
	issueDate: timestamp("issue_date", { mode: 'string' }),
	amount: numeric({ precision: 14, scale:  2 }).notNull(),
	taxAmount: numeric("tax_amount", { precision: 14, scale:  2 }),
	totalAmount: numeric("total_amount", { precision: 14, scale:  2 }).notNull(),
	reason: text().notNull(),
	snapshot: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
}, (table) => [
	foreignKey({
			columns: [table.orderSaleId],
			foreignColumns: [orderSales.id],
			name: "credit_notes_order_sale_id_order_sales_id_fk"
		}),
	foreignKey({
			columns: [table.salesBundleId],
			foreignColumns: [salesBundles.id],
			name: "credit_notes_sales_bundle_id_sales_bundles_id_fk"
		}),
]);

export const debitNotes = pgTable("debit_notes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderPurchaseId: uuid("order_purchase_id"),
	purchaseBundleId: uuid("purchase_bundle_id"),
	debitNoteNumber: varchar("debit_note_number", { length: 100 }),
	type: adjustmentType().notNull(),
	status: adjustmentStatus().default('draft').notNull(),
	issueDate: timestamp("issue_date", { mode: 'string' }),
	amount: numeric({ precision: 14, scale:  2 }).notNull(),
	taxAmount: numeric("tax_amount", { precision: 14, scale:  2 }),
	totalAmount: numeric("total_amount", { precision: 14, scale:  2 }).notNull(),
	reason: text().notNull(),
	snapshot: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
}, (table) => [
	foreignKey({
			columns: [table.orderPurchaseId],
			foreignColumns: [orderPurchases.id],
			name: "debit_notes_order_purchase_id_order_purchases_id_fk"
		}),
	foreignKey({
			columns: [table.purchaseBundleId],
			foreignColumns: [purchaseBundles.id],
			name: "debit_notes_purchase_bundle_id_purchase_bundles_id_fk"
		}),
]);

export const salesBundleItems = pgTable("sales_bundle_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bundleId: uuid("bundle_id").notNull(),
	orderSalesId: uuid("order_sales_id").notNull(),
	baseAmount: numeric("base_amount", { precision: 12, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.bundleId],
			foreignColumns: [salesBundles.id],
			name: "sales_bundle_items_bundle_id_sales_bundles_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.orderSalesId],
			foreignColumns: [orderSales.id],
			name: "sales_bundle_items_order_sales_id_order_sales_id_fk"
		}),
]);

export const purchaseBundleItems = pgTable("purchase_bundle_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bundleId: uuid("bundle_id").notNull(),
	orderPurchaseId: uuid("order_purchase_id").notNull(),
	baseAmount: numeric("base_amount", { precision: 12, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.bundleId],
			foreignColumns: [purchaseBundles.id],
			name: "purchase_bundle_items_bundle_id_purchase_bundles_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.orderPurchaseId],
			foreignColumns: [orderPurchases.id],
			name: "purchase_bundle_items_order_purchase_id_order_purchases_id_fk"
		}),
]);

export const salesBundleAdjustments = pgTable("sales_bundle_adjustments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bundleId: uuid("bundle_id").notNull(),
	type: bundleAdjType().notNull(),
	description: varchar({ length: 200 }),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	taxAmount: numeric("tax_amount", { precision: 12, scale:  2 }).notNull(),
	createdBy: uuid("created_by").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.bundleId],
			foreignColumns: [salesBundles.id],
			name: "sales_bundle_adjustments_bundle_id_sales_bundles_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "sales_bundle_adjustments_created_by_users_id_fk"
		}).onDelete("cascade"),
]);

export const salesItemAdjustments = pgTable("sales_item_adjustments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bundleItemId: uuid("bundle_item_id").notNull(),
	type: bundleAdjType().notNull(),
	description: varchar({ length: 200 }),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	taxAmount: numeric("tax_amount", { precision: 12, scale:  2 }).notNull(),
	createdBy: uuid("created_by").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.bundleItemId],
			foreignColumns: [salesBundleItems.id],
			name: "sales_item_adjustments_bundle_item_id_sales_bundle_items_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "sales_item_adjustments_created_by_users_id_fk"
		}).onDelete("cascade"),
]);

export const distanceCache = pgTable("distance_cache", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	pickupAddressId: uuid("pickup_address_id").notNull(),
	deliveryAddressId: uuid("delivery_address_id").notNull(),
	pickupCoordinates: json("pickup_coordinates").notNull(),
	deliveryCoordinates: json("delivery_coordinates").notNull(),
	distanceKm: numeric("distance_km", { precision: 10, scale:  2 }).notNull(),
	durationMinutes: integer("duration_minutes").notNull(),
	routePriority: routePriority("route_priority").default('RECOMMEND').notNull(),
	kakaoResponse: json("kakao_response"),
	isValid: boolean("is_valid").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_distance_cache_address_pair").using("btree", table.pickupAddressId.asc().nullsLast().op("uuid_ops"), table.deliveryAddressId.asc().nullsLast().op("uuid_ops"), table.routePriority.asc().nullsLast().op("uuid_ops")),
	index("idx_distance_cache_latest").using("btree", table.pickupAddressId.asc().nullsLast().op("timestamp_ops"), table.deliveryAddressId.asc().nullsLast().op("timestamp_ops"), table.createdAt.desc().nullsLast().op("timestamp_ops")),
	index("idx_distance_cache_valid").using("btree", table.isValid.asc().nullsLast().op("timestamp_ops"), table.createdAt.desc().nullsLast().op("timestamp_ops")).where(sql`(is_valid = true)`),
	foreignKey({
			columns: [table.deliveryAddressId],
			foreignColumns: [addresses.id],
			name: "distance_cache_delivery_address_id_addresses_id_fk"
		}),
	foreignKey({
			columns: [table.pickupAddressId],
			foreignColumns: [addresses.id],
			name: "distance_cache_pickup_address_id_addresses_id_fk"
		}),
]);

export const kakaoApiUsage = pgTable("kakao_api_usage", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	apiType: kakaoApiType("api_type").notNull(),
	endpoint: varchar({ length: 200 }),
	requestParams: json("request_params").notNull(),
	responseStatus: integer("response_status").notNull(),
	responseTimeMs: integer("response_time_ms").notNull(),
	success: boolean().notNull(),
	errorMessage: varchar("error_message", { length: 500 }),
	resultCount: integer("result_count"),
	userId: uuid("user_id"),
	ipAddress: varchar("ip_address", { length: 45 }).notNull(),
	userAgent: varchar("user_agent", { length: 500 }),
	estimatedCost: integer("estimated_cost"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_kakao_api_usage_daily_stats").using("btree", sql`date(created_at)`, sql`api_type`, sql`success`),
	index("idx_kakao_api_usage_errors").using("btree", table.responseStatus.asc().nullsLast().op("timestamp_ops"), table.createdAt.desc().nullsLast().op("timestamp_ops")).where(sql`(success = false)`),
	index("idx_kakao_api_usage_performance").using("btree", table.responseTimeMs.asc().nullsLast().op("timestamp_ops"), table.createdAt.desc().nullsLast().op("timestamp_ops")),
	index("idx_kakao_api_usage_success_date").using("btree", table.success.asc().nullsLast().op("timestamp_ops"), table.createdAt.desc().nullsLast().op("bool_ops")),
	index("idx_kakao_api_usage_type_date").using("btree", table.apiType.asc().nullsLast().op("timestamp_ops"), table.createdAt.desc().nullsLast().op("timestamp_ops")),
	index("idx_kakao_api_usage_user_date").using("btree", table.userId.asc().nullsLast().op("uuid_ops"), table.createdAt.desc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "kakao_api_usage_user_id_users_id_fk"
		}),
]);

export const salesBundles = pgTable("sales_bundles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	companyId: uuid("company_id").notNull(),
	periodFrom: date("period_from"),
	periodTo: date("period_to"),
	invoiceNo: varchar("invoice_no", { length: 50 }),
	totalAmount: numeric("total_amount", { precision: 14, scale:  2 }),
	status: salesBundleStatus().default('draft').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	companySnapshot: jsonb("company_snapshot"),
	managerId: uuid("manager_id"),
	managerSnapshot: jsonb("manager_snapshot"),
	paymentMethod: paymentMethod("payment_method").default('bank_transfer').notNull(),
	bankCode: bankCode("bank_code"),
	bankAccount: varchar("bank_account", { length: 30 }),
	bankAccountHolder: varchar("bank_account_holder", { length: 50 }),
	settlementMemo: varchar("settlement_memo", { length: 200 }),
	periodType: bundlePeriodType("period_type").default('departure').notNull(),
	invoiceIssuedAt: date("invoice_issued_at"),
	depositRequestedAt: date("deposit_requested_at"),
	depositReceivedAt: date("deposit_received_at"),
	settlementConfirmedAt: date("settlement_confirmed_at"),
	settlementBatchId: varchar("settlement_batch_id", { length: 50 }),
	settledAt: date("settled_at"),
	totalTaxAmount: numeric("total_tax_amount", { precision: 14, scale:  2 }),
	totalAmountWithTax: numeric("total_amount_with_tax", { precision: 14, scale:  2 }),
	companiesSnapshot: jsonb("companies_snapshot"),
	itemExtraAmount: numeric("item_extra_amount", { precision: 14, scale:  2 }),
	itemExtraAmountTax: numeric("item_extra_amount_tax", { precision: 14, scale:  2 }),
	bundleExtraAmount: numeric("bundle_extra_amount", { precision: 14, scale:  2 }),
	bundleExtraAmountTax: numeric("bundle_extra_amount_tax", { precision: 14, scale:  2 }),
	createdBy: uuid("created_by").notNull(),
	updatedBy: uuid("updated_by").notNull(),
	orderCount: integer("order_count").default(0).notNull(),
	companyName: varchar("company_name", { length: 50 }),
	companyBusinessNumber: varchar("company_business_number", { length: 20 }),
}, (table) => [
	index("idx_sales_bundles_company_bn").using("btree", table.companyBusinessNumber.asc().nullsLast().op("text_ops")),
	index("idx_sales_bundles_company_name").using("btree", table.companyName.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "sales_bundles_company_id_companies_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "sales_bundles_created_by_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.managerId],
			foreignColumns: [users.id],
			name: "sales_bundles_manager_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "sales_bundles_updated_by_users_id_fk"
		}).onDelete("cascade"),
]);

export const orderPurchases = pgTable("order_purchases", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	companyId: uuid("company_id").notNull(),
	invoiceNumber: varchar("invoice_number", { length: 100 }),
	status: paymentStatus().default('draft').notNull(),
	issueDate: timestamp("issue_date", { mode: 'string' }),
	paymentDate: timestamp("payment_date", { mode: 'string' }),
	subtotalAmount: numeric("subtotal_amount", { precision: 14, scale:  2 }).notNull(),
	taxAmount: numeric("tax_amount", { precision: 14, scale:  2 }),
	totalAmount: numeric("total_amount", { precision: 14, scale:  2 }).notNull(),
	financialSnapshot: jsonb("financial_snapshot"),
	memo: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "order_purchases_company_id_companies_id_fk"
		}),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_purchases_order_id_orders_id_fk"
		}).onDelete("cascade"),
]);

export const purchaseBundleAdjustments = pgTable("purchase_bundle_adjustments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bundleId: uuid("bundle_id").notNull(),
	type: bundleAdjType().notNull(),
	description: varchar({ length: 200 }),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	taxAmount: numeric("tax_amount", { precision: 12, scale:  2 }).notNull(),
	createdBy: uuid("created_by").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.bundleId],
			foreignColumns: [purchaseBundles.id],
			name: "purchase_bundle_adjustments_bundle_id_purchase_bundles_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "purchase_bundle_adjustments_created_by_users_id_fk"
		}).onDelete("cascade"),
]);

export const purchaseItemAdjustments = pgTable("purchase_item_adjustments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bundleItemId: uuid("bundle_item_id").notNull(),
	type: bundleAdjType().notNull(),
	description: varchar({ length: 200 }),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	taxAmount: numeric("tax_amount", { precision: 12, scale:  2 }).notNull(),
	createdBy: uuid("created_by").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.bundleItemId],
			foreignColumns: [purchaseBundleItems.id],
			name: "purchase_item_adjustments_bundle_item_id_purchase_bundle_items_"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "purchase_item_adjustments_created_by_users_id_fk"
		}).onDelete("cascade"),
]);

export const smsTemplates = pgTable("sms_templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roleType: roleType("role_type").notNull(),
	messageType: messageType("message_type").notNull(),
	templateBody: text("template_body").notNull(),
	isActive: boolean("is_active").default(true),
});

export const purchaseBundles = pgTable("purchase_bundles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	companyId: uuid("company_id"),
	managerId: uuid("manager_id"),
	periodFrom: date("period_from"),
	periodTo: date("period_to"),
	totalAmount: numeric("total_amount", { precision: 14, scale:  2 }),
	status: purchaseBundleStatus().default('draft').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	companyName: varchar("company_name", { length: 50 }),
	companyBusinessNumber: varchar("company_business_number", { length: 20 }),
	companySnapshot: jsonb("company_snapshot"),
	companiesSnapshot: jsonb("companies_snapshot"),
	managerSnapshot: jsonb("manager_snapshot"),
	orderCount: integer("order_count").default(0).notNull(),
	paymentMethod: paymentMethod("payment_method").default('bank_transfer').notNull(),
	bankCode: bankCode("bank_code"),
	bankAccount: varchar("bank_account", { length: 30 }),
	bankAccountHolder: varchar("bank_account_holder", { length: 50 }),
	settlementMemo: varchar("settlement_memo", { length: 200 }),
	periodType: bundlePeriodType("period_type").default('departure').notNull(),
	invoiceIssuedAt: date("invoice_issued_at"),
	depositRequestedAt: date("deposit_requested_at"),
	depositReceivedAt: date("deposit_received_at"),
	settlementConfirmedAt: date("settlement_confirmed_at"),
	settlementBatchId: varchar("settlement_batch_id", { length: 50 }),
	settledAt: date("settled_at"),
	invoiceNo: varchar("invoice_no", { length: 50 }),
	totalTaxAmount: numeric("total_tax_amount", { precision: 14, scale:  2 }),
	totalAmountWithTax: numeric("total_amount_with_tax", { precision: 14, scale:  2 }),
	itemExtraAmount: numeric("item_extra_amount", { precision: 14, scale:  2 }),
	itemExtraAmountTax: numeric("item_extra_amount_tax", { precision: 14, scale:  2 }),
	bundleExtraAmount: numeric("bundle_extra_amount", { precision: 14, scale:  2 }),
	bundleExtraAmountTax: numeric("bundle_extra_amount_tax", { precision: 14, scale:  2 }),
	createdBy: uuid("created_by").notNull(),
	updatedBy: uuid("updated_by").notNull(),
	driverId: uuid("driver_id"),
	driverName: varchar("driver_name", { length: 50 }),
	driverBusinessNumber: varchar("driver_business_number", { length: 20 }),
	driverSnapshot: jsonb("driver_snapshot"),
}, (table) => [
	index("idx_purchase_bundles_company_bn").using("btree", table.companyBusinessNumber.asc().nullsLast().op("text_ops")),
	index("idx_purchase_bundles_company_name").using("btree", table.companyName.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "purchase_bundles_company_id_companies_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "purchase_bundles_created_by_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.driverId],
			foreignColumns: [drivers.id],
			name: "purchase_bundles_driver_id_drivers_id_fk"
		}),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "purchase_bundles_updated_by_users_id_fk"
		}).onDelete("cascade"),
]);

export const smsMessages = pgTable("sms_messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	senderId: uuid("sender_id").notNull(),
	messageBody: text("message_body").notNull(),
	messageType: messageType("message_type").notNull(),
	requestStatus: requestStatus("request_status").default('pending'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	dispatchedAt: timestamp("dispatched_at", { withTimezone: true, mode: 'string' }),
});

export const orderParticipants = pgTable("order_participants", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	roleType: roleType("role_type").notNull(),
	name: varchar({ length: 100 }).notNull(),
	phone: varchar({ length: 20 }).notNull(),
	sourceType: sourceType("source_type").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const smsRecipients = pgTable("sms_recipients", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	smsMessageId: uuid("sms_message_id").notNull(),
	recipientName: varchar("recipient_name", { length: 100 }).notNull(),
	recipientPhone: varchar("recipient_phone", { length: 20 }).notNull(),
	roleType: roleType("role_type").notNull(),
	deliveryStatus: deliveryStatus("delivery_status").default('pending'),
	errorMessage: text("error_message"),
	sentAt: timestamp("sent_at", { withTimezone: true, mode: 'string' }),
	apiMessageId: varchar("api_message_id", { length: 100 }),
}, (table) => [
	foreignKey({
			columns: [table.smsMessageId],
			foreignColumns: [smsMessages.id],
			name: "sms_recipients_sms_message_id_sms_messages_id_fk"
		}).onDelete("cascade"),
]);
