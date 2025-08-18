import { CreditCard, Plus, Target } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

export function QuickActions() {
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
