import { Link } from '@tanstack/react-router';
import { AlertTriangle, Home } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

export function NotFoundComponent() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="mb-2 flex justify-center">
            <AlertTriangle className="text-destructive size-12" />
          </div>
          <CardTitle className="text-center text-2xl">Page Not Found</CardTitle>
          <CardDescription className="text-center">
            We couldn't find the page you're looking for.
          </CardDescription>
        </CardHeader>

        <CardContent className="text-muted-foreground text-center text-sm">
          <p>
            The link might be broken, or the page may have been moved or
            deleted.
          </p>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
