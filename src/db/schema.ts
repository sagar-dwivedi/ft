import {
  pgTable,
  text,
  integer,
  real,
  index,
  unique,
  timestamp,
  serial,
  pgEnum,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const accountTypeEnum = pgEnum('account_type', [
  'checking',
  'savings',
  'credit_card',
  'cash',
  'investment',
  'loan',
  'other',
]);
export const categoryTypeEnum = pgEnum('category_type', ['income', 'expense']);
export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense', 'transfer']);
export const budgetPeriodEnum = pgEnum('budget_period', ['weekly', 'monthly', 'yearly']);
export const goalTypeEnum = pgEnum('goal_type', [
  'emergency_fund',
  'vacation',
  'retirement',
  'purchase',
  'debt_payoff',
  'other',
]);
export const recurringFrequencyEnum = pgEnum('recurring_frequency', [
  'daily',
  'weekly',
  'monthly',
  'yearly',
]);

// User table
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified')
    .$defaultFn(() => false)
    .notNull(),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Sessions
export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

// Account providers
export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Verification
export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Accounts
export const accounts = pgTable(
  'accounts',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
    name: text('name').notNull(),
    type: accountTypeEnum('type').notNull(),
    balance: real('balance').default(0),
    currency: text('currency').default('USD'),
    isActive: boolean('is_active').default(true),
    isIncludeInTotal: boolean('is_include_in_total').default(true),
    institution: text('institution'),
    accountNumber: text('account_number'),
    color: text('color').default('#3b82f6'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [index('accounts_user_idx').on(table.userId)]
);

// Categories
export const categories = pgTable(
  'categories',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
    name: text('name').notNull(),
    type: categoryTypeEnum('type').notNull(),
    icon: text('icon').default('help-circle'),
    color: text('color').default('#6b7280'),
    parentId: integer('parent_id').references(() => categories.id),
    isSystem: boolean('is_system').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique().on(table.userId, table.name, table.type),
    index('categories_user_idx').on(table.userId),
    index('categories_parent_idx').on(table.parentId),
  ]
);

// Transactions
export const transactions = pgTable(
  'transactions',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
    accountId: integer('account_id')
      .references(() => accounts.id, { onDelete: 'cascade' })
      .notNull(),
    categoryId: integer('category_id').references(() => categories.id),
    type: transactionTypeEnum('type').notNull(),
    amount: real('amount').notNull(),
    description: text('description').notNull(),
    notes: text('notes'),
    date: timestamp('date', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    transferToAccountId: integer('transfer_to_account_id').references(() => accounts.id),
    payee: text('payee'),
    tags: text('tags'),
    attachments: text('attachments'),
    isRecurring: boolean('is_recurring').default(false),
    recurringRule: text('recurring_rule'),
    location: text('location'),
    receipt: text('receipt'),
  },
  (table) => [
    index('transactions_user_date_idx').on(table.userId, table.date),
    index('transactions_account_date_idx').on(table.accountId, table.date),
    index('transactions_category_idx').on(table.categoryId),
    index('transactions_transfer_idx').on(table.transferToAccountId),
  ]
);

// Budgets
export const budgets = pgTable(
  'budgets',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
    categoryId: integer('category_id')
      .references(() => categories.id, { onDelete: 'cascade' })
      .notNull(),
    amount: real('amount').notNull(),
    period: budgetPeriodEnum('period').default('monthly'),
    startDate: timestamp('start_date', { withTimezone: true }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true }).notNull(),
    isRollover: boolean('is_rollover').default(false),
    rolloverAmount: real('rollover_amount').default(0),
    alerts: text('alerts').default(
      '[{"percentage":80,"enabled":true},{"percentage":100,"enabled":true}]'
    ),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique().on(table.userId, table.categoryId, table.startDate),
    index('budgets_user_idx').on(table.userId),
  ]
);

