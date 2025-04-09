import { relations } from 'drizzle-orm';
import { users } from './users';
import { companies } from './companies';

// Users relations
export const usersRelations = relations(users, ({ one }) => ({
  company: one(companies, {
    fields: [users.company_id],
    references: [companies.id],
  }),
}));

// Companies relations
export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
})); 