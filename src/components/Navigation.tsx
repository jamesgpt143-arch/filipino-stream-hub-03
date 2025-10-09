import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Tv, Film, Menu, X, Home, Plus, User, Shield, LogOut, Sparkles } from 'lucide-react';
import { Clock } from './Clock';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { username, isAdmin, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/channels', label: 'IPTV Channels', icon: Tv },
    { path: '/custom-channels', label: 'Custom Channels', icon: Plus },
    { path: '/movies', label: 'Movies', icon: Film },
    { path: '/tv-series', label: 'TV Series', icon: Tv },
    { path: '/ai-image-generator', label: 'AI Images', icon: Sparkles },
    { path: '/comments', label: 'Comments', icon: User },
  ];

  return (
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
            
            {/* User Info */}
            <div className="flex items-center gap-2 ml-4 px-3 py-2 bg-primary-foreground/10 rounded-lg">
              {isAdmin ? (
                <Shield className="w-4 h-4 text-accent" />
              ) : (
                <User className="w-4 h-4 text-primary-foreground/80" />
              )}
              <span className="text-sm font-medium text-primary-foreground">
                {username} {isAdmin && '(Admin)'}
              </span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-primary-foreground hover:bg-primary-foreground/10"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive 
                      ? 'bg-accent text-accent-foreground shadow-glow' 
                      : 'text-primary-foreground hover:bg-primary-foreground/10'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Link to={item.path} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
            
            {/* Mobile User Info */}
            <div className="flex items-center justify-between pt-2 border-t border-primary-foreground/20">
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <Shield className="w-4 h-4 text-accent" />
                ) : (
                  <User className="w-4 h-4 text-primary-foreground/80" />
                )}
                <span className="text-sm font-medium text-primary-foreground">
                  {username} {isAdmin && '(Admin)'}
                </span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};