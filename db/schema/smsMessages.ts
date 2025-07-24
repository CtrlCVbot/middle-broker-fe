

// drizzle schema for sms dispatch system
import { pgTable, uuid, text, varchar, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ENUMs
export const messageTypeEnum = pgEnum('message_type', ['complete', 'update', 'cancel', 'custom']);
export const requestStatusEnum = pgEnum('request_status', ['pending', 'dispatched', 'failed']);
export const deliveryStatusEnum = pgEnum('delivery_status', ['pending', 'success', 'failed', 'invalid_number']);
export const roleTypeEnum = pgEnum('role_type', ['requester', 'shipper', 'load', 'unload', 'broker', 'driver']);
export const sourceTypeEnum = pgEnum('source_type', ['manual', 'system_imported']);

// sms_messages
export const smsMessages = pgTable('sms_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull(),
  senderId: uuid('sender_id').notNull(),
  messageBody: text('message_body').notNull(),
  messageType: messageTypeEnum('message_type').notNull(),
  requestStatus: requestStatusEnum('request_status').default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  dispatchedAt: timestamp('dispatched_at', { withTimezone: true }),
});

// sms_recipients
export const smsRecipients = pgTable('sms_recipients', {
  id: uuid('id').primaryKey().defaultRandom(),
  smsMessageId: uuid('sms_message_id').references(() => smsMessages.id, { onDelete: 'cascade' }).notNull(),
  recipientName: varchar('recipient_name', { length: 100 }).notNull(),
  recipientPhone: varchar('recipient_phone', { length: 20 }).notNull(),
  roleType: roleTypeEnum('role_type').notNull(),
  deliveryStatus: deliveryStatusEnum('delivery_status').default('pending'),
  errorMessage: text('error_message'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  apiMessageId: varchar('api_message_id', { length: 100 }),
});

// sms_templates
export const smsTemplates = pgTable('sms_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  roleType: roleTypeEnum('role_type').notNull(),
  messageType: messageTypeEnum('message_type').notNull(),
  templateBody: text('template_body').notNull(),
  isActive: boolean('is_active').default(true),
});

// order_participants
export const orderParticipants = pgTable('order_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull(),
  roleType: roleTypeEnum('role_type').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  sourceType: sourceTypeEnum('source_type').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Relations (optional)
export const smsMessagesRelations = relations(smsMessages, ({ many }) => ({
  recipients: many(smsRecipients),
}));

export const smsRecipientsRelations = relations(smsRecipients, ({ one }) => ({
  message: one(smsMessages, {
    fields: [smsRecipients.smsMessageId],
    references: [smsMessages.id],
  }),
}));
