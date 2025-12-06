import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Star } from 'lucide-react';
import { TVShow, tmdbApi } from '@/lib/tmdb';
import { useNavigate } from 'react-router-dom';

interface AnimeCardProps {
  anime: TVShow;
  onPlay: (anime: TVShow, server: string) => void;
}

export const AnimeCard = ({ anime, onPlay }: AnimeCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className="group cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg bg-card border-border overflow-hidden">
      <div 
        className="relative aspect-[2/3] overflow-hidden"
        onClick={() => navigate(`/anime/${anime.id}`)}
      >
        <img
          src={tmdbApi.getImageUrl(anime.poster_path)}
          alt={anime.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-background/80 text-foreground">
            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
            {anime.vote_average.toFixed(1)}
          </Badge>
        </div>
        <div className="absolute top-2 left-2">
          <Badge className="bg-accent text-accent-foreground">
            Anime
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
          {anime.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {anime.first_air_date ? new Date(anime.first_air_date).getFullYear() : 'TBA'}
        </p>
      </CardContent>
    </Card>
  );
};