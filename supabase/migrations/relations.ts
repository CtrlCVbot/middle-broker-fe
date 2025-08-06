import { relations } from "drizzle-orm/relations";
import { users, userTokens, drivers, orderDispatches, companies, orders, driverAccounts, driverChangeLogs, addresses, addressChangeLogs, driverNotes, chargeGroups, chargeLines, orderSales, creditNotes, salesBundles, orderPurchases, debitNotes, purchaseBundles, salesBundleItems, purchaseBundleItems, salesBundleAdjustments, salesItemAdjustments, distanceCache, kakaoApiUsage, purchaseBundleAdjustments, purchaseItemAdjustments, smsMessages, smsRecipients } from "./schema";

export const userTokensRelations = relations(userTokens, ({one}) => ({
	user: one(users, {
		fields: [userTokens.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	userTokens: many(userTokens),
	orderDispatches_brokerManagerId: many(orderDispatches, {
		relationName: "orderDispatches_brokerManagerId_users_id"
	}),
	orderDispatches_createdBy: many(orderDispatches, {
		relationName: "orderDispatches_createdBy_users_id"
	}),
	orderDispatches_updatedBy: many(orderDispatches, {
		relationName: "orderDispatches_updatedBy_users_id"
	}),
	driverAccounts_createdBy: many(driverAccounts, {
		relationName: "driverAccounts_createdBy_users_id"
	}),
	driverAccounts_updatedBy: many(driverAccounts, {
		relationName: "driverAccounts_updatedBy_users_id"
	}),
	driverChangeLogs: many(driverChangeLogs),
	driverNotes_createdBy: many(driverNotes, {
		relationName: "driverNotes_createdBy_users_id"
	}),
	driverNotes_updatedBy: many(driverNotes, {
		relationName: "driverNotes_updatedBy_users_id"
	}),
	drivers_createdBy: many(drivers, {
		relationName: "drivers_createdBy_users_id"
	}),
	drivers_updatedBy: many(drivers, {
		relationName: "drivers_updatedBy_users_id"
	}),
	chargeGroups_createdBy: many(chargeGroups, {
		relationName: "chargeGroups_createdBy_users_id"
	}),
	chargeGroups_updatedBy: many(chargeGroups, {
		relationName: "chargeGroups_updatedBy_users_id"
	}),
	chargeLines_createdBy: many(chargeLines, {
		relationName: "chargeLines_createdBy_users_id"
	}),
	chargeLines_updatedBy: many(chargeLines, {
		relationName: "chargeLines_updatedBy_users_id"
	}),
	salesBundleAdjustments: many(salesBundleAdjustments),
	salesItemAdjustments: many(salesItemAdjustments),
	kakaoApiUsages: many(kakaoApiUsage),
	salesBundles_createdBy: many(salesBundles, {
		relationName: "salesBundles_createdBy_users_id"
	}),
	salesBundles_managerId: many(salesBundles, {
		relationName: "salesBundles_managerId_users_id"
	}),
	salesBundles_updatedBy: many(salesBundles, {
		relationName: "salesBundles_updatedBy_users_id"
	}),
	purchaseBundleAdjustments: many(purchaseBundleAdjustments),
	purchaseItemAdjustments: many(purchaseItemAdjustments),
	purchaseBundles_createdBy: many(purchaseBundles, {
		relationName: "purchaseBundles_createdBy_users_id"
	}),
	purchaseBundles_updatedBy: many(purchaseBundles, {
		relationName: "purchaseBundles_updatedBy_users_id"
	}),
}));

export const orderDispatchesRelations = relations(orderDispatches, ({one, many}) => ({
	driver: one(drivers, {
		fields: [orderDispatches.assignedDriverId],
		references: [drivers.id]
	}),
	company: one(companies, {
		fields: [orderDispatches.brokerCompanyId],
		references: [companies.id]
	}),
	user_brokerManagerId: one(users, {
		fields: [orderDispatches.brokerManagerId],
		references: [users.id],
		relationName: "orderDispatches_brokerManagerId_users_id"
	}),
	user_createdBy: one(users, {
		fields: [orderDispatches.createdBy],
		references: [users.id],
		relationName: "orderDispatches_createdBy_users_id"
	}),
	order: one(orders, {
		fields: [orderDispatches.orderId],
		references: [orders.id]
	}),
	user_updatedBy: one(users, {
		fields: [orderDispatches.updatedBy],
		references: [users.id],
		relationName: "orderDispatches_updatedBy_users_id"
	}),
	chargeGroups: many(chargeGroups),
}));

export const driversRelations = relations(drivers, ({one, many}) => ({
	orderDispatches: many(orderDispatches),
	driverAccounts: many(driverAccounts),
	driverChangeLogs: many(driverChangeLogs),
	driverNotes: many(driverNotes),
	company: one(companies, {
		fields: [drivers.companyId],
		references: [companies.id]
	}),
	user_createdBy: one(users, {
		fields: [drivers.createdBy],
		references: [users.id],
		relationName: "drivers_createdBy_users_id"
	}),
	user_updatedBy: one(users, {
		fields: [drivers.updatedBy],
		references: [users.id],
		relationName: "drivers_updatedBy_users_id"
	}),
	purchaseBundles: many(purchaseBundles),
}));

export const companiesRelations = relations(companies, ({many}) => ({
	orderDispatches: many(orderDispatches),
	drivers: many(drivers),
	orderSales: many(orderSales),
	salesBundles: many(salesBundles),
	orderPurchases: many(orderPurchases),
	purchaseBundles: many(purchaseBundles),
}));

export const ordersRelations = relations(orders, ({many}) => ({
	orderDispatches: many(orderDispatches),
	chargeGroups: many(chargeGroups),
	orderSales: many(orderSales),
	orderPurchases: many(orderPurchases),
}));

export const driverAccountsRelations = relations(driverAccounts, ({one}) => ({
	user_createdBy: one(users, {
		fields: [driverAccounts.createdBy],
		references: [users.id],
		relationName: "driverAccounts_createdBy_users_id"
	}),
	driver: one(drivers, {
		fields: [driverAccounts.driverId],
		references: [drivers.id]
	}),
	user_updatedBy: one(users, {
		fields: [driverAccounts.updatedBy],
		references: [users.id],
		relationName: "driverAccounts_updatedBy_users_id"
	}),
}));

export const driverChangeLogsRelations = relations(driverChangeLogs, ({one}) => ({
	user: one(users, {
		fields: [driverChangeLogs.changedBy],
		references: [users.id]
	}),
	driver: one(drivers, {
		fields: [driverChangeLogs.driverId],
		references: [drivers.id]
	}),
}));

export const addressChangeLogsRelations = relations(addressChangeLogs, ({one}) => ({
	address: one(addresses, {
		fields: [addressChangeLogs.addressId],
		references: [addresses.id]
	}),
}));

export const addressesRelations = relations(addresses, ({many}) => ({
	addressChangeLogs: many(addressChangeLogs),
	distanceCaches_deliveryAddressId: many(distanceCache, {
		relationName: "distanceCache_deliveryAddressId_addresses_id"
	}),
	distanceCaches_pickupAddressId: many(distanceCache, {
		relationName: "distanceCache_pickupAddressId_addresses_id"
	}),
}));

export const driverNotesRelations = relations(driverNotes, ({one}) => ({
	user_createdBy: one(users, {
		fields: [driverNotes.createdBy],
		references: [users.id],
		relationName: "driverNotes_createdBy_users_id"
	}),
	driver: one(drivers, {
		fields: [driverNotes.driverId],
		references: [drivers.id]
	}),
	user_updatedBy: one(users, {
		fields: [driverNotes.updatedBy],
		references: [users.id],
		relationName: "driverNotes_updatedBy_users_id"
	}),
}));

export const chargeGroupsRelations = relations(chargeGroups, ({one, many}) => ({
	user_createdBy: one(users, {
		fields: [chargeGroups.createdBy],
		references: [users.id],
		relationName: "chargeGroups_createdBy_users_id"
	}),
	orderDispatch: one(orderDispatches, {
		fields: [chargeGroups.dispatchId],
		references: [orderDispatches.id]
	}),
	order: one(orders, {
		fields: [chargeGroups.orderId],
		references: [orders.id]
	}),
	user_updatedBy: one(users, {
		fields: [chargeGroups.updatedBy],
		references: [users.id],
		relationName: "chargeGroups_updatedBy_users_id"
	}),
	chargeLines: many(chargeLines),
}));

export const chargeLinesRelations = relations(chargeLines, ({one}) => ({
	user_createdBy: one(users, {
		fields: [chargeLines.createdBy],
		references: [users.id],
		relationName: "chargeLines_createdBy_users_id"
	}),
	chargeGroup: one(chargeGroups, {
		fields: [chargeLines.groupId],
		references: [chargeGroups.id]
	}),
	user_updatedBy: one(users, {
		fields: [chargeLines.updatedBy],
		references: [users.id],
		relationName: "chargeLines_updatedBy_users_id"
	}),
}));

export const orderSalesRelations = relations(orderSales, ({one, many}) => ({
	company: one(companies, {
		fields: [orderSales.companyId],
		references: [companies.id]
	}),
	order: one(orders, {
		fields: [orderSales.orderId],
		references: [orders.id]
	}),
	creditNotes: many(creditNotes),
	salesBundleItems: many(salesBundleItems),
}));

export const creditNotesRelations = relations(creditNotes, ({one}) => ({
	orderSale: one(orderSales, {
		fields: [creditNotes.orderSaleId],
		references: [orderSales.id]
	}),
	salesBundle: one(salesBundles, {
		fields: [creditNotes.salesBundleId],
		references: [salesBundles.id]
	}),
}));

export const salesBundlesRelations = relations(salesBundles, ({one, many}) => ({
	creditNotes: many(creditNotes),
	salesBundleItems: many(salesBundleItems),
	salesBundleAdjustments: many(salesBundleAdjustments),
	company: one(companies, {
		fields: [salesBundles.companyId],
		references: [companies.id]
	}),
	user_createdBy: one(users, {
		fields: [salesBundles.createdBy],
		references: [users.id],
		relationName: "salesBundles_createdBy_users_id"
	}),
	user_managerId: one(users, {
		fields: [salesBundles.managerId],
		references: [users.id],
		relationName: "salesBundles_managerId_users_id"
	}),
	user_updatedBy: one(users, {
		fields: [salesBundles.updatedBy],
		references: [users.id],
		relationName: "salesBundles_updatedBy_users_id"
	}),
}));

export const debitNotesRelations = relations(debitNotes, ({one}) => ({
	orderPurchase: one(orderPurchases, {
		fields: [debitNotes.orderPurchaseId],
		references: [orderPurchases.id]
	}),
	purchaseBundle: one(purchaseBundles, {
		fields: [debitNotes.purchaseBundleId],
		references: [purchaseBundles.id]
	}),
}));

export const orderPurchasesRelations = relations(orderPurchases, ({one, many}) => ({
	debitNotes: many(debitNotes),
	purchaseBundleItems: many(purchaseBundleItems),
	company: one(companies, {
		fields: [orderPurchases.companyId],
		references: [companies.id]
	}),
	order: one(orders, {
		fields: [orderPurchases.orderId],
		references: [orders.id]
	}),
}));

export const purchaseBundlesRelations = relations(purchaseBundles, ({one, many}) => ({
	debitNotes: many(debitNotes),
	purchaseBundleItems: many(purchaseBundleItems),
	purchaseBundleAdjustments: many(purchaseBundleAdjustments),
	company: one(companies, {
		fields: [purchaseBundles.companyId],
		references: [companies.id]
	}),
	user_createdBy: one(users, {
		fields: [purchaseBundles.createdBy],
		references: [users.id],
		relationName: "purchaseBundles_createdBy_users_id"
	}),
	driver: one(drivers, {
		fields: [purchaseBundles.driverId],
		references: [drivers.id]
	}),
	user_updatedBy: one(users, {
		fields: [purchaseBundles.updatedBy],
		references: [users.id],
		relationName: "purchaseBundles_updatedBy_users_id"
	}),
}));

export const salesBundleItemsRelations = relations(salesBundleItems, ({one, many}) => ({
	salesBundle: one(salesBundles, {
		fields: [salesBundleItems.bundleId],
		references: [salesBundles.id]
	}),
	orderSale: one(orderSales, {
		fields: [salesBundleItems.orderSalesId],
		references: [orderSales.id]
	}),
	salesItemAdjustments: many(salesItemAdjustments),
}));

export const purchaseBundleItemsRelations = relations(purchaseBundleItems, ({one, many}) => ({
	purchaseBundle: one(purchaseBundles, {
		fields: [purchaseBundleItems.bundleId],
		references: [purchaseBundles.id]
	}),
	orderPurchase: one(orderPurchases, {
		fields: [purchaseBundleItems.orderPurchaseId],
		references: [orderPurchases.id]
	}),
	purchaseItemAdjustments: many(purchaseItemAdjustments),
}));

export const salesBundleAdjustmentsRelations = relations(salesBundleAdjustments, ({one}) => ({
	salesBundle: one(salesBundles, {
		fields: [salesBundleAdjustments.bundleId],
		references: [salesBundles.id]
	}),
	user: one(users, {
		fields: [salesBundleAdjustments.createdBy],
		references: [users.id]
	}),
}));

export const salesItemAdjustmentsRelations = relations(salesItemAdjustments, ({one}) => ({
	salesBundleItem: one(salesBundleItems, {
		fields: [salesItemAdjustments.bundleItemId],
		references: [salesBundleItems.id]
	}),
	user: one(users, {
		fields: [salesItemAdjustments.createdBy],
		references: [users.id]
	}),
}));

export const distanceCacheRelations = relations(distanceCache, ({one}) => ({
	address_deliveryAddressId: one(addresses, {
		fields: [distanceCache.deliveryAddressId],
		references: [addresses.id],
		relationName: "distanceCache_deliveryAddressId_addresses_id"
	}),
	address_pickupAddressId: one(addresses, {
		fields: [distanceCache.pickupAddressId],
		references: [addresses.id],
		relationName: "distanceCache_pickupAddressId_addresses_id"
	}),
}));

export const kakaoApiUsageRelations = relations(kakaoApiUsage, ({one}) => ({
	user: one(users, {
		fields: [kakaoApiUsage.userId],
		references: [users.id]
	}),
}));

export const purchaseBundleAdjustmentsRelations = relations(purchaseBundleAdjustments, ({one}) => ({
	purchaseBundle: one(purchaseBundles, {
		fields: [purchaseBundleAdjustments.bundleId],
		references: [purchaseBundles.id]
	}),
	user: one(users, {
		fields: [purchaseBundleAdjustments.createdBy],
		references: [users.id]
	}),
}));

export const purchaseItemAdjustmentsRelations = relations(purchaseItemAdjustments, ({one}) => ({
	purchaseBundleItem: one(purchaseBundleItems, {
		fields: [purchaseItemAdjustments.bundleItemId],
		references: [purchaseBundleItems.id]
	}),
	user: one(users, {
		fields: [purchaseItemAdjustments.createdBy],
		references: [users.id]
	}),
}));

export const smsRecipientsRelations = relations(smsRecipients, ({one}) => ({
	smsMessage: one(smsMessages, {
		fields: [smsRecipients.smsMessageId],
		references: [smsMessages.id]
	}),
}));

export const smsMessagesRelations = relations(smsMessages, ({many}) => ({
	smsRecipients: many(smsRecipients),
}));