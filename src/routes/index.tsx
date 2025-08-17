import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Button } from '~/components/ui/button';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Hero */}
      <section className="max-w-xl space-y-4 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          <span className="block">Track every</span>
          <span className="text-primary block">ruppes.</span>
        </h1>

        <p className="text-muted-foreground text-lg">
          A lightweight, personal finance dashboard—built for speed and clarity.
        </p>

        <div className="pt-4">
          <Button asChild size="lg" className="rounded-full">
            <Link to="/auth">
              Get started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Subtle footer */}
      <footer className="text-muted-foreground absolute bottom-6 text-xs">
        © {new Date().getFullYear()} Finance Tracker
      </footer>
    </main>
  );
}
