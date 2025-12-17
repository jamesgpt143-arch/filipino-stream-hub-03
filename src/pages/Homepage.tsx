import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tv, Film, Play, Star } from 'lucide-react';
import { DonateButton } from '@/components/DonateButton';
import { UserStats } from '@/components/UserStats';
import { PageViews } from '@/components/PageViews';
import { ContinueWatching } from '@/components/ContinueWatching'; // Import

const Homepage = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      
      {/* ADDED: Continue Watching Section */}
      <div className="pt-4">
        <ContinueWatching />
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground leading-tight">
              flame<span className="text-accent">iptv</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-3xl mx-auto">
              Your ultimate destination for premium IPTV channels, movies, and TV series
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-accent text-accent-foreground shadow-glow hover:shadow-glow-intense">
              <Link to="/channels" className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Watch Live TV
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/movies" className="flex items-center gap-2">
                <Film className="w-5 h-5" />
                Browse Movies
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Quick Access
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Button asChild className="h-24 bg-gradient-primary hover:shadow-glow">
            <Link to="/channels" className="flex flex-col items-center gap-2">
              <Tv className="w-8 h-8" />
              <span className="font-medium">IPTV Channels</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-24 border-primary/20 hover:bg-primary/10">
            <Link to="/movies" className="flex flex-col items-center gap-2 text-primary-foreground">
              <Film className="w-8 h-8" />
              <span className="font-medium">Movies</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-24 border-primary/20 hover:bg-primary/10">
            <Link to="/tv-series" className="flex flex-col items-center gap-2 text-primary-foreground">
              <Tv className="w-8 h-8" />
              <span className="font-medium">TV Series</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/20 mt-12 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-primary-foreground/60">
            flameiptv - Premium Streaming Experience
          </p>
          <div className="mt-3">
            <DonateButton />
          </div>
        </div>
      </footer>
      <UserStats pagePath="/" />
    </div>
  );
};

export default Homepage;
