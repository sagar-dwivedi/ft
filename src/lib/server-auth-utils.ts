import { reactStartHelpers } from '@convex-dev/better-auth/react-start';
import { createAuth } from './auth';

const getConvexSiteUrl = () => {
  const convexSiteUrl =
    import.meta.env.VITE_CONVEX_SITE_URL || process.env.CONVEX_SITE_URL;
  if (!convexSiteUrl) {
    throw new Error('CONVEX_SITE_URL environment variable is required');
  }
  return convexSiteUrl;
};

const createSafeReactStartHandler = (convexSiteUrl: string) => {
  return async (request: Request) => {
    try {
      const requestUrl = new URL(request.url);
      const nextUrl = `${convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;

      let body: string | undefined;
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        body = await request.text();
      }

      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'accept-encoding') {
          headers[key] = value;
        }
      });

      headers['accept'] = 'application/json';

      const requestInit: RequestInit & { duplex?: 'half' } = {
        method: request.method,
        headers,
        redirect: 'manual',
      };

      if (body !== undefined) {
        requestInit.body = body;
        // Needed for Node.js fetch when sending a body with non-GET
        (requestInit as any).duplex = 'half';
      }

      return fetch(nextUrl, requestInit);
    } catch (error) {
      console.error('Error in reactStartHandler:', error);
      throw new Error('Failed to process authentication request');
    }
  };
};

const convexSiteUrl = getConvexSiteUrl();
const originalHelpers = reactStartHelpers(createAuth, { convexSiteUrl });

export const fetchSession = originalHelpers.fetchSession;
export const getCookieName = originalHelpers.getCookieName;
export const reactStartHandler = createSafeReactStartHandler(convexSiteUrl);
