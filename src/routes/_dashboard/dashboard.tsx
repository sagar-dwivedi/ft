import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';
import {
  Calendar,
  DollarSign,
  Loader2,
  MoreHorizontal,
  PiggyBank,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { DashboardError } from '~/components/dashboard/dahsboard-error';
import { FinancialSummaryCard } from '~/components/dashboard/financial-summary-card';
import { QuickActions } from '~/components/dashboard/quick-actions';
import { RecentTransactions } from '~/components/dashboard/recent-transaction';
import { SavingsGoalCard } from '~/components/dashboard/saving-goal-card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Skeleton } from '~/components/ui/skeleton';
import { formatCurrency } from '~/lib/utils';

export const Route = createFileRoute('/_dashboard/dashboard')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.dashboard.getDashboardData, {
        userId: context.user?.id as Id<'users'>,
      })
    );
  },
  errorComponent: DashboardError,
  pendingComponent: DashboardLayoutSkeleton,
  component: RouteComponent,
});

function DashboardLayoutSkeleton() {
  return (
    <div className="flex h-screen">
      <div className="bg-sidebar w-64 border-r">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="flex-1">
        <div className="h-16 border-b p-4">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="p-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

function RouteComponent() {
  const { user } = Route.useRouteContext();

  // Query dashboard data
  const { data: dashboardData } = useQuery(
    convexQuery(api.dashboard.getDashboardData, {
      userId: user?.id as Id<'users'>,
    })
  );

  const currentTime = new Date().getHours();
  const greeting =
    currentTime < 12
      ? 'Good morning'
      : currentTime < 18
        ? 'Good afternoon'
        : 'Good evening';

  // Handle loading state
  if (dashboardData === undefined) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <FinancialSummaryCard
              key={i}
              title="Loading..."
              icon={Loader2}
              loading={true}
            />
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2">
            <SavingsGoalCard loading={true} />
          </div>
          <QuickActions />
          <div className="md:col-span-2">
            <RecentTransactions loading={true} />
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (dashboardData === null || (dashboardData as any)?.error) {
    return (
      <DashboardError error={new Error('Failed to load dashboard data')} />
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting}, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your finances today.
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FinancialSummaryCard
          title="Total Balance"
          amount={dashboardData.totalBalance}
          icon={DollarSign}
        />
        <FinancialSummaryCard
          title="Monthly Income"
          amount={dashboardData.monthlyIncome}
          change={dashboardData.monthlyComparison.income.change}
          trend="up"
          icon={TrendingUp}
        />
        <FinancialSummaryCard
          title="Monthly Expenses"
          amount={dashboardData.monthlyExpenses}
          change={dashboardData.monthlyComparison.expenses.change}
          trend="down"
          icon={TrendingDown}
        />
        <FinancialSummaryCard
          title="Net Savings"
          amount={dashboardData.netSavings}
          change={dashboardData.monthlyComparison.savings.change}
          trend="up"
          icon={PiggyBank}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Savings Goal */}
        <div className="md:col-span-2">
          <SavingsGoalCard savingsGoal={dashboardData.savingsGoal} />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Transactions */}
        <div className="md:col-span-2">
          <RecentTransactions transactions={dashboardData.recentTransactions} />
        </div>

        {/* Monthly Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">This Month</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Export Data</DropdownMenuItem>
                  <DropdownMenuItem>Set Budget</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Income</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(dashboardData.monthlyIncome)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Expenses</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(dashboardData.monthlyExpenses)}
                </span>
              </div>
              <hr />
              <div className="flex justify-between font-medium">
                <span>Net</span>
                <span className="text-green-600">
                  {formatCurrency(dashboardData.netSavings)}
                </span>
              </div>
            </div>
            <div className="pt-2">
              <Badge variant="outline" className="w-full justify-center">
                <Calendar className="mr-1 h-3 w-3" />
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
