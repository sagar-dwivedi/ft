import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

export function ErrorFallbackComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="mb-2 flex justify-center">
            <AlertTriangle className="text-destructive h-12 w-12" />
          </div>
          <CardTitle className="text-center text-2xl">
            Oops! Something went wrong
          </CardTitle>
          <CardDescription className="text-center">
            {error.message || 'An unexpected error occurred.'}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button onClick={reset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
