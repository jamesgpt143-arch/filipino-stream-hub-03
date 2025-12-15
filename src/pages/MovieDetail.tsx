import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Movie, tmdbApi, Video } from '@/lib/tmdb';
import { Button } from '@/components/ui/button';
import { Play, Calendar, Star, Clock, ArrowLeft, ExternalLink, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VideoModal } from '@/components/VideoModal';
import { Badge } from '@/components/ui/badge';
import { UserStats } from '@/components/UserStats';
import { useClickadillaAds } from '@/hooks/useClickadillaAds';

const CUTTLINKS_API_KEY = '67e33ac96fe3e5f792747feb8c184f871726dc01'; 

interface MovieDetails extends Omit<Movie, 'genre_ids'> {
  genres: { id: number; name: string }[];
  runtime?: number;
}

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [currentServer, setCurrentServer] = useState('Server 1'); // Default Server
  const { toast } = useToast();

  useClickadillaAds();

  // AUTO-PLAY DETECTION
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('autoplay') === 'true') {
      setIsVideoOpen(true);
      window.history.replaceState({}, '', location.pathname);
      toast({
        title: "Thanks for supporting!",
        description: "Enjoy watching the movie.",
        duration: 3000,
        className: "bg-green-600 text-white border-none"
      });
    }
  }, [location]);

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!id) return;
      try {
        const [movieData, videoData] = await Promise.all([
          tmdbApi.getMovieDetails(parseInt(id)),
          tmdbApi.getMovieVideos(parseInt(id))
        ]);
        setMovie(movieData as unknown as MovieDetails);
        setVideos(videoData.results);
      } catch (error) {
        console.error("Error loading movie:", error);
        toast({ title: "Error", description: "Could not load movie details", variant: "destructive" });
      }
    };
    fetchMovieData();
  }, [id]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p>Loading Movie Details...</p>
        </div>
      </div>
    );
  }

  const streamUrls = tmdbApi.getMovieStreamUrls(movie.id);

  const handleMonetizedClick = () => {
    const currentPageUrl = window.location.href.split('?')[0];
    const returnUrl = `${currentPageUrl}?autoplay=true`;
    const monetizedUrl = `https://cuty.io/st?api=${CUTTLINKS_API_KEY}&url=${encodeURIComponent(returnUrl)}`;
    window.location.href = monetizedUrl;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative h-[50vh] md:h-[70vh]">
        <div className="absolute inset-0">
          <img
            src={tmdbApi.getImageUrl(movie.backdrop_path, 'original')}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="absolute top-4 left-4 z-50">
           <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => navigate(-1)}>
             <ArrowLeft className="mr-2 h-4 w-4" /> Back
           </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 container mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <img
              src={tmdbApi.getImageUrl(movie.poster_path)}
              alt={movie.title}
              className="w-32 md:w-48 rounded-lg shadow-2xl hidden md:block"
            />

            <div className="flex-1 space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold text-white">{movie.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  {movie.vote_average?.toFixed(1) || 'N/A'}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                </div>
                {movie.runtime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                    </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {movie.genres?.map(genre => (
                   <Badge key={genre.id} variant="outline" className="text-white border-white/20">
                     {genre.name}
                   </Badge>
                ))}
              </div>

              {/* SERVER SELECTOR (Binabalik natin dito) */}
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Select Server:</span>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(streamUrls).map((serverName) => (
                    <Button
                      key={serverName}
                      variant={currentServer === serverName ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentServer(serverName)}
                      className={`h-8 border-white/20 ${currentServer === serverName ? 'bg-primary text-primary-foreground' : 'text-white hover:bg-white/10'}`}
                    >
                      <Server className="w-3 h-3 mr-2" />
                      {serverName}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {/* DIRECT PLAY BUTTON */}
                <Button size="lg" className="gap-2 bg-primary/90 hover:bg-primary" onClick={() => setIsVideoOpen(true)}>
                  <Play className="w-5 h-5" /> Direct Play ({currentServer})
                </Button>

                {/* MONETIZED BUTTON */}
                <Button 
                    size="lg" 
                    variant="secondary" 
                    className="gap-2 bg-yellow-600 hover:bg-yellow-700 text-white border-none shadow-lg shadow-yellow-900/20 animate-pulse"
                    onClick={handleMonetizedClick}
                >
                  <ExternalLink className="w-5 h-5" /> Support & Watch
                </Button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <section>
                <h2 className="text-xl font-semibold mb-3">Overview</h2>
                <p className="text-muted-foreground leading-relaxed">{movie.overview}</p>
            </section>
        </div>
      </div>

      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        title={`${movie.title} - ${currentServer}`}
        videoUrl={streamUrls ? streamUrls[currentServer as keyof typeof streamUrls] : ''}
      />
      <UserStats pagePath={`/movie/${id}`} />
    </div>
  );
};

export default MovieDetail;
