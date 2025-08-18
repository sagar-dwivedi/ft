import { Button } from '~/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet';
import { CreateTransactionForm } from './create-transaction-form';

export function AddTransactionSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Add transaction</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New transaction</SheetTitle>
        </SheetHeader>
        <CreateTransactionForm />
      </SheetContent>
    </Sheet>
  );
}
