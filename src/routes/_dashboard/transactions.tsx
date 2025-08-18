import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { AddTransactionSheet } from '~/components/transactions/add-transaction-sheet';
import { DataTable } from '~/components/transactions/transactions-table';

export const Route = createFileRoute('/_dashboard/transactions')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.transactions.list, {})
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: transactions } = useSuspenseQuery(
    convexQuery(api.transactions.list, {})
  );
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <AddTransactionSheet />
      </div>

      <DataTable data={transactions ?? []} />
    </div>
  );
}
