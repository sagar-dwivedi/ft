import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Bell, LogOut, Search, Settings, User } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { AppSidebar } from '~/components/app-sidebar';
import { ThemeToggle } from '~/components/theme-toggle';
import { Button } from '~/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Separator } from '~/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '~/components/ui/sidebar';
import { Skeleton } from '~/components/ui/skeleton';
import { useCurrentRouteTitle } from '~/hooks/use-current-route-title';
import { cn } from '~/lib/utils';

// 🔹 Route definition
export const Route = createFileRoute('/_dashboard')({
  beforeLoad: async ({ context, location }) => {
    if (!context.user?.id) {
      throw redirect({
        to: '/auth',
        search: { next: location.href },
      });
    }
  },
  component: DashboardLayout,
});

// 🔹 Dashboard Header
function DashboardHeader() {
  const title = useCurrentRouteTitle();
  const [commandOpen, setCommandOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Add keyboard shortcut for command palette
  useEffect(() => {
    setIsMounted(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isMounted) {
    return null; // Avoid hydration mismatch for theme
  }

  return (
    <header className="bg-background/80 sticky top-0 z-10 flex h-16 items-center gap-4 border-b px-4 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="hover:bg-accent rounded-md p-1.5 transition-colors" />
        <Separator orientation="vertical" className="h-5" />

        {/* Breadcrumb / Title */}
        <h1 className="text-xl font-semibold truncate max-w-[200px] sm:max-w-none">
          {title}
        </h1>
      </div>

      {/* Header actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* 🔎 Global Search Trigger */}
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex h-9 w-64 justify-start gap-2 text-muted-foreground"
          onClick={() => setCommandOpen(true)}
        >
          <Search className="h-4 w-4" />
          <span>Search...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        {/* 🔔 Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
        </Button>

        {/* 🌓 Theme Toggle */}
        <ThemeToggle />

        {/* 👤 User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 rounded-full"
              aria-label="User menu"
            >
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 🔎 Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem
              value="accounts"
              onSelect={() => {
                // Add navigation logic here
                setCommandOpen(false);
              }}
            >
              Accounts
            </CommandItem>
            <CommandItem
              value="settings"
              onSelect={() => {
                // Add navigation logic here
                setCommandOpen(false);
              }}
            >
              Settings
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}

// 🔹 Dashboard Content
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

// 🔹 Final Layout
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
