import { useRouterState } from '@tanstack/react-router';
import { items } from '~/components/app-sidebar';

export function useCurrentRouteTitle() {
  const router = useRouterState();
  const pathname = router.location.pathname;

  // Try to match an item by its `to`
  const match = items.find((item) => item.to === pathname);

  // Fallback: prettify the last path segment
  if (!match) {
    const segment = pathname.split('/').filter(Boolean).pop() || 'Dashboard';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }

  return match.title;
}
