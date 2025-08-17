import { ConvexQueryClient } from '@convex-dev/react-query'
import { QueryClient } from '@tanstack/react-query'
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { ConvexProvider } from 'convex/react'
import { routeTree } from './routeTree.gen'

export function createRouter() {
  const CONVEX_URL = import.meta.env.VITE_CONVEX_URL
  if (!CONVEX_URL) {
    throw new Error('Missing env variable VITE_CONVEX_URL')
  }

  const convexQueryClient = new ConvexQueryClient(CONVEX_URL)

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
        gcTime: 5_000, // 5 s client-side cache TTL
      },
    },
  })

  /* tell the Convex adapter which QueryClient to talk to */
  convexQueryClient.connect(queryClient)

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient }, // available in every loader
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0, // let React-Query own caching
    defaultErrorComponent: ({ error }) => <pre>{error.stack}</pre>,
    defaultNotFoundComponent: () => <p>Not found</p>,
    /* Router needs a *single* root wrapper. The SSR integration will
       automatically add QueryClientProvider; we only add ConvexProvider. */
    Wrap: ({ children }) => (
      <ConvexProvider client={convexQueryClient.convexClient}>
        {children}
      </ConvexProvider>
    ),
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
