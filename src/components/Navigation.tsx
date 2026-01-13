import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Tv, Film, Home, Plus, Sparkles } from 'lucide-react';
import { Clock } from './Clock';

export const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/channels', label: 'IPTV', icon: Tv },
    { path: '/custom-channels', label: 'Custom', icon: Plus },
    { path: '/movies', label: 'Movies', icon: Film },
    { path: '/tv-series', label: 'Series', icon: Tv },
    { path: '/anime', label: 'Anime', icon: Sparkles },
  ];

  return (
    <>
      {/* Top Navigation - Desktop */}
      <nav className="bg-gradient-hero shadow-elegant border-b border-primary/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-accent p-2 rounded-lg shadow-glow">
                <Tv className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-foreground">
                  flameiptv
                </h1>
                <Clock />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Button
                    key={item.path}
                    asChild
                    variant={isActive ? "default" : "ghost"}
                    className={`${
                      isActive 
                        ? 'bg-accent text-accent-foreground shadow-glow' 
                        : 'text-primary-foreground hover:bg-primary-foreground/10'
                    }`}
                  >
                    <Link to={item.path} className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-hero border-t border-primary/20 z-50 safe-area-bottom">
        <div className="flex justify-around items-center py-2 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-accent' 
                    : 'text-primary-foreground/70 hover:text-primary-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : ''}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer for bottom nav on mobile */}
      <div className="md:hidden h-16" />
    </>
  );
};
