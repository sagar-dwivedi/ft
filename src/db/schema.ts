import { sqliteTable, text, integer, real, index, unique } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' })
    .$defaultFn(() => false)
    .notNull(),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', {
    mode: 'timestamp',
  }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', {
    mode: 'timestamp',
  }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

// Accounts
export const accounts = sqliteTable(
  'accounts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
    name: text('name').notNull(),
    type: text('type', {
      enum: ['checking', 'savings', 'credit_card', 'cash', 'investment', 'loan', 'other'],
    }).notNull(),
    balance: real('balance').default(0),
    currency: text('currency').default('USD'),
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    isIncludeInTotal: integer('is_include_in_total', { mode: 'boolean' }).default(true),
    institution: text('institution'),
    accountNumber: text('account_number'),
    color: text('color').default('#3b82f6'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(new Date()),
  },
  (table) => [index('accounts_user_idx').on(table.userId)]
);

// Categories
export const categories = sqliteTable(
  'categories',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
    name: text('name').notNull(),
    type: text('type', { enum: ['income', 'expense'] }).notNull(),
    icon: text('icon').default('help-circle'),
    color: text('color').default('#6b7280'),
    parentId: integer('parent_id').references(() => categories.id),
    isSystem: integer('is_system', { mode: 'boolean' }).default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(new Date()),
  },
  (table) => [
    unique().on(table.userId, table.name, table.type),
    index('categories_user_idx').on(table.userId),
    index('categories_parent_idx').on(table.parentId),
  ]
);

// Transactions
export const transactions = sqliteTable(
  'transactions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
    accountId: integer('account_id')
      .references(() => accounts.id, { onDelete: 'cascade' })
      .notNull(),
    categoryId: integer('category_id').references(() => categories.id),

    type: text('type', { enum: ['income', 'expense', 'transfer'] }).notNull(),
    amount: real('amount').notNull(),
    description: text('description').notNull(),
    notes: text('notes'),

    date: integer('date', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(new Date()),

    // Transfer specific
    transferToAccountId: integer('transfer_to_account_id').references(() => accounts.id),

    // Additional data
    payee: text('payee'),
    tags: text('tags'), // JSON string
    attachments: text('attachments'), // JSON string
    isRecurring: integer('is_recurring', { mode: 'boolean' }).default(false),
    recurringRule: text('recurring_rule'), // JSON string

    // Metadata
    location: text('location'), // JSON string {lat, lng, address}
    receipt: text('receipt'), // base64 image or file URL
  },
  (table) => [
    index('transactions_user_date_idx').on(table.userId, table.date),
    index('transactions_account_date_idx').on(table.accountId, table.date),
    index('transactions_category_idx').on(table.categoryId),
    index('transactions_transfer_idx').on(table.transferToAccountId),
  ]
);

// Budgets
export const budgets = sqliteTable(
  'budgets',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
    categoryId: integer('category_id')
      .references(() => categories.id, { onDelete: 'cascade' })
      .notNull(),

    amount: real('amount').notNull(),
    period: text('period', { enum: ['weekly', 'monthly', 'yearly'] }).default('monthly'),

    // Budget period
    startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
    endDate: integer('end_date', { mode: 'timestamp' }).notNull(),

    // Rollover settings
    isRollover: integer('is_rollover', { mode: 'boolean' }).default(false),
    rolloverAmount: real('rollover_amount').default(0),

    // Alerts as JSON string
    alerts: text('alerts').default(
      '[{"percentage":80,"enabled":true},{"percentage":100,"enabled":true}]'
    ),

    createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(new Date()),
  },
  (table) => [
    unique().on(table.userId, table.categoryId, table.startDate),
    index('budgets_user_idx').on(table.userId),
  ]
);

// Budget period tracking
export const budgetPeriods = sqliteTable('budget_periods', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  budgetId: integer('budget_id')
    .references(() => budgets.id, { onDelete: 'cascade' })
    .notNull(),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  allocatedAmount: real('allocated_amount').notNull(),
  spentAmount: real('spent_amount').default(0),
  rolloverFromPrevious: real('rollover_from_previous').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()),
});

// Financial goals
export const goals = sqliteTable('goals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),

  name: text('name').notNull(),
  description: text('description'),
  targetAmount: real('target_amount').notNull(),
  currentAmount: real('current_amount').default(0),

  type: text('type', {
    enum: ['emergency_fund', 'vacation', 'retirement', 'purchase', 'debt_payoff', 'other'],
  }).notNull(),
  targetDate: integer('target_date', { mode: 'timestamp' }),

  // Goal settings
  isAutoContribute: integer('is_auto_contribute', { mode: 'boolean' }).default(false),
  autoContributeAmount: real('auto_contribute_amount'),
  autoContributeRule: text('auto_contribute_rule'), // JSON string

  color: text('color').default('#10b981'),
  image: text('image'),

  createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(new Date()),
});

// Goal contributions
export const goalContributions = sqliteTable('goal_contributions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  goalId: integer('goal_id')
    .references(() => goals.id, { onDelete: 'cascade' })
    .notNull(),
  transactionId: integer('transaction_id').references(() => transactions.id, {
    onDelete: 'cascade',
  }),

  amount: real('amount').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  notes: text('notes'),

  createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()),
});

// Recurring transactions
export const recurringTransactions = sqliteTable('recurring_transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),

  name: text('name').notNull(),
  description: text('description'),

  frequency: text('frequency', { enum: ['daily', 'weekly', 'monthly', 'yearly'] }).notNull(),
  interval: integer('interval').default(1),

  amount: real('amount').notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  accountId: integer('account_id')
    .references(() => accounts.id, { onDelete: 'cascade' })
    .notNull(),

  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }),

  nextOccurrence: integer('next_occurrence', { mode: 'timestamp' }).notNull(),

  isActive: integer('is_active', { mode: 'boolean' }).default(true),

  createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(new Date()),
});

// User preferences
export const userPreferences = sqliteTable('user_preferences', {
  userId: integer('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .primaryKey(),

  currency: text('currency').default('USD'),
  dateFormat: text('date_format').default('MM/dd/yyyy'),
  timezone: text('timezone').default('UTC'),

  // JSON strings for complex data
  dashboardLayout: text('dashboard_layout'),
  notifications: text('notifications'),

  // Privacy settings
  isAnalyticsEnabled: integer('is_analytics_enabled', { mode: 'boolean' }).default(true),
  isMarketingEmails: integer('is_marketing_emails', { mode: 'boolean' }).default(false),

  createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(new Date()),
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
