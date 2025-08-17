import { v } from 'convex/values';
import { query } from './_generated/server';
import { getMonthBounds, getPreviousMonthBounds } from './helpers';
import { api } from './_generated/api';

// Get user's total balance across all active accounts
export const getTotalBalance = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    // Use the compound index for userId and isArchived
    const accounts = await ctx.db
      .query('accounts')
      .withIndex('by_user_archived', (q) =>
        q.eq('userId', args.userId).eq('isArchived', false)
      )
      .collect();

    const totalBalance = accounts.reduce((sum, account) => {
      if (account.type === 'credit') {
        return sum - Math.abs(account.balance);
      }
      return sum + account.balance;
    }, 0);

    return totalBalance;
  },
});

// Get current month's income and expenses
export const getMonthlyFinancials = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const now = new Date();
    const { start, end } = getMonthBounds(now);

    // Use the by_user_date index for efficient range queries
    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_user_date', (q) =>
        q.eq('userId', args.userId).gte('date', start).lte('date', end)
      )
      .collect();

    let income = 0;
    let expenses = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === 'income' || transaction.amount > 0) {
        income += Math.abs(transaction.amount);
      } else if (transaction.type === 'expense' || transaction.amount < 0) {
        expenses += Math.abs(transaction.amount);
      }
    });

    return {
      income,
      expenses,
      netSavings: income - expenses,
    };
  },
});

// Get previous month's financials for comparison
export const getPreviousMonthFinancials = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const now = new Date();
    const { start, end } = getPreviousMonthBounds(now);

    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_user_date', (q) =>
        q.eq('userId', args.userId).gte('date', start).lte('date', end)
      )
      .collect();

    let income = 0;
    let expenses = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === 'income' || transaction.amount > 0) {
        income += Math.abs(transaction.amount);
      } else if (transaction.type === 'expense' || transaction.amount < 0) {
        expenses += Math.abs(transaction.amount);
      }
    });

    return {
      income,
      expenses,
      netSavings: income - expenses,
    };
  },
});

// Get recent transactions (last 10)
export const getRecentTransactions = query({
  args: {
    userId: v.id('users'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    // Use the by_user_date index and order by date descending
    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_user_date', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(limit);

    // Enrich with account and category information
    const enrichedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        const account = await ctx.db.get(transaction.accountId);
        const category = transaction.categoryId
          ? await ctx.db.get(transaction.categoryId)
          : null;

        return {
          id: transaction._id,
          description: transaction.payee || `${transaction.type} transaction`,
          amount: transaction.amount,
          type: transaction.type,
          date: new Date(transaction.date).toISOString(),
          category: category?.name || 'Uncategorized',
          account: account?.name || 'Unknown Account',
          note: transaction.note,
        };
      })
    );

    return enrichedTransactions;
  },
});

// Get user's savings goals (using budgets table as savings goals)
export const getSavingsGoals = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    // Use the by_user index for categories
    const categories = await ctx.db
      .query('categories')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
    const savingsCategories = categories.filter(
      (cat) =>
        cat.name === 'Emergency Fund' ||
        cat.name === 'Savings' ||
        cat.name === 'Investment'
    );

    if (savingsCategories.length === 0) {
      return null;
    }

    const savingsCategory = savingsCategories[0];

    // Get current year/month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Get budget for savings category
    const budgets = await ctx.db
      .query('budgets')
      .withIndex('by_user_year_month', (q) =>
        q
          .eq('userId', args.userId)
          .eq('year', currentYear)
          .eq('month', currentMonth)
      )
      .collect();
    const budget = budgets.find((b) => b.categoryId === savingsCategory._id);

    // Calculate current savings amount (all transactions for this category this year)
    const yearStart = new Date(currentYear, 0, 1).getTime();

    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_user_date', (q) => q.eq('userId', args.userId))
      .collect();
    const savingsTransactions = transactions.filter(
      (t) => t.date >= yearStart && t.categoryId === savingsCategory._id
    );

    const currentAmount = savingsTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    return {
      title: savingsCategory.name,
      target: budget?.amount || 10000,
      current: Math.max(0, currentAmount),
    };
  },
});

type DashboardData = {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netSavings: number;
  savingsGoal: { title: string; target: number; current: number };
  recentTransactions: any[]; // Replace with your actual transaction type
  monthlyComparison: {
    income: { current: number; previous: number; change: number };
    expenses: { current: number; previous: number; change: number };
    savings: { current: number; previous: number; change: number };
  };
};

// Main dashboard data query that combines everything
export const getDashboardData = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args): Promise<DashboardData> => {
    const [
      totalBalance,
      currentMonth,
      previousMonth,
      recentTransactions,
      savingsGoal,
    ] = await Promise.all([
      ctx.runQuery(api.dashboard.getTotalBalance, {
        userId: args.userId,
      }),
      ctx.runQuery(api.dashboard.getMonthlyFinancials, {
        userId: args.userId,
      }),
      ctx.runQuery(api.dashboard.getPreviousMonthFinancials, {
        userId: args.userId,
      }),
      ctx.runQuery(api.dashboard.getRecentTransactions, {
        userId: args.userId,
        limit: 5,
      }),
      ctx.runQuery(api.dashboard.getSavingsGoals, {
        userId: args.userId,
      }),
    ]);

    // Calculate percentage changes
    const incomeChange =
      previousMonth.income > 0
        ? ((currentMonth.income - previousMonth.income) /
            previousMonth.income) *
          100
        : 0;

    const expensesChange =
      previousMonth.expenses > 0
        ? ((currentMonth.expenses - previousMonth.expenses) /
            previousMonth.expenses) *
          100
        : 0;

    const savingsChange =
      previousMonth.netSavings > 0
        ? ((currentMonth.netSavings - previousMonth.netSavings) /
            previousMonth.netSavings) *
          100
        : 0;

    return {
      totalBalance,
      monthlyIncome: currentMonth.income,
      monthlyExpenses: currentMonth.expenses,
      netSavings: currentMonth.netSavings,
      savingsGoal: savingsGoal || {
        title: 'Emergency Fund',
        target: 10000,
        current: 0,
      },
      recentTransactions,
      monthlyComparison: {
        income: {
          current: currentMonth.income,
          previous: previousMonth.income,
          change: incomeChange,
        },
        expenses: {
          current: currentMonth.expenses,
          previous: previousMonth.expenses,
          change: expensesChange,
        },
        savings: {
          current: currentMonth.netSavings,
          previous: previousMonth.netSavings,
          change: savingsChange,
        },
      },
    };
  },
});

// Get user's accounts summary
export const getAccountsSummary = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const accounts = await ctx.db
      .query('accounts')
      .withIndex('by_user_archived', (q) =>
        q.eq('userId', args.userId).eq('isArchived', false)
      )
      .collect();

    return accounts.map((account) => ({
      id: account._id,
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
    }));
  },
});

// Helper query to get categories for dropdown/selection
export const getUserCategories = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query('categories')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    return categories.map((cat) => ({
      id: cat._id,
      name: cat.name,
      parentId: cat.parentId,
      color: cat.color,
    }));
  },
});
