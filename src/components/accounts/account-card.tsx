import type { Doc } from 'convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { formatCurrency } from '~/lib/format';

export function AccountCard({ account }: { account: Doc<'accounts'> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{account.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{account.type}</p>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">
          {formatCurrency(account.balance, account.currency)}
        </p>
      </CardContent>
    </Card>
  );
}
