import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/currency';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight } from 'lucide-react';

interface RecentTransaction {
  id: number;
  description: string;
  amount: number;
  date: Date | null;
  category: string | null;
}

interface RecentTransactionsProps {
  data: RecentTransaction[];
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  onTransactionClick?: (transaction: RecentTransaction) => void;
}

export function RecentTransactions({
  data,
  maxItems = 5,
  showViewAll = true,
  onViewAll,
  onTransactionClick,
}: RecentTransactionsProps) {
  // Sort by date (newest first)
  const sortedTransactions = [...data]
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, maxItems);

  if (sortedTransactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Transactions</CardTitle>
        {showViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll} className="text-sm">
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedTransactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onClick={() => onTransactionClick?.(transaction)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function TransactionItem({
  transaction,
  onClick,
}: {
  transaction: RecentTransaction;
  onClick?: () => void;
}) {
  const getCategoryIcon = (category: string | null) => {
    const icons: Record<string, string> = {
      food: '🍔',
      transport: '🚗',
      shopping: '🛍️',
      utilities: '💡',
      entertainment: '🎬',
      health: '💊',
      education: '📚',
      travel: '✈️',
      income: '💰',
      other: '📋',
    };

    if (!category) return icons['other'];

    const lowerCat = category.toLowerCase();
    return (
      icons[
        Object.keys(icons).find((key) => lowerCat.includes(key) || key.includes(lowerCat)) ||
          'other'
      ] || '📋'
    );
  };

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      food: 'bg-orange-100 text-orange-800',
      transport: 'bg-blue-100 text-blue-800',
      shopping: 'bg-pink-100 text-pink-800',
      utilities: 'bg-yellow-100 text-yellow-800',
      entertainment: 'bg-purple-100 text-purple-800',
      health: 'bg-red-100 text-red-800',
      education: 'bg-green-100 text-green-800',
      travel: 'bg-indigo-100 text-indigo-800',
      income: 'bg-emerald-100 text-emerald-800',
      other: 'bg-gray-100 text-gray-800',
    };

    if (!category) return colors['other'];

    const lowerCat = category.toLowerCase();
    return (
      colors[
        Object.keys(colors).find((key) => lowerCat.includes(key) || key.includes(lowerCat)) ||
          'other'
      ] || colors['other']
    );
  };

  const isExpense = transaction.amount < 0;
  const absAmount = Math.abs(transaction.amount);
  const dateDisplay = transaction.date
    ? formatDistanceToNow(new Date(transaction.date), { addSuffix: true })
    : 'No date';

  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        {/* Category Icon */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getCategoryColor(transaction.category)}`}
        >
          {getCategoryIcon(transaction.category)}
        </div>

        {/* Transaction Details */}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">{transaction.description}</p>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{transaction.category || 'Uncategorized'}</span>
            <span>•</span>
            <span>{dateDisplay}</span>
          </div>
        </div>
      </div>

      {/* Amount */}
      <div className={`text-right ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
        <p className="font-semibold text-sm">
          {isExpense ? '-' : '+'}
          {formatCurrency(absAmount)}
        </p>
      </div>
    </div>
  );
}

// Skeleton loading state
export function RecentTransactionsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Minimal list version
export function RecentTransactionsMini({ data }: { data: RecentTransaction[] }) {
  const sortedTransactions = [...data]
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  return (
    <div className="space-y-3">
      {sortedTransactions.map((transaction) => (
        <div key={transaction.id} className="flex justify-between items-center">
          <div>
            <p className="font-medium text-sm">{transaction.description}</p>
            <p className="text-xs text-muted-foreground">
              {transaction.date
                ? formatDistanceToNow(new Date(transaction.date), { addSuffix: true })
                : ''}
            </p>
          </div>
          <p
            className={`text-sm font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}
          >
            {transaction.amount < 0 ? '-' : '+'}
            {formatCurrency(Math.abs(transaction.amount))}
          </p>
        </div>
      ))}
    </div>
  );
}
