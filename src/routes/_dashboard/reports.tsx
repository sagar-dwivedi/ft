import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/reports')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_dashboard/reports"!</div>;
}
