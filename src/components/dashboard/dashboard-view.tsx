import { useSuspenseQuery } from '@tanstack/react-query';
import { dashboardQueryOptions } from '@/lib/api/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';
import { CategoryChart, SpendingChart } from './charts';
import { formatCurrency } from '@/lib/currency';
import { RecentTransactions } from './recent-transactions';

export function DashboardView() {
  const { data } = useSuspenseQuery(dashboardQueryOptions());

  const kpiCards = [
    {
      title: 'Total Balance',
      value: data.kpi.totalBalance || 0,
      icon: Wallet,
      color: 'text-green-600 dark:text-green-500',
    },
    {
      title: 'Monthly Spending',
      value: Math.abs(data.kpi.monthlySpending || 0),
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-500',
    },
    {
      title: 'Total Income',
      value: data.kpi.income || 0,
      icon: TrendingUp,
      color: 'text-blue-600 dark:text-blue-500',
    },
    {
      title: 'Savings Rate',
      value:
        data.kpi.income && data.kpi.income !== 0
          ? ((data.kpi.income - Math.abs(data.kpi.monthlySpending || 0)) / data.kpi.income) * 100
          : 0,
      icon: Target,
      color: 'text-purple-600 dark:text-purple-500',
      format: (val: number) => `${val.toFixed(1)}%`,
    },
  ];

  return (
    <div className="space-y-6 bg-background p-6 rounded-lg">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpi.format ? kpi.format(kpi.value) : formatCurrency(kpi.value)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Spending Trend</CardTitle>
              </CardHeader>
              <CardContent className="pl-2 h-[300px]">
                <SpendingChart data={data.trend} />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <CategoryChart data={data.categories} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentTransactions data={data.recent} />
        </CardContent>
      </Card>
    </div>
  );
}

// Matching Skeleton for smooth transitions
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 bg-background p-6 rounded-lg">
      {/* KPI Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <Skeleton className="h-4 w-[150px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <Skeleton className="h-4 w-[120px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Transactions Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-[150px]" />
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
