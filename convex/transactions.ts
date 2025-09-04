import { ConvexError, v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

export const list = query({
  args: { accountId: v.optional(v.id('accounts')) },
  handler: async (ctx, { accountId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const userId = identity.subject as Id<'users'>;

    // Use the correct index based on whether accountId is provided
    let q;
    if (accountId) {
      q = ctx.db
        .query('transactions')
        .withIndex('by_user_account', (q) =>
          q.eq('userId', userId).eq('accountId', accountId)
        );
    } else {
      q = ctx.db
        .query('transactions')
        .withIndex('by_user', (q) => q.eq('userId', userId));
    }
    return q.order('desc').collect();
  },
});

export const create = mutation({
  args: {
    accountId: v.id('accounts'),
    amount: v.number(),
    currency: v.string(),
    date: v.number(),
    payee: v.optional(v.string()),
    note: v.optional(v.string()),
    type: v.union(
      v.literal('expense'),
      v.literal('income'),
      v.literal('transfer')
    ),
    categoryId: v.optional(v.id('categories')),
    transferToAccountId: v.optional(v.id('accounts')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError('Unauthorized');

    const userId = identity.subject as Id<'users'>;
    return ctx.db.insert('transactions', {
      ...args,
      userId,
      tags: [],
    });
  },
});
