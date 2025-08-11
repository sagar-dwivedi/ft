import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, BarChart3, PieChart, TrendingUp, Wallet } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div>
      {/* Navigation */}
      <nav className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="flex items-center space-x-2 transition-all duration-200 hover:opacity-80"
            aria-label="Finance Home"
          >
            <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
              <Wallet size={18} />
            </div>
            <span className="text-lg font-semibold text-foreground">Finance</span>
          </Link>

          <div className="flex items-center gap-3">
            <Button asChild size="sm" variant="outline">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-5xl font-light tracking-tight text-foreground sm:text-6xl">
          Simple
          <span className="mt-2 block font-medium">Financial Tracking</span>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-xl text-muted-foreground">
          Clean, focused tools to understand your money better.
        </p>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group border-none shadow-none transition-all duration-200 hover:shadow-md hover:-translate-y-1"
                role="article"
                aria-labelledby={`feature-${feature.title.toLowerCase()}`}
              >
                <CardHeader className="items-center text-center flex flex-col">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    {feature.icon}
                  </div>
                  <CardTitle
                    id={`feature-${feature.title.toLowerCase()}`}
                    className="text-lg font-medium"
                  >
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="font-light">{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-2xl font-light">Built for personal clarity</h2>
          <div className="mt-10 grid grid-cols-3 gap-x-6 gap-y-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="transition-opacity hover:opacity-80">
                <p className="text-3xl font-light text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h3 className="text-3xl font-light">Start today</h3>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Take control with tools designed for clarity.
          </p>
          <Button asChild size="lg" className="mt-8 group">
            <Link to="/dashboard">
              Open Dashboard
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="grid size-6 place-items-center rounded bg-primary text-primary-foreground">
                <Wallet size={14} />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Finance</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Finance. Built for financial clarity.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature data
const features = [
  {
    icon: <Wallet size={20} />,
    title: 'Track',
    desc: 'Record expenses and income with quick, simple entry.',
  },
  {
    icon: <PieChart size={20} />,
    title: 'Budget',
    desc: 'Set spending limits and monitor your progress.',
  },
  {
    icon: <BarChart3 size={20} />,
    title: 'Analyze',
    desc: 'View clear charts of your spending patterns.',
  },
  {
    icon: <TrendingUp size={20} />,
    title: 'Grow',
    desc: 'Monitor trends and optimize your finances.',
  },
];

// Statistics data
const stats = [
  { value: 'Fast', label: 'Quick entry' },
  { value: 'Clean', label: 'No clutter' },
  { value: 'Private', label: 'Your data' },
];
