import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Clock, Trash2 } from 'lucide-react';
import { tmdbApi } from '@/lib/tmdb';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface WatchHistoryItem {
  id: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath: string;
  lastWatchedAt: number;
  season?: string;
  episode?: number;
  episodeName?: string;
  link: string;
}

export const ContinueWatching = () => {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
    window.addEventListener('storage', loadHistory);
    return () => window.removeEventListener('storage', loadHistory);
  }, []);

  const loadHistory = () => {
    const stored = localStorage.getItem('flame_watch_history');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHistory(parsed.sort((a: any, b: any) => b.lastWatchedAt - a.lastWatchedAt));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  };

  const removeFromHistory = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem('flame_watch_history', JSON.stringify(newHistory));
  };

  if (history.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-2 mb-4">
         <Clock className="w-5 h-5 text-accent" />
         <h2 className="text-2xl font-bold text-primary-foreground">Continue Watching</h2>
      </div>

      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex w-max space-x-4 pb-4">
          {history.map((item) => (
            <Link key={item.id} to={item.link} className="group relative">
              <Card className="w-[200px] md:w-[250px] overflow-hidden bg-card/50 border-primary/10 hover:border-accent transition-colors">
                <div className="relative aspect-video">
                  <img
                    src={tmdbApi.getImageUrl(item.posterPath, 'w500')}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-10 h-10 text-white fill-white" />
                  </div>
                  
                  <button 
                    onClick={(e) => removeFromHistory(e, item.id)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white/70 hover:text-red-500 hover:bg-black transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                    <div className="h-full bg-accent w-2/3"></div>
                  </div>
                </div>
                
                <CardContent className="p-3">
                  <h3 className="font-semibold text-foreground truncate text-sm md:text-base">{item.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.type === 'tv' 
                        ? `S${item.season} E${item.episode} • Resume` 
                        : 'Resume Movie'}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
};
