import { DashboardView } from '@/components/dashboard/dashboard-view';
import { dashboardQueryOptions } from '@/lib/api/dashboard';
import { authClient } from '@/lib/auth-client';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboardLayout/dashboard')({
  beforeLoad: async () => {
    const { data } = await authClient.getSession();

    if (!data?.session) {
      throw redirect({ to: '/auth/login' });
    }
  },
  loader: async ({ context }) => {
    const data = await context.queryClient.ensureQueryData(dashboardQueryOptions());
    return { data };
  },
  component: DashboardView,
});
