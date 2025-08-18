import { Link, useRouteContext } from '@tanstack/react-router';
import { BarChart3, Home, User2, Wallet } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar';

type SidebarItem = {
  title: string;
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export const items: SidebarItem[] = [
  { title: 'Dashboard', to: '/dashboard', icon: Home },
  { title: 'Accounts', to: '/accounts', icon: Wallet },
  { title: 'Reports', to: '/reports', icon: BarChart3 },
  { title: 'Transactions', to: '/transactions', icon: BarChart3 },
];

export function AppSidebar() {
  const { user } = useRouteContext({ from: '/_dashboard' });

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Wallet className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Finance App</span>
                <span className="truncate text-xs">Personal Finance</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <NavItem key={item.title} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <User2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user?.name || 'User'}
                </span>
                <span className="truncate text-xs">
                  {user?.email || 'user@example.com'}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function NavItem({ to, icon: Icon, title }: SidebarItem) {
  return (
    <SidebarMenuItem>
      <Link
        to={to}
        className="w-full"
        activeOptions={{ exact: to === '/dashboard' }}
      >
        {({ isActive }) => (
          <SidebarMenuButton
            tooltip={title}
            isActive={isActive}
            className="w-full"
          >
            <Icon className="size-4" />
            <span>{title}</span>
          </SidebarMenuButton>
        )}
      </Link>
    </SidebarMenuItem>
  );
}
