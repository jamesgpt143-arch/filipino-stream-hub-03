import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Star, Download } from 'lucide-react';
import { Movie, tmdbApi } from '@/lib/tmdb';
import { useNavigate } from 'react-router-dom';

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie, server: string) => void;
}

export const MovieCard = ({ movie, onPlay }: MovieCardProps) => {
  const servers = tmdbApi.getMovieStreamUrls(movie.id);
  const navigate = useNavigate();
  
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const searchQuery = encodeURIComponent(`${movie.title} ${new Date(movie.release_date).getFullYear()}`);
    window.open(`https://1337x.to/search/${searchQuery}/1/`, '_blank');
  };
  
  return (
    <Card className="group cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg bg-card border-border overflow-hidden">
      <div 
        className="relative aspect-[2/3] overflow-hidden"
        onClick={() => navigate(`/movie/${movie.id}`)}
      >
        <img
          src={tmdbApi.getImageUrl(movie.poster_path)}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-background/80 text-foreground">
            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
            {movie.vote_average.toFixed(1)}
          </Badge>
        </div>
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
          onClick={handleDownload}
          title="Download from 1337x"
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
          {movie.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {new Date(movie.release_date).getFullYear()}
        </p>
      </CardContent>
    </Card>
  );
};