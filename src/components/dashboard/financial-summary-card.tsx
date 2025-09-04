import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { formatCurrency } from '~/lib/format';

export function FinancialSummaryCard({
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
