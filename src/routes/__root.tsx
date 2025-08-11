/// <reference types="vite/client" />
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import { ThemeProvider, useTheme } from '@/components/theme-provider';
import { getThemeServerFn } from '@/lib/theme';
import appCss from '../styles/app.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  loader: () => getThemeServerFn(),
  component: RootComponent,
});

function RootComponent() {
  const theme = Route.useLoaderData();

  return (
    <ThemeProvider theme={theme}>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ThemeProvider>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { theme } = useTheme();

  return (
    <html className={theme} suppressHydrationWarning>
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
