import {
  createFileRoute,
  Outlet,
  redirect,
  useRouterState,
} from '@tanstack/react-router';
import { Search, Bell, Settings } from 'lucide-react';
import { Suspense } from 'react';
import { AppSidebar } from '~/components/app-sidebar';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Separator } from '~/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '~/components/ui/sidebar';
import { Skeleton } from '~/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
import { cn } from '~/lib/utils';

export const Route = createFileRoute('/_dashboard')({
  beforeLoad: async ({ context }) => {
    if (!context.user?.id) throw redirect({ to: '/auth' });
  },
  component: DashboardLayout,
  pendingComponent: DashboardLayoutSkeleton,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-destructive text-2xl font-bold">Error</h1>
        <p className="text-muted-foreground mt-2">
          {error.message || 'Something went wrong'}
        </p>
      </div>
    </div>
  ),
});

// Loading skeleton for the entire dashboard layout
function DashboardLayoutSkeleton() {
  return (
    <div className="flex h-screen">
      <div className="bg-sidebar w-64 border-r">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="flex-1">
        <div className="h-16 border-b p-4">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="p-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

// Hook to generate breadcrumbs based on current route
function useBreadcrumbs() {
  const router = useRouterState();
  const pathname = router.location.pathname;

  const pathSegments = pathname.split('/').filter(Boolean);

  if (pathSegments.length <= 1) {
    return [{ label: 'Dashboard', href: '/dashboard' }];
  }

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);

    return { label, href };
  });

  return breadcrumbs;
}

function DashboardHeader() {
  const breadcrumbs = useBreadcrumbs();

  return (
    <header className="bg-background/80 sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b px-4 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="hover:bg-accent rounded-md p-1.5 transition-colors" />
        <Separator orientation="vertical" className="h-5" />

        {/* Breadcrumb navigation */}
        <nav aria-label="breadcrumb">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage className="font-semibold">
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href={crumb.href}
                        className="hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
      </div>

      {/* Header actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search..."
            className="bg-background h-9 w-64 pl-9 shadow-none"
            aria-label="Search dashboard"
          />
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </Button>

        {/* Settings */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

function DashboardContent() {
  return (
    <main
      className={cn(
        'flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8',
        'animate-in fade-in-0 duration-200'
      )}
      role="main"
      aria-label="Dashboard content"
    >
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </main>
  );
}

function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <SidebarInset className="bg-muted/30 flex flex-1 flex-col">
          <DashboardHeader />
          <DashboardContent />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
