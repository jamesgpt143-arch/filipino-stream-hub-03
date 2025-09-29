import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoModal } from '@/components/VideoModal';
import { MovieCard } from '@/components/MovieCard';
import { DonateButton } from '@/components/DonateButton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Star, Play, ChevronDown } from 'lucide-react';
import { Movie, tmdbApi } from '@/lib/tmdb';

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedServer, setSelectedServer] = useState<string>('');

  useEffect(() => {
    const loadMovieData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const movieData = await tmdbApi.getMovieDetails(Number(id));
        setMovie(movieData);
        
        // Load recommended movies based on this movie
        try {
          const recommendations = await tmdbApi.getMovieRecommendations(Number(id), 1);
          if (recommendations.results.length > 0) {
            setRecommendedMovies(recommendations.results.slice(0, 8));
          } else {
            // Fallback to popular movies if no recommendations
            const popularMovies = await tmdbApi.getPopularMovies(1);
            setRecommendedMovies(popularMovies.results.slice(0, 8));
          }
        } catch (error) {
          // Fallback to popular movies on error
          const popularMovies = await tmdbApi.getPopularMovies(1);
          setRecommendedMovies(popularMovies.results.slice(0, 8));
        }
      } catch (error) {
        console.error('Error loading movie data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMovieData();
  }, [id]);

  const handlePlayMovie = (movie: Movie, server: string) => {
    setSelectedMovie(movie);
    setSelectedServer(server);
  };

  const handleClosePlayer = () => {
    setSelectedMovie(null);
    setSelectedServer('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-8"></div>
            <div className="h-96 bg-muted rounded mb-8"></div>
            <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-full mb-2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Movie not found</h1>
          <Button onClick={() => navigate('/movies')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Movies
          </Button>
        </div>
      </div>
    );
  }

  const servers = tmdbApi.getMovieStreamUrls(movie.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => navigate('/movies')}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Movies
        </Button>

        {/* Movie Header with Backdrop */}
        <div 
          className="relative rounded-lg overflow-hidden mb-8 h-96 bg-cover bg-center"
          style={{ 
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${tmdbApi.getImageUrl(movie.backdrop_path, 'w1280')})` 
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
              <div className="flex items-center justify-center gap-4 mb-6">
                <Badge variant="secondary" className="bg-background/80 text-foreground">
                  <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                  {movie.vote_average.toFixed(1)}
                </Badge>
                <Badge variant="secondary" className="bg-background/80 text-foreground">
                  {new Date(movie.release_date).getFullYear()}
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    Watch Now
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background border-border">
                  {Object.keys(servers).map((server) => (
                    <DropdownMenuItem
                      key={server}
                      onClick={() => handlePlayMovie(movie, server)}
                      className="cursor-pointer hover:bg-muted"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {server}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Synopsis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Synopsis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {movie.overview}
            </p>
          </CardContent>
        </Card>

        {/* Recommended Movies */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Recommended Movies</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {recommendedMovies.map((recommendedMovie) => (
              <MovieCard
                key={recommendedMovie.id}
                movie={recommendedMovie}
                onPlay={handlePlayMovie}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <DonateButton />
        </div>
      </div>

      {/* Video Modal */}
      {selectedMovie && (
        <VideoModal
          isOpen={!!selectedMovie}
          title={selectedMovie.title}
          videoUrl={tmdbApi.getMovieStreamUrls(selectedMovie.id)[selectedServer]}
          onClose={handleClosePlayer}
        />
      )}
    </div>
  );
};

export default MovieDetail;