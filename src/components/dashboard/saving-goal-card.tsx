import { Plus, Target } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { Skeleton } from '~/components/ui/skeleton';
import { formatCurrency } from '~/lib/format';

export function SavingsGoalCard({
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
