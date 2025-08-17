import { createServerFn } from '@tanstack/react-start';
import { getCookie, setCookie } from '@tanstack/react-start/server';

const COOKIE_KEY = 'ui-theme'; // or any name
export type Theme = 'light' | 'dark';

export const getThemeServerFn = createServerFn().handler(
  async () => (getCookie(COOKIE_KEY) || 'light') as Theme
);

export const setThemeServerFn = createServerFn({ method: 'POST' })
  .validator((v: unknown) => {
    if (v !== 'light' && v !== 'dark') throw new Error('invalid theme');
    return v as Theme;
  })
  .handler(async ({ data }) => {
    setCookie(COOKIE_KEY, data);
  });
