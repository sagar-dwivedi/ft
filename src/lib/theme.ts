import { createServerFn } from '@tanstack/react-start';
import { getCookie, setCookie } from '@tanstack/react-start/server';

const storageKey = 'ui-theme';

export const getThemeServerFn = createServerFn().handler(async () => {
  return (getCookie(storageKey) || 'light') as 'light' | 'dark';
});

export const setThemeServerFn = createServerFn({ method: 'POST' })
  .validator((d) => {
    if (d !== 'light' && d !== 'dark') throw new Error('Bad theme');
    return d as 'light' | 'dark';
  })
  .handler(async ({ data }) => setCookie(storageKey, data));
