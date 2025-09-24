import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { MovieCard } from '@/components/MovieCard';
import { VideoModal } from '@/components/VideoModal';
import { Movie, tmdbApi } from '@/lib/tmdb';
import { useToast } from '@/hooks/use-toast';

const Movies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    loadMovies();
  }, [currentPage]);

  useEffect(() => {
    if (searchTerm) {
      searchMovies();
    } else {
      loadMovies();
    }
  }, [searchTerm]);

  const loadMovies = async () => {
    try {
      setIsLoading(true);
      const data = await tmdbApi.getPopularMovies(currentPage);
      setMovies(data.results);
      setTotalPages(data.total_pages);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load movies. Please try again.",
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
      toast({
        title: "Error",
        description: "Failed to search movies. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayMovie = (movie: Movie, server: string) => {
    setSelectedMovie(movie);
    setSelectedServer(server);
    toast({
      title: "Loading Movie",
      description: `Starting ${movie.title} on ${server}...`,
    });
  };

  const handleClosePlayer = () => {
    setSelectedMovie(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero shadow-elegant border-b border-primary/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground mb-2">Movies</h1>
              <p className="text-primary-foreground/80">Discover popular movies</p>
            </div>
            
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search movies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:bg-background"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted aspect-[2/3] rounded-lg mb-4"></div>
                <div className="bg-muted h-4 rounded mb-2"></div>
                <div className="bg-muted h-3 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onPlay={handlePlayMovie}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
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
    </div>
  );
};

export default Movies;