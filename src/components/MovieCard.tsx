import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Star, PlayCircle } from 'lucide-react'; // Added PlayCircle
import { Movie, tmdbApi } from '@/lib/tmdb';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button'; // Added Button

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie, server: string) => void;
}

export const MovieCard = ({ movie, onPlay }: MovieCardProps) => {
  const servers = tmdbApi.getMovieStreamUrls(movie.id);
  const navigate = useNavigate();

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Pigilan ang pag-navigate sa details page
    // Default server selection (e.g., VidSrc)
    onPlay(movie, 'VidSrc'); 
  };
  
  return (
    <Card 
      className="group cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl bg-card border-border overflow-hidden relative"
      onClick={() => navigate(`/movie/${movie.id}`)}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={tmdbApi.getImageUrl(movie.poster_path)}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Rating Badge */}
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm border-none">
            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
            {movie.vote_average.toFixed(1)}
          </Badge>
        </div>

        {/* HOVER OVERLAY - Darken image & Show Play Button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button 
                variant="default" 
                size="icon" 
                className="rounded-full w-12 h-12 bg-primary text-primary-foreground hover:scale-110 transition-transform"
                onClick={handlePlayClick}
            >
                <PlayCircle className="w-8 h-8" />
            </Button>
        </div>
      </div>

      <CardContent className="p-3">
        <h3 className="font-semibold text-foreground line-clamp-1 text-sm mb-1" title={movie.title}>
          {movie.title}
        </h3>
        <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{new Date(movie.release_date).getFullYear() || 'N/A'}</span>
            <span className="uppercase border border-white/10 px-1 rounded text-[10px]">HD</span>
        </div>
      </CardContent>
    </Card>
  );
};
