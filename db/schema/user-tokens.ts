import { relations } from 'drizzle-orm';
import { 
  timestamp, 
  pgTable,
  text, 
  primaryKey, 
  uuid, 
  boolean,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const userTokens = pgTable('user_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  refreshToken: text('refresh_token').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  isRevoked: boolean('is_revoked').default(false).notNull(),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
});

// 사용자와의 관계 설정
export const userTokensRelations = relations(userTokens, ({ one }) => ({
  user: one(users, {
    fields: [userTokens.userId],
    references: [users.id],
  }),
})); 