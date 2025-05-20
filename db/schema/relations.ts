import { relations } from "drizzle-orm";
import { orders } from "./orders";
import { orderDispatches } from "./orderDispatches";
import { chargeGroups } from "./chargeGroups";
import { chargeLines } from "./chargeLines";
import { orderSales } from "./orderSales";
import { salesChargeItems } from "./orderSales";
import { orderPurchases } from "./orderPurchases";
import { purchaseChargeItems } from "./orderPurchases";
import { salesBundles } from "./salesBundles";
import { salesBundleItems } from "./salesBundles";
import { salesBundleAdjustments } from "./salesBundles";
import { salesItemAdjustments } from "./salesBundles";
import { purchaseBundles } from "./purchaseBundles";
import { purchaseBundleItems } from "./purchaseBundles";
import { purchaseBundleAdjustments } from "./purchaseBundles";
import { purchaseItemAdjustments } from "./purchaseBundles";
import { creditNotes } from "./creditNotes";
import { debitNotes } from "./creditNotes";
import { companies } from "./companies";

// 주문(Order) 관계 정의
export const ordersRelations = relations(orders, ({ one, many }) => ({
  chargeGroups: many(chargeGroups),
  orderSales: one(orderSales, {
    fields: [orders.id],
    references: [orderSales.orderId],
  }),
  orderPurchases: one(orderPurchases, {
    fields: [orders.id],
    references: [orderPurchases.orderId],
  }),
  dispatches: many(orderDispatches),
}));

// 배차(Dispatch) 관계 정의
export const orderDispatchesRelations = relations(orderDispatches, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderDispatches.orderId],
    references: [orders.id],
  }),
  chargeGroups: many(chargeGroups),
}));

// 운임 그룹(Charge Group) 관계 정의
export const chargeGroupsRelations = relations(chargeGroups, ({ one, many }) => ({
  order: one(orders, {
    fields: [chargeGroups.orderId],
    references: [orders.id],
  }),
  dispatch: one(orderDispatches, {
    fields: [chargeGroups.dispatchId],
    references: [orderDispatches.id],
  }),
  chargeLines: many(chargeLines),
}));

// 운임 라인(Charge Line) 관계 정의
export const chargeLinesRelations = relations(chargeLines, ({ one }) => ({
  group: one(chargeGroups, {
    fields: [chargeLines.groupId],
    references: [chargeGroups.id],
  }),
}));

// 매출 인보이스(Order Sale) 관계 정의
export const orderSalesRelations = relations(orderSales, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderSales.orderId],
    references: [orders.id],
  }),
  company: one(companies, {
    fields: [orderSales.companyId],
    references: [companies.id],
  }),
  chargeItems: many(salesChargeItems),
  bundleItems: many(salesBundleItems),
  creditNotes: many(creditNotes),
}));

// 매출 인보이스 항목(Sales Charge Item) 관계 정의
export const salesChargeItemsRelations = relations(salesChargeItems, ({ one }) => ({
  orderSale: one(orderSales, {
    fields: [salesChargeItems.orderSaleId],
    references: [orderSales.id],
  }),
}));

// 매입 전표(Order Purchase) 관계 정의
export const orderPurchasesRelations = relations(orderPurchases, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderPurchases.orderId],
    references: [orders.id],
  }),
  company: one(companies, {
    fields: [orderPurchases.companyId],
    references: [companies.id],
  }),
  chargeItems: many(purchaseChargeItems),
  bundleItems: many(purchaseBundleItems),
  debitNotes: many(debitNotes),
}));

// 매입 전표 항목(Purchase Charge Item) 관계 정의
export const purchaseChargeItemsRelations = relations(purchaseChargeItems, ({ one }) => ({
  orderPurchase: one(orderPurchases, {
    fields: [purchaseChargeItems.orderPurchaseId],
    references: [orderPurchases.id],
  }),
}));

