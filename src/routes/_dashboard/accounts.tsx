import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { AccountCard } from '~/components/accounts/account-card';
import { AddAccountSheet } from '~/components/accounts/add-account-sheet';

export const Route = createFileRoute('/_dashboard/accounts')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.accounts.list, {})
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: accounts } = useSuspenseQuery(
    convexQuery(api.accounts.list, {})
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
        <AddAccountSheet />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts?.map((a) => (
          <AccountCard key={a._id} account={a} />
        ))}
      </div>
    </div>
  );
}
