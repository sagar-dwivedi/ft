import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/accounts')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/accounts"!</div>
}
