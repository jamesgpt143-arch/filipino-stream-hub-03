import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Tv, Film, MonitorPlay, MessageCircle, LogOut, Clock, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Navigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const { toast } = useToast();

  const links = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/channels', label: 'Live TV', icon: Tv },
    { href: '/custom-channels', label: 'Custom', icon: MonitorPlay },
    { href: '/movies', label: 'Movies', icon: Film },
    { href: '/tv-series', label: 'Series', icon: MonitorPlay },
    { href: '/anime', label: 'Anime', icon: MonitorPlay },
  ];

  // LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem('flame_session_expiry');
    window.location.reload(); // Reload para bumalik sa Login Page
  };

  // TIMER LOGIC
  useEffect(() => {
    const updateTimer = () => {
      const expiry = localStorage.getItem('flame_session_expiry');
      
      if (!expiry) return;

      const now = Date.now();
      const distance = parseInt(expiry) - now;

      // Kapag ubos na ang oras
      if (distance < 0) {
        handleLogout();
        return;
      }

      // Convert to HH:MM:SS
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Format with leading zeros
      const h = hours < 10 ? `0${hours}` : hours;
      const m = minutes < 10 ? `0${minutes}` : minutes;
      const s = seconds < 10 ? `0${seconds}` : seconds;

      setTimeLeft(`${h}:${m}:${s}`);
    };

    // Run immediately and then every second
    updateTimer();
    const timerId = setInterval(updateTimer, 1000);

    return () => clearInterval(timerId);
  }, []);

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4">
        
        {/* Logo Section */}
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <span>🔥 FlameIPTV</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Side: Timer & Logout */}
        <div className="flex items-center gap-3">
            {/* TIMER DISPLAY */}
            {timeLeft && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-full border border-primary/20">
                    <Clock className="w-3 h-3 text-primary animate-pulse" />
                    <span className="text-xs font-mono font-bold text-primary">{timeLeft}</span>
                </div>
            )}

            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-5 w-5 text-red-500" />
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <div className="flex flex-col gap-4 mt-6">
                    {timeLeft && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg mb-4">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="font-mono font-bold">{timeLeft} left</span>
                        </div>
                    )}
                    
                    {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.href;
                    return (
                        <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-2 text-sm font-medium p-2 rounded-md transition-colors ${
                            isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary'
                        }`}
                        >
                        <Icon className="h-4 w-4" />
                        {link.label}
                        </Link>
                    );
                    })}
                </div>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </nav>
  );
};
