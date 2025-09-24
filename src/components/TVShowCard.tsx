import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Star, Play, ChevronDown } from 'lucide-react';
import { TVShow, tmdbApi } from '@/lib/tmdb';

interface TVShowCardProps {
  show: TVShow;
  onPlay: (show: TVShow, server: string) => void;
}

export const TVShowCard = ({ show, onPlay }: TVShowCardProps) => {
  const servers = tmdbApi.getTVEpisodeStreamUrls(show.id, 1, 1); // Sample for server list
  
  return (
    <Card className="group cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg bg-card border-border overflow-hidden">
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={tmdbApi.getImageUrl(show.poster_path)}
          alt={show.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="opacity-0 group-hover:opacity-100 bg-primary text-primary-foreground transform scale-75 group-hover:scale-100 transition-all duration-300 hover:bg-primary/90"
                size="sm"
              >
                <Play className="w-4 h-4 mr-1 fill-current" />
                Play
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background border-border">
              {Object.keys(servers).map((server) => (
                <DropdownMenuItem
                  key={server}
                  onClick={() => onPlay(show, server)}
                  className="cursor-pointer hover:bg-muted"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {server}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-background/80 text-foreground">
            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
            {show.vote_average.toFixed(1)}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
          {show.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-2">
          {new Date(show.first_air_date).getFullYear()}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {show.overview}
        </p>
      </CardContent>
    </Card>
  );
};