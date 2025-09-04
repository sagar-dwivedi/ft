import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '~/components/theme-provider';
import { Button } from '~/components/ui/button';

const cycleThemes: Record<string, 'light' | 'dark' | 'system'> = {
  system: 'dark',
  dark: 'light',
  light: 'system',
};

export function ThemeToggle() {
  const { userTheme, appTheme, setTheme } = useTheme();

  const handleToggle = () => {
    setTheme(cycleThemes[userTheme]);
  };

  const Icon =
    userTheme === 'system' ? Monitor : appTheme === 'dark' ? Sun : Moon;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={handleToggle}
    >
      <Icon size={16} />
    </Button>
  );
}
