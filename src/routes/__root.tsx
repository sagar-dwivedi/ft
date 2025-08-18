import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react';
import { ConvexQueryClient } from '@convex-dev/react-query';
import { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouteContext,
} from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getCookie, getWebRequest } from '@tanstack/react-start/server';
import { ConvexReactClient } from 'convex/react';
import { ThemeProvider, useTheme } from '~/components/theme-provider';
import { Toaster } from '~/components/ui/sonner';
import { authClient } from '~/lib/auth-client';
import { fetchSession, getCookieName } from '~/lib/server-auth-utils';
import { getThemeServerFn } from '~/lib/theme';
import appCss from '~/styles/app.css?url';

const fetchAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const sessionCookieName = await getCookieName();
  const token = getCookie(sessionCookieName);
  const request = getWebRequest();
  const { session } = await fetchSession(request);
  return {
    token,
    user: session?.user,
  };
});

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexClient: ConvexReactClient;
  convexQueryClient: ConvexQueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Finance Dashboard',
      },
      {
        name: 'description',
        content: 'A modern finance dashboard built with TanStack and Convex.',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'manifest', href: '/site.webmanifest' },
    ],
  }),
  beforeLoad: async (ctx) => {
    const auth = await fetchAuth();
    const { token, user } = auth;
    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
    }
    return { token, user };
  },
  loader: () => getThemeServerFn(), // runs server-side → theme cookie
  component: RootComponent,
});

function RootComponent() {
  const context = useRouteContext({ from: Route.id });
  const theme = Route.useLoaderData(); // server value

  return (
    <ConvexBetterAuthProvider
      client={context.convexClient}
      authClient={authClient}
    >
      <ThemeProvider theme={theme}>
        <RootDocument>
          <Outlet />
        </RootDocument>
        <Toaster />
      </ThemeProvider>
    </ConvexBetterAuthProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <html lang="en" className={theme} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
