// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  /* ----------------------------------------------------------
   * 1. USERS
   * ----------------------------------------------------------
   * Better Auth keeps its own auth tables;
   * this is your application-level user record.
   * -------------------------------------------------------- */
  users: defineTable({
    email: v.string(),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    currency: v.string(), // ISO-4217 code (USD, EUR, etc.)
  }),

  /* ----------------------------------------------------------
   * 2. ACCOUNTS
   * ----------------------------------------------------------
   * Checking, savings, cash wallet, credit-card, investment …
   * -------------------------------------------------------- */
  accounts: defineTable({
    userId: v.id('users'),
    name: v.string(),
    type: v.union(
      v.literal('checking'),
      v.literal('savings'),
      v.literal('credit'),
      v.literal('cash'),
      v.literal('investment'),
      v.literal('loan'),
      v.literal('other')
    ),
    balance: v.number(), // current balance in account’s native currency
    currency: v.string(),
    isArchived: v.boolean(),
  })
    .index('by_user', ['userId'])
    .index('by_user_archived', ['userId', 'isArchived']),

  /* ----------------------------------------------------------
   * 3. CATEGORIES
   * ----------------------------------------------------------
   * Hierarchical categories: Food → Restaurants, Groceries …
   * -------------------------------------------------------- */
  categories: defineTable({
    userId: v.id('users'),
    name: v.string(),
    parentId: v.optional(v.id('categories')), // null = top-level
    color: v.optional(v.string()), // hex
    isSystem: v.boolean(), // if you ship defaults
  })
    .index('by_user', ['userId'])
    .index('by_user_parent', ['userId', 'parentId']),

  /* ----------------------------------------------------------
   * 4. TRANSACTIONS
   * ----------------------------------------------------------
   * One row per spend, income or transfer.
   * -------------------------------------------------------- */
  transactions: defineTable({
    userId: v.id('users'),
    accountId: v.id('accounts'),
    categoryId: v.optional(v.id('categories')),
    amount: v.number(), // signed: positive = income, negative = spend
    currency: v.string(),
    date: v.number(), // epoch ms
    payee: v.optional(v.string()),
    note: v.optional(v.string()),
    tags: v.array(v.string()), // ["vacation", "work"]
    type: v.union(
      v.literal('expense'),
      v.literal('income'),
      v.literal('transfer')
    ),
    // If type = transfer, destination account
    transferToAccountId: v.optional(v.id('accounts')),
    // Optional attachment id (see attachments table below)
    attachmentId: v.optional(v.id('attachments')),
  })
    .index('by_user', ['userId'])
    .index('by_user_account', ['userId', 'accountId'])
    .index('by_user_date', ['userId', 'date']),

  /* ----------------------------------------------------------
   * 5. BUDGETS
   * ----------------------------------------------------------
   * Planned vs actual for each category per month.
   * -------------------------------------------------------- */
  budgets: defineTable({
    userId: v.id('users'),
    categoryId: v.id('categories'),
    year: v.number(),
    month: v.number(), // 0-11
    amount: v.number(), // budgeted amount in user’s default currency
  }).index('by_user_year_month', ['userId', 'year', 'month']),

  /* ----------------------------------------------------------
   * 6. RECURRING RULES
   * ----------------------------------------------------------
   * “Rent every 1st of month”, “Spotify every 30 days”, etc.
   * -------------------------------------------------------- */
  recurringRules: defineTable({
    userId: v.id('users'),
    accountId: v.id('accounts'),
    categoryId: v.optional(v.id('categories')),
    amount: v.number(),
    currency: v.string(),
    payee: v.optional(v.string()),
    note: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    frequency: v.union(
      v.literal('daily'),
      v.literal('weekly'),
      v.literal('monthly'),
      v.literal('yearly')
    ),
    interval: v.number(), // every N periods
    nextDueDate: v.number(),
  }).index('by_user_next', ['userId', 'nextDueDate']),

  /* ----------------------------------------------------------
   * 7. ATTACHMENTS (optional)
   * ----------------------------------------------------------
   * Store file metadata; actual file can live in S3 or UploadThing.
   * -------------------------------------------------------- */
  attachments: defineTable({
    userId: v.id('users'),
    filename: v.string(),
    byteSize: v.number(),
    url: v.string(), // presigned URL or public CDN URL
    uploadStatus: v.union(v.literal('pending'), v.literal('done')),
  }),
});
