import { ConvexError, v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) return [];

    const userId = identity.subject as Id<'users'>;

    return ctx.db
      .query('accounts')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .collect();
  },
});

export const create = mutation({
  args: {
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
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) throw new ConvexError('Unauthorized');

    const userId = identity.subject as Id<'users'>;
    return ctx.db.insert('accounts', {
      ...args,
      userId,
      balance: 0,
      isArchived: false,
    });
  },
});
