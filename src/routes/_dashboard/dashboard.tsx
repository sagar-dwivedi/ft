import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CreditCard,
  DollarSign,
  Eye,
  Loader2,
  MoreHorizontal,
  PiggyBank,
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Progress } from '~/components/ui/progress';
import { Skeleton } from '~/components/ui/skeleton';
import { formatCurrency, formatDate } from '~/lib/utils';

export const Route = createFileRoute('/_dashboard/dashboard')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.dashboard.getDashboardData, {
        userId: context.user?.id as Id<'users'>,
      })
    );
  },
  component: RouteComponent,
});

function FinancialSummaryCard({
  title,
  amount,
  change,
  icon: Icon,
  trend,
  loading = false,
}: {
  title: string;
  amount?: number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down';
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {amount !== undefined ? formatCurrency(amount) : '---'}
            </div>
            {change !== undefined && (
              <div className="text-muted-foreground flex items-center text-xs">
                {trend === 'up' ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span
                  className={trend === 'up' ? 'text-green-500' : 'text-red-500'}
                >
                  {change > 0 ? '+' : ''}
                  {change.toFixed(1)}%
                </span>
                <span className="ml-1">from last month</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SavingsGoalCard({
  savingsGoal,
  loading = false,
}: {
  savingsGoal?: any;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-8 w-20" />
        </CardContent>
      </Card>
    );
  }

  if (!savingsGoal) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Set a Savings Goal</CardTitle>
          <CardDescription>
            Start tracking your progress toward financial goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Goal
          </Button>
        </CardContent>
      </Card>
    );
  }

  const progress = (savingsGoal.current / savingsGoal.target) * 100;
  const remaining = savingsGoal.target - savingsGoal.current;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{savingsGoal.title}</CardTitle>
            <CardDescription>
              {remaining > 0
                ? `${formatCurrency(remaining)} remaining to reach your goal`
                : 'Goal achieved! 🎉'}
            </CardDescription>
          </div>
          <Target className="text-muted-foreground h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span>{formatCurrency(savingsGoal.current)}</span>
          <span>{formatCurrency(savingsGoal.target)}</span>
        </div>
        <Progress value={Math.min(progress, 100)} className="h-2" />
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{progress.toFixed(1)}% Complete</Badge>
          <Button size="sm" className="h-8">
            <Plus className="mr-1 h-3 w-3" />
            Add Funds
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentTransactions({
  transactions,
  loading = false,
}: {
  transactions?: any[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No transactions found</p>
            <Button className="mt-4" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Button variant="outline" size="sm">
            <Eye className="mr-1 h-3 w-3" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`rounded-full p-2 ${
                  transaction.type === 'income'
                    ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                    : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                }`}
              >
                {transaction.type === 'income' ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownLeft className="h-3 w-3" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{transaction.description}</p>
                <p className="text-muted-foreground text-xs">
                  {transaction.category} • {formatDate(transaction.date)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-sm font-medium ${
                  transaction.type === 'income'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {transaction.type === 'income' || transaction.amount > 0
                  ? '+'
                  : ''}
                {formatCurrency(Math.abs(transaction.amount))}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Manage your finances efficiently</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Button className="h-auto justify-start p-3" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          <div className="text-left">
            <div className="font-medium">Add Transaction</div>
            <div className="text-muted-foreground text-xs">
              Record income or expense
            </div>
          </div>
        </Button>
        <Button className="h-auto justify-start p-3" variant="outline">
          <CreditCard className="mr-2 h-4 w-4" />
          <div className="text-left">
            <div className="font-medium">Transfer Money</div>
            <div className="text-muted-foreground text-xs">
              Between accounts
            </div>
          </div>
        </Button>
        <Button className="h-auto justify-start p-3" variant="outline">
          <Target className="mr-2 h-4 w-4" />
          <div className="text-left">
            <div className="font-medium">Set Savings Goal</div>
            <div className="text-muted-foreground text-xs">
              Plan for the future
            </div>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}

function DashboardError({ error }: { error: Error }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Unable to load dashboard data</p>
      </div>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Data</CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
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
