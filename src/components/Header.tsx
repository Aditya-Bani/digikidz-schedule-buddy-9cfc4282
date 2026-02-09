import logodk from '@/assets/logodk.png';
import { LiveClock } from './LiveClock';

export function Header() {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logodk} alt="DIGIKIDZ Logo" className="h-14 w-auto" />
            <div>
              <p className="text-sm text-muted-foreground">Kota Wisata Cibubur</p>
            </div>
          </div>
          <LiveClock />
        </div>
      </div>
    </header>
  );
}