// Budget periods
export const budgetPeriods = pgTable('budget_periods', {
  id: serial('id').primaryKey(),
  budgetId: integer('budget_id')
    .references(() => budgets.id, { onDelete: 'cascade' })
    .notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  allocatedAmount: real('allocated_amount').notNull(),
  spentAmount: real('spent_amount').default(0),
  rolloverFromPrevious: real('rollover_from_previous').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Goals
export const goals = pgTable('goals', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  targetAmount: real('target_amount').notNull(),
  currentAmount: real('current_amount').default(0),
  type: goalTypeEnum('type').notNull(),
  targetDate: timestamp('target_date', { withTimezone: true }),
  isAutoContribute: boolean('is_auto_contribute').default(false),
  autoContributeAmount: real('auto_contribute_amount'),
  autoContributeRule: text('auto_contribute_rule'),
  color: text('color').default('#10b981'),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Goal contributions
export const goalContributions = pgTable('goal_contributions', {
  id: serial('id').primaryKey(),
  goalId: integer('goal_id')
    .references(() => goals.id, { onDelete: 'cascade' })
    .notNull(),
  transactionId: integer('transaction_id').references(() => transactions.id, {
    onDelete: 'cascade',
  }),
  amount: real('amount').notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Recurring transactions
export const recurringTransactions = pgTable('recurring_transactions', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  frequency: recurringFrequencyEnum('frequency').notNull(),
  interval: integer('interval').default(1),
  amount: real('amount').notNull(),
  type: categoryTypeEnum('type').notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  accountId: integer('account_id')
    .references(() => accounts.id, { onDelete: 'cascade' })
    .notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  nextOccurrence: timestamp('next_occurrence', { withTimezone: true }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// User preferences
export const userPreferences = pgTable('user_preferences', {
  userId: text('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .primaryKey(),
  currency: text('currency').default('USD'),
  dateFormat: text('date_format').default('MM/dd/yyyy'),
  timezone: text('timezone').default('UTC'),
  dashboardLayout: text('dashboard_layout'),
  notifications: text('notifications'),
  isAnalyticsEnabled: boolean('is_analytics_enabled').default(true),
  isMarketingEmails: boolean('is_marketing_emails').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ================== RELATIONS ==================

// User relations
export const userRelations = relations(user, ({ many, one }) => ({
  accounts: many(accounts),
  categories: many(categories),
  transactions: many(transactions),
  budgets: many(budgets),
  goals: many(goals),
  recurringTransactions: many(recurringTransactions),
  preferences: one(userPreferences),
}));

// Accounts relations
export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(user, {
    fields: [accounts.userId],
    references: [user.id],
  }),
  transactions: many(transactions),
  transferFrom: many(transactions, { relationName: 'transferFrom' }),
  transferTo: many(transactions, { relationName: 'transferTo' }),
}));

// Categories relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(user, {
    fields: [categories.userId],
    references: [user.id],
  }),
  transactions: many(transactions),
  budgets: many(budgets),
  subcategories: many(categories, { relationName: 'subcategories' }),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'subcategories',
  }),
}));

// Transactions relations
export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(user, {
    fields: [transactions.userId],
    references: [user.id],
  }),
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  transferToAccount: one(accounts, {
    fields: [transactions.transferToAccountId],
    references: [accounts.id],
    relationName: 'transferTo',
  }),
}));

// Budgets relations
export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  user: one(user, {
    fields: [budgets.userId],
    references: [user.id],
  }),
  category: one(categories, {
    fields: [budgets.categoryId],
    references: [categories.id],
  }),
  periods: many(budgetPeriods),
}));

// Budget periods relations
export const budgetPeriodsRelations = relations(budgetPeriods, ({ one }) => ({
  budget: one(budgets, {
    fields: [budgetPeriods.budgetId],
    references: [budgets.id],
  }),
}));

// Goals relations
export const goalsRelations = relations(goals, ({ one, many }) => ({
  user: one(user, {
    fields: [goals.userId],
    references: [user.id],
  }),
  contributions: many(goalContributions),
}));

// Goal contributions relations
export const goalContributionsRelations = relations(goalContributions, ({ one }) => ({
  goal: one(goals, {
    fields: [goalContributions.goalId],
    references: [goals.id],
  }),
  transaction: one(transactions, {
    fields: [goalContributions.transactionId],
    references: [transactions.id],
  }),
}));

// Recurring transactions relations
export const recurringTransactionsRelations = relations(recurringTransactions, ({ one }) => ({
  user: one(user, {
    fields: [recurringTransactions.userId],
    references: [user.id],
  }),
  category: one(categories, {
    fields: [recurringTransactions.categoryId],
    references: [categories.id],
  }),
  account: one(accounts, {
    fields: [recurringTransactions.accountId],
    references: [accounts.id],
  }),
}));

// User preferences relations
export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(user, {
    fields: [userPreferences.userId],
    references: [user.id],
  }),
}));

// ================== TYPES ==================

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;

export type RecurringTransaction = typeof recurringTransactions.$inferSelect;
export type NewRecurringTransaction = typeof recurringTransactions.$inferInsert;

export type BudgetPeriod = typeof budgetPeriods.$inferSelect;
export type NewBudgetPeriod = typeof budgetPeriods.$inferInsert;

export type GoalContribution = typeof goalContributions.$inferSelect;
export type NewGoalContribution = typeof goalContributions.$inferInsert;

export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;