// 매출 번들(Sales Bundle) 관계 정의
export const salesBundlesRelations = relations(salesBundles, ({ one, many }) => ({
  company: one(companies, {
    fields: [salesBundles.companyId],
    references: [companies.id],
  }),
  items: many(salesBundleItems),
  adjustments: many(salesBundleAdjustments),
  creditNotes: many(creditNotes),
}));

// 매출 번들 아이템(Sales Bundle Item) 관계 정의
export const salesBundleItemsRelations = relations(salesBundleItems, ({ one, many }) => ({
  bundle: one(salesBundles, {
    fields: [salesBundleItems.bundleId],
    references: [salesBundles.id],
  }),
  orderSale: one(orderSales, {
    fields: [salesBundleItems.orderSalesId],
    references: [orderSales.id],
  }),
  adjustments: many(salesItemAdjustments),
}));

// 매출 번들 조정(Sales Bundle Adjustment) 관계 정의
export const salesBundleAdjustmentsRelations = relations(salesBundleAdjustments, ({ one }) => ({
  bundle: one(salesBundles, {
    fields: [salesBundleAdjustments.bundleId],
    references: [salesBundles.id],
  }),
}));

// 매출 아이템 조정(Sales Item Adjustment) 관계 정의
export const salesItemAdjustmentsRelations = relations(salesItemAdjustments, ({ one }) => ({
  bundleItem: one(salesBundleItems, {
    fields: [salesItemAdjustments.bundleItemId],
    references: [salesBundleItems.id],
  }),
}));

// 매입 번들(Purchase Bundle) 관계 정의
export const purchaseBundlesRelations = relations(purchaseBundles, ({ one, many }) => ({
  company: one(companies, {
    fields: [purchaseBundles.companyId],
    references: [companies.id],
  }),
  items: many(purchaseBundleItems),
  adjustments: many(purchaseBundleAdjustments),
  debitNotes: many(debitNotes),
}));

// 매입 번들 아이템(Purchase Bundle Item) 관계 정의
export const purchaseBundleItemsRelations = relations(purchaseBundleItems, ({ one, many }) => ({
  bundle: one(purchaseBundles, {
    fields: [purchaseBundleItems.bundleId],
    references: [purchaseBundles.id],
  }),
  orderPurchase: one(orderPurchases, {
    fields: [purchaseBundleItems.orderPurchaseId],
    references: [orderPurchases.id],
  }),
  adjustments: many(purchaseItemAdjustments),
}));

// 매입 번들 조정(Purchase Bundle Adjustment) 관계 정의
export const purchaseBundleAdjustmentsRelations = relations(purchaseBundleAdjustments, ({ one }) => ({
  bundle: one(purchaseBundles, {
    fields: [purchaseBundleAdjustments.bundleId],
    references: [purchaseBundles.id],
  }),
}));

// 매입 아이템 조정(Purchase Item Adjustment) 관계 정의
export const purchaseItemAdjustmentsRelations = relations(purchaseItemAdjustments, ({ one }) => ({
  bundleItem: one(purchaseBundleItems, {
    fields: [purchaseItemAdjustments.bundleItemId],
    references: [purchaseBundleItems.id],
  }),
}));

// Credit Note(대변 전표) 관계 정의
export const creditNotesRelations = relations(creditNotes, ({ one }) => ({
  orderSale: one(orderSales, {
    fields: [creditNotes.orderSaleId],
    references: [orderSales.id],
  }),
  salesBundle: one(salesBundles, {
    fields: [creditNotes.salesBundleId],
    references: [salesBundles.id],
  }),
}));

// Debit Note(차변 전표) 관계 정의
export const debitNotesRelations = relations(debitNotes, ({ one }) => ({
  orderPurchase: one(orderPurchases, {
    fields: [debitNotes.orderPurchaseId],
    references: [orderPurchases.id],
  }),
  purchaseBundle: one(purchaseBundles, {
    fields: [debitNotes.purchaseBundleId],
    references: [purchaseBundles.id],
  }),
})); 