import { Link, useLocation } from "react-router-dom";
import { Home, Film, Tv, Radio, Sparkles } from "lucide-react";

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Movies", path: "/movies", icon: Film },
    { name: "TV Series", path: "/tv-series", icon: Tv },
    { name: "Live TV", path: "/channels", icon: Radio },
    { name: "Anime", path: "/anime", icon: Sparkles },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-lg border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`relative ${active ? "scale-110" : ""} transition-transform`}>
                <Icon className={`w-5 h-5 ${active ? "drop-shadow-glow" : ""}`} />
                {active && (
                  <div className="absolute -inset-2 bg-primary/20 rounded-full blur-md -z-10" />
                )}
              </div>
              <span className={`text-[10px] font-medium ${active ? "text-primary" : ""}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
