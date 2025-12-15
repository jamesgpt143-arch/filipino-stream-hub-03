import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Info, Play, X } from 'lucide-react'; // Added icons
import { MovieCard } from '@/components/MovieCard';
import { VideoModal } from '@/components/VideoModal';
import { Movie, tmdbApi } from '@/lib/tmdb';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DonateButton } from '@/components/DonateButton';
import { UserStats } from '@/components/UserStats';
import { useClickadillaAds } from '@/hooks/useClickadillaAds';

// GENRE LIST (TMDB Standard IDs)
const GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
];

const Movies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null); // New Genre State
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  useClickadillaAds();

  useEffect(() => {
    // Reset page when genre/search changes
    setCurrentPage(1);
  }, [searchTerm, selectedGenre]);

  useEffect(() => {
    const fetchData = async () => {
        if (searchTerm) {
            await searchMovies();
        } else {
            await loadMovies();
        }
    };
    fetchData();
  }, [currentPage, searchTerm, selectedGenre]); // Re-fetch on genre change

  const loadMovies = async () => {
    try {
      setIsLoading(true);
      // NOTE: You might need to update your tmdbApi to accept 'with_genres' parameter
      // Example: const data = await tmdbApi.getPopularMovies(currentPage, selectedGenre);
      // For now, I'll stick to your existing function:
      const data = await tmdbApi.getPopularMovies(currentPage);
      
      let results = data.results;
      
      // CLIENT-SIDE FILTERING (Temporary solution if API doesn't support filter yet)
      if (selectedGenre) {
        results = results.filter((m: Movie) => m.genre_ids?.includes(selectedGenre));
      }

      setMovies(results);
      setTotalPages(data.total_pages);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load movies.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchMovies = async () => {
    try {
      setIsLoading(true);
      const data = await tmdbApi.searchMovies(searchTerm, currentPage);
      setMovies(data.results);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayMovie = (movie: Movie, server: string) => {
    setSelectedMovie(movie);
    setSelectedServer(server);
    toast({
      title: "Playing Movie",
      description: `Now loading: ${movie.title}`,
    });
  };

  const handleClosePlayer = () => {
    setSelectedMovie(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero shadow-elegant border-b border-primary/20 sticky top-0 z-40 backdrop-blur-md bg-background/80">
        <div className="container mx-auto px-4 py-4 space-y-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground flex items-center gap-2">
                 <Play className="fill-primary text-primary" /> Movies
              </h1>
            </div>
            
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search movies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-secondary/50 border-transparent focus:bg-background focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* GENRE FILTER BAR */}
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
                {GENRES.map((genre) => (
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
        {/* Browser Notice */}
        <Alert className="mb-6 bg-blue-500/10 border-blue-500/20 text-blue-200">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertDescription>
            Tip: Hover over a movie card to quick play! Use Brave Browser for ad-free experience.
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
             {/* RESULTS HEADER */}
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-muted-foreground">
                    {searchTerm ? `Search results for "${searchTerm}"` : selectedGenre ? `${GENRES.find(g => g.id === selectedGenre)?.name} Movies` : "Popular Movies"}
                </h2>
                <span className="text-xs bg-secondary px-2 py-1 rounded-md text-muted-foreground">{movies.length} titles</span>
             </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-6">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onPlay={handlePlayMovie}
                />
              ))}
            </div>

            {/* Empty State */}
            {movies.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    <p className="text-lg">No movies found.</p>
                    <Button variant="link" onClick={() => {setSearchTerm(''); setSelectedGenre(null);}}>Clear Filters</Button>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && movies.length > 0 && (
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

      {/* Video Modal */}
      {selectedMovie && (
        <VideoModal
          isOpen={!!selectedMovie}
          onClose={handleClosePlayer}
          title={selectedMovie.title}
          videoUrl={tmdbApi.getMovieStreamUrls(selectedMovie.id)[selectedServer]}
        />
      )}

      {/* Footer */}
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
      <UserStats pagePath="/movies" />
    </div>
  );
};

export default Movies;
