import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from './theme-provider';
import { Button } from './ui/button';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      className="relative overflow-hidden transition-all duration-200 hover:shadow-md"
    >
      {/* Sun Icon */}
      <SunIcon
        className={`h-4 w-4 absolute transition-all duration-300 ${
          theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
        }`}
      />

      {/* Moon Icon */}
      <MoonIcon
        className={`h-4 w-4 absolute transition-all duration-300 ${
          theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        }`}
      />

      {/* Screen reader only text */}
      <span className="sr-only">
        {theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      </span>
    </Button>
  );
}
