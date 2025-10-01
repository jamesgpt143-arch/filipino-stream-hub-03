import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Star } from 'lucide-react';
import { Movie, tmdbApi } from '@/lib/tmdb';
import { useNavigate } from 'react-router-dom';

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie, server: string) => void;
}

export const MovieCard = ({ movie, onPlay }: MovieCardProps) => {
  const servers = tmdbApi.getMovieStreamUrls(movie.id);
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };
  
  return (
    <Card 
      className="group cursor-pointer hover:scale-105 focus-within:scale-105 transition-all duration-300 hover:shadow-glow focus-within:shadow-glow bg-card border-border overflow-hidden"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={tmdbApi.getImageUrl(movie.poster_path)}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 group-focus-within:scale-110 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-background/80 text-foreground">
            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
            {movie.vote_average.toFixed(1)}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4 lg:p-5">
        <h3 className="font-semibold text-foreground lg:text-lg line-clamp-2 mb-2">
          {movie.title}
        </h3>
        <p className="text-sm lg:text-base text-muted-foreground">
          {new Date(movie.release_date).getFullYear()}
        </p>
      </CardContent>
    </Card>
  );
};