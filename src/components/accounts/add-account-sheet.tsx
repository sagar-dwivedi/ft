import { useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet';
import { CreateAccountForm } from './create-account-form';

export function AddAccountSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <Button>Add account</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create new account</SheetTitle>
        </SheetHeader>

        <CreateAccountForm
          onSuccess={() => {
            setOpen(false); // ✅ closes the sheet after success
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
