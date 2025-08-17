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
import * as React from 'react';
import { authClient } from '~/lib/auth-client';
import { fetchSession, getCookieName } from '~/lib/server-auth-utils';
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
  component: RootComponent,
});

function RootComponent() {
  const context = useRouteContext({ from: Route.id });

  return (
    <ConvexBetterAuthProvider
      client={context.convexClient}
      authClient={authClient}
    >
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ConvexBetterAuthProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
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
