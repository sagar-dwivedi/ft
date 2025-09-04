import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { ThemeToggle } from '~/components/theme-toggle';
import { Button } from '~/components/ui/button';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function Header() {
  return (
    <header className="fixed top-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center justify-between gap-8 rounded-full border px-6 py-3 shadow-sm backdrop-blur-sm">
        <Link to="/" className="text-sm font-medium">
          Finance Tracker
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}

function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <Header />

      <div className="w-full max-w-2xl space-y-12 text-center">
        <section className="space-y-6">
          <h1 className="text-5xl font-light tracking-tight sm:text-6xl">
            Track every
            <span className="block font-medium">rupee.</span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400">
            A simple, personal finance dashboard built for clarity.
          </p>
        </section>

        <div className="pt-4">
          <Button
            render={
              <Link to="/auth" search={{ mode: 'login' }}>
                Get started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            }
            size="lg"
            variant={'secondary'}
          />
        </div>
      </div>

      <footer className="absolute bottom-8 text-xs text-gray-500 dark:text-gray-500">
        © {new Date().getFullYear()} Finance Tracker
      </footer>
    </main>
  );
}
