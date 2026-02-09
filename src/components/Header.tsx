import { Link, useLocation } from 'react-router-dom';
import logodk from '@/assets/logodk.png';
import { LiveClock } from './LiveClock';
import { CalendarDays, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <img src={logodk} alt="DIGIKIDZ Logo" className="h-14 w-auto" />
              <div className="hidden sm:block">
                <p className="text-sm text-muted-foreground">Kota Wisata Cibubur</p>
              </div>
            </Link>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <nav className="flex items-center gap-1">
              <Link
                to="/"
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === '/'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Jadwal</span>
              </Link>
              <Link
                to="/kalender"
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === '/kalender'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <CalendarDays className="w-4 h-4" />
                <span className="hidden sm:inline">Kalender</span>
              </Link>
            </nav>
          </div>
          <LiveClock />
        </div>
      </div>
    </header>
  );
}
