import { Link, useLocation } from 'react-router-dom';
import logodk from '@/assets/logodk.png';
import { LiveClock } from './LiveClock';
import { CalendarDays, LayoutGrid, FileText, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Jadwal', icon: LayoutGrid },
  { to: '/kalender', label: 'Kalender', icon: CalendarDays },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/parent', label: 'Parent Portal', icon: Users },
];

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
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === to
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              ))}
            </nav>
          </div>
          <LiveClock />
        </div>
      </div>
    </header>
  );
}
