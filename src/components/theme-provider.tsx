import { useRouter } from '@tanstack/react-router';
import { createContext, useContext, type ReactNode } from 'react';
import { setThemeServerFn, type Theme } from '~/lib/theme';

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
} | null>(null);

export function ThemeProvider(props: { theme: Theme; children: ReactNode }) {
  const router = useRouter();
  const setTheme = (t: Theme) => {
    setThemeServerFn({ data: t });
    router.invalidate(); // re-hits loader → fresh html class
  };
  return (
    <ThemeContext.Provider value={{ theme: props.theme, setTheme }}>
      {props.children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme outside ThemeProvider');
  return ctx;
};
