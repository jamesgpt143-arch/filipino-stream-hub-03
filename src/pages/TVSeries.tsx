import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Tv, Info } from 'lucide-react';
import { TVShowCard } from '@/components/TVShowCard';
import { TVShow, tmdbApi } from '@/lib/tmdb';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DonateButton } from '@/components/DonateButton';
import { UserStats } from '@/components/UserStats';
import { useClickadillaAds } from '@/hooks/useClickadillaAds';

// TV SPECIFIC GENRES (Iba ito sa Movies)
const TV_GENRES = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 9648, name: "Mystery" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10762, name: "Kids" },
  { id: 10768, name: "War & Politics" },
  { id: 37, name: "Western" },
  { id: 10764, name: "Reality" },
  { id: 10766, name: "Soap" },
  { id: 10767, name: "Talk" },
  { id: 99, name: "Documentary" },
];

const TVSeries = () => {
  const [shows, setShows] = useState<TVShow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  useClickadillaAds();

  // Reset page pag nagbago filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGenre]);

  useEffect(() => {
    const fetchData = async () => {
      if (searchTerm) {
        await searchTVShows();
      } else {
        await loadTVShows();
      }
    };
    fetchData();
  }, [currentPage, searchTerm, selectedGenre]);

  const loadTVShows = async () => {
    try {
      setIsLoading(true);
      // Pass selectedGenre for Server-Side Filtering
      const data = await tmdbApi.getPopularTVShows(currentPage, selectedGenre);
      setShows(data.results);
      setTotalPages(data.total_pages);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load TV series.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchTVShows = async () => {
    try {
      setIsLoading(true);
      const data = await tmdbApi.searchTVShows(searchTerm, currentPage);
      setShows(data.results);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero shadow-elegant border-b border-primary/20 sticky top-0 z-40 backdrop-blur-md bg-background/80">
        <div className="container mx-auto px-4 py-4 space-y-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground flex items-center gap-2">
                <Tv className="fill-primary text-primary" /> TV Series
              </h1>
            </div>
            
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search TV series..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-secondary/50 border-transparent focus:bg-background focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* TV GENRE FILTER BAR */}
          {!searchTerm && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade-sides">
                <Button
                    variant={selectedGenre === null ? "default" : "outline"}
                    size="sm"
                    className="rounded-full whitespace-nowrap"
                    onClick={() => setSelectedGenre(null)}
                >
                    All
                </Button>
                {TV_GENRES.map((genre) => (
                    <Button
                        key={genre.id}
                        variant={selectedGenre === genre.id ? "default" : "outline"}
                        size="sm"
                        className={`rounded-full whitespace-nowrap ${selectedGenre === genre.id ? "bg-primary text-white" : "hover:text-primary hover:border-primary"}`}
                        onClick={() => setSelectedGenre(genre.id)}
                    >
                        {genre.name}
                    </Button>
                ))}
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Alert className="mb-6 bg-blue-500/10 border-blue-500/20 text-blue-200">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertDescription>
             Discover the latest and most popular TV Series. Use Brave Browser for the best experience.
          </AlertDescription>
        </Alert>

        {isLoading ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="animate-pulse space-y-2">
                <div className="bg-muted aspect-[2/3] rounded-xl"></div>
                <div className="bg-muted h-3 rounded w-3/4"></div>
                <div className="bg-muted h-2 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-muted-foreground">
                    {searchTerm ? `Search results for "${searchTerm}"` : selectedGenre ? `${TV_GENRES.find(g => g.id === selectedGenre)?.name} Series` : "Popular TV Series"}
                </h2>
             </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-6">
              {shows.map((show) => (
                <TVShowCard
                  key={show.id}
                  show={show}
                />
              ))}
            </div>

            {/* Empty State */}
            {shows.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    <p className="text-lg">No TV shows found.</p>
                    <Button variant="link" onClick={() => {setSearchTerm(''); setSelectedGenre(null);}}>Clear Filters</Button>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && shows.length > 0 && (
              <div className="flex justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm font-medium bg-secondary rounded-md">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-border mt-12 py-8 bg-card/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground font-medium">
            flameiptv • 2024
          </p>
          <div className="mt-4 scale-90 origin-top">
            <DonateButton />
          </div>
        </div>
      </footer>
      <UserStats pagePath="/tv-series" />
    </div>
  );
};

export default TVSeries;
