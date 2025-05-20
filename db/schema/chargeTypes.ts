import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { chargeGroups } from './chargeGroups';
import { chargeLines } from './chargeLines';
import { orderSales } from './orderSales';
import { salesChargeItems } from './orderSales';
import { orderPurchases } from './orderPurchases';
import { purchaseChargeItems } from './orderPurchases';
import { salesBundles } from './salesBundles';
import { salesBundleItems } from './salesBundles';
import { salesBundleAdjustments } from './salesBundles';
import { salesItemAdjustments } from './salesBundles';
import { purchaseBundles } from './purchaseBundles';
import { purchaseBundleItems } from './purchaseBundles';
import { purchaseBundleAdjustments } from './purchaseBundles';
import { purchaseItemAdjustments } from './purchaseBundles';
import { creditNotes } from './creditNotes';
import { debitNotes } from './creditNotes';

// 운임 그룹 스키마
export const ChargeGroupSchema = createSelectSchema(chargeGroups);
export const NewChargeGroupSchema = createInsertSchema(chargeGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 운임 라인 스키마
export const ChargeLineSchema = createSelectSchema(chargeLines);
export const NewChargeLineSchema = createInsertSchema(chargeLines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 매출 인보이스 스키마
export const OrderSaleSchema = createSelectSchema(orderSales);
export const NewOrderSaleSchema = createInsertSchema(orderSales).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 매출 인보이스 항목 스키마
export const SalesChargeItemSchema = createSelectSchema(salesChargeItems);
export const NewSalesChargeItemSchema = createInsertSchema(salesChargeItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 매입 전표 스키마
export const OrderPurchaseSchema = createSelectSchema(orderPurchases);
export const NewOrderPurchaseSchema = createInsertSchema(orderPurchases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 매입 전표 항목 스키마
export const PurchaseChargeItemSchema = createSelectSchema(purchaseChargeItems);
export const NewPurchaseChargeItemSchema = createInsertSchema(purchaseChargeItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 매출 번들 스키마
export const SalesBundleSchema = createSelectSchema(salesBundles);
export const NewSalesBundleSchema = createInsertSchema(salesBundles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 매출 번들 아이템 스키마
export const SalesBundleItemSchema = createSelectSchema(salesBundleItems);
export const NewSalesBundleItemSchema = createInsertSchema(salesBundleItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 매출 번들 조정 스키마
export const SalesBundleAdjustmentSchema = createSelectSchema(salesBundleAdjustments);
export const NewSalesBundleAdjustmentSchema = createInsertSchema(salesBundleAdjustments).omit({
  id: true,
  createdAt: true,
});

// 매출 아이템 조정 스키마
export const SalesItemAdjustmentSchema = createSelectSchema(salesItemAdjustments);
export const NewSalesItemAdjustmentSchema = createInsertSchema(salesItemAdjustments).omit({
  id: true,
  createdAt: true,
});

// 매입 번들 스키마
export const PurchaseBundleSchema = createSelectSchema(purchaseBundles);
export const NewPurchaseBundleSchema = createInsertSchema(purchaseBundles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 매입 번들 아이템 스키마
export const PurchaseBundleItemSchema = createSelectSchema(purchaseBundleItems);
export const NewPurchaseBundleItemSchema = createInsertSchema(purchaseBundleItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 매입 번들 조정 스키마
export const PurchaseBundleAdjustmentSchema = createSelectSchema(purchaseBundleAdjustments);
export const NewPurchaseBundleAdjustmentSchema = createInsertSchema(purchaseBundleAdjustments).omit({
  id: true,
  createdAt: true,
});

// 매입 아이템 조정 스키마
export const PurchaseItemAdjustmentSchema = createSelectSchema(purchaseItemAdjustments);
export const NewPurchaseItemAdjustmentSchema = createInsertSchema(purchaseItemAdjustments).omit({
  id: true,
  createdAt: true,
});

// Credit Note 스키마
export const CreditNoteSchema = createSelectSchema(creditNotes);
export const NewCreditNoteSchema = createInsertSchema(creditNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Debit Note 스키마
export const DebitNoteSchema = createSelectSchema(debitNotes);
export const NewDebitNoteSchema = createInsertSchema(debitNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScript 인터페이스 정의
export interface IChargeGroup extends z.infer<typeof ChargeGroupSchema> {}
export interface INewChargeGroup extends z.infer<typeof NewChargeGroupSchema> {}

export interface IChargeLine extends z.infer<typeof ChargeLineSchema> {}
export interface INewChargeLine extends z.infer<typeof NewChargeLineSchema> {}

export interface IOrderSale extends z.infer<typeof OrderSaleSchema> {}
export interface INewOrderSale extends z.infer<typeof NewOrderSaleSchema> {}

export interface ISalesChargeItem extends z.infer<typeof SalesChargeItemSchema> {}
export interface INewSalesChargeItem extends z.infer<typeof NewSalesChargeItemSchema> {}

export interface IOrderPurchase extends z.infer<typeof OrderPurchaseSchema> {}
export interface INewOrderPurchase extends z.infer<typeof NewOrderPurchaseSchema> {}

export interface IPurchaseChargeItem extends z.infer<typeof PurchaseChargeItemSchema> {}
export interface INewPurchaseChargeItem extends z.infer<typeof NewPurchaseChargeItemSchema> {}

export interface ISalesBundle extends z.infer<typeof SalesBundleSchema> {}
export interface INewSalesBundle extends z.infer<typeof NewSalesBundleSchema> {}

export interface ISalesBundleItem extends z.infer<typeof SalesBundleItemSchema> {}
export interface INewSalesBundleItem extends z.infer<typeof NewSalesBundleItemSchema> {}

export interface ISalesBundleAdjustment extends z.infer<typeof SalesBundleAdjustmentSchema> {}
export interface INewSalesBundleAdjustment extends z.infer<typeof NewSalesBundleAdjustmentSchema> {}

export interface ISalesItemAdjustment extends z.infer<typeof SalesItemAdjustmentSchema> {}
export interface INewSalesItemAdjustment extends z.infer<typeof NewSalesItemAdjustmentSchema> {}

export interface IPurchaseBundle extends z.infer<typeof PurchaseBundleSchema> {}
export interface INewPurchaseBundle extends z.infer<typeof NewPurchaseBundleSchema> {}

export interface IPurchaseBundleItem extends z.infer<typeof PurchaseBundleItemSchema> {}
export interface INewPurchaseBundleItem extends z.infer<typeof NewPurchaseBundleItemSchema> {}

export interface IPurchaseBundleAdjustment extends z.infer<typeof PurchaseBundleAdjustmentSchema> {}
export interface INewPurchaseBundleAdjustment extends z.infer<typeof NewPurchaseBundleAdjustmentSchema> {}

export interface IPurchaseItemAdjustment extends z.infer<typeof PurchaseItemAdjustmentSchema> {}
export interface INewPurchaseItemAdjustment extends z.infer<typeof NewPurchaseItemAdjustmentSchema> {}

export interface ICreditNote extends z.infer<typeof CreditNoteSchema> {}
export interface INewCreditNote extends z.infer<typeof NewCreditNoteSchema> {}

export interface IDebitNote extends z.infer<typeof DebitNoteSchema> {}
export interface INewDebitNote extends z.infer<typeof NewDebitNoteSchema> {} 