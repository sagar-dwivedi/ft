import { useRouterState } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function Breadcrumbs() {
  const matches = useRouterState({ select: (s) => s.matches });

  return (
    <div className="flex items-center space-x-2 text-sm">
      <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
        Dashboard
      </Link>

      {matches.slice(1).map((match) => (
        <div key={match.id} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Link
            to={match.pathname}
            className="text-muted-foreground hover:text-foreground capitalize"
          >
            {match.pathname.split('/').pop()?.replace('-', ' ') || 'Home'}
          </Link>
        </div>
      ))}
    </div>
  );
}
