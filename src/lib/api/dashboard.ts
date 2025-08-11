import { db } from '@/db';
import { createServerFn } from '@tanstack/react-start';
import { desc, eq, sql, sum } from 'drizzle-orm';
import z from 'zod';
import { categories, transactions } from '@/db/schema';
import { queryOptions } from '@tanstack/react-query';

const getDashboardData = createServerFn({ method: 'GET' })
  .validator(
    z.object({
      range: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
    })
  )
  .handler(async ({ data: { range } }) => {
    const days = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }[range];

    const [kpiData, trendData, recentTx, categorySpending] = await Promise.all([
      // KPI Cards
      db
        .select({
          totalBalance: sum(transactions.amount),
          monthlySpending: sql<number | null>`
            SUM(
              CASE
                WHEN ${transactions.createdAt} >= datetime('now', '-' || ${days} || ' days')
                THEN ${transactions.amount}
                ELSE 0
              END
            )
          `,
          income: sql<number | null>`
            SUM(
              CASE
                WHEN ${transactions.amount} > 0
                THEN ${transactions.amount}
                ELSE 0
              END
            )
          `,
        })
        .from(transactions),

      // Trend Data
      db
        .select({
          date: sql<string>`DATE(${transactions.createdAt})`,
          spending: sql<
            number | null
          >`SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END)`,
          income: sql<
            number | null
          >`SUM(CASE WHEN ${transactions.amount} > 0 THEN ${transactions.amount} ELSE 0 END)`,
        })
        .from(transactions)
        .where(sql`${transactions.createdAt} >= datetime('now', '-' || ${days} || ' days')`)
        .groupBy(sql`DATE(${transactions.createdAt})`)
        .orderBy(sql`DATE(${transactions.createdAt})`),

      // Recent Transactions
      db
        .select({
          id: transactions.id,
          description: transactions.description,
          amount: transactions.amount,
          date: transactions.createdAt,
          category: categories.name,
        })
        .from(transactions)
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .orderBy(desc(transactions.createdAt))
        .limit(5),

      // Category Breakdown
      db
        .select({
          name: categories.name,
          value: sum(transactions.amount).mapWith(Number),
        })
        .from(transactions)
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          sql`${transactions.createdAt} >= datetime('now', '-' || ${days} || ' days') AND ${transactions.amount} < 0`
        )
        .groupBy(categories.name)
        .orderBy(sql`SUM(${transactions.amount}) ASC`)
        .limit(5),
    ]);

    return {
      kpi: kpiData[0],
      trend: trendData,
      recent: recentTx,
      categories: categorySpending,
    };
  });

export const dashboardQueryOptions = (range: '7d' | '30d' | '90d' | '1y' = '30d') =>
  queryOptions({
    queryKey: ['dashboard', range],
    queryFn: () => getDashboardData({ data: { range } }),
  });
