import { setThemeServerFn } from '@/lib/theme';
import { useRouter } from '@tanstack/react-router';
import { createContext, use } from 'react';

const Ctx = createContext<{
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
} | null>(null);

export function ThemeProvider({
  theme,
  children,
}: {
  theme: 'light' | 'dark';
  children: React.ReactNode;
}) {
  const router = useRouter();
  const setTheme = (val: 'light' | 'dark') =>
    setThemeServerFn({ data: val }).then(() => router.invalidate());

  return <Ctx value={{ theme, setTheme }}>{children}</Ctx>;
}

export const useTheme = () => use(Ctx)!;
