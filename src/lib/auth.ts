import { convexAdapter } from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { betterAuth } from 'better-auth';
import type { GenericCtx } from 'convex/_generated/server';
import { betterAuthComponent } from 'convex/auth';

const siteUrl = import.meta.env.VITE_CONVEX_SITE_URL ?? 'http://localhost:3000';

export const createAuth = (ctx: GenericCtx) =>
  betterAuth({
    baseURL: siteUrl,
    database: convexAdapter(ctx, betterAuthComponent),

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [convex()],
  });
