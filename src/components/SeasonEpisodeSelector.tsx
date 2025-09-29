import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, ChevronLeft } from 'lucide-react';
import { tmdbApi, TVShow } from '@/lib/tmdb';

interface Episode {
  id: number;
  name: string;
  episode_number: number;
  air_date: string;
  overview: string;
  still_path: string | null;
  runtime: number | null;
}

interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date: string;
  poster_path: string | null;
  overview: string;
}

interface SeasonEpisodeSelectorProps {
  show: TVShow;
  server: string;
  onEpisodeSelect: (season: number, episode: number, episodeTitle: string) => void;
  onBack: () => void;
}

export const SeasonEpisodeSelector = ({ show, server, onEpisodeSelect, onBack }: SeasonEpisodeSelectorProps) => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [loadingSeasons, setLoadingSeasons] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  useEffect(() => {
    const loadSeasons = async () => {
      setLoadingSeasons(true);
      try {
        const showDetails = await tmdbApi.getTVShowDetails(show.id);
        setSeasons(showDetails.seasons || []);
        if (showDetails.seasons && showDetails.seasons.length > 0) {
          // Auto-select first season
          const firstSeason = showDetails.seasons.find(s => s.season_number >= 1) || showDetails.seasons[0];
          setSelectedSeason(firstSeason.season_number);
        }
      } catch (error) {
        console.error('Error loading seasons:', error);
      } finally {
        setLoadingSeasons(false);
      }
    };

    loadSeasons();
  }, [show.id]);

  useEffect(() => {
    const loadEpisodes = async () => {
      if (selectedSeason === null) return;
      
      setLoadingEpisodes(true);
      try {
        const seasonDetails = await tmdbApi.getTVSeasonDetails(show.id, selectedSeason);
        setEpisodes(seasonDetails.episodes || []);
        setSelectedEpisode(null); // Reset episode selection
      } catch (error) {
        console.error('Error loading episodes:', error);
        setEpisodes([]);
      } finally {
        setLoadingEpisodes(false);
      }
    };

    loadEpisodes();
  }, [show.id, selectedSeason]);

  const handlePlay = () => {
    if (selectedSeason !== null && selectedEpisode !== null) {
      const episode = episodes.find(ep => ep.episode_number === selectedEpisode);
      const episodeTitle = episode ? episode.name : `Episode ${selectedEpisode}`;
      onEpisodeSelect(selectedSeason, selectedEpisode, episodeTitle);
    }
  };

  const selectedEpisodeData = episodes.find(ep => ep.episode_number === selectedEpisode);

  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <CardTitle className="text-xl">{show.name}</CardTitle>
            <p className="text-sm text-muted-foreground">Server: {server}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {loadingSeasons ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <span className="ml-3 text-muted-foreground">Loading seasons...</span>
          </div>
        ) : (
          <>
            {/* Season Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Select Season:</label>
              <Select
                value={selectedSeason?.toString() || ''}
                onValueChange={(value) => setSelectedSeason(Number(value))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choose a season" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {seasons.map((season) => (
                    <SelectItem key={season.id} value={season.season_number.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{season.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {season.episode_count} episodes
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Episode Selector */}
            {selectedSeason !== null && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Select Episode:</label>
                {loadingEpisodes ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <span className="ml-2 text-sm text-muted-foreground">Loading episodes...</span>
                  </div>
                ) : (
                  <Select
                    value={selectedEpisode?.toString() || ''}
                    onValueChange={(value) => setSelectedEpisode(Number(value))}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Choose an episode" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border max-h-60">
                      {episodes.map((episode) => (
                        <SelectItem key={episode.id} value={episode.episode_number.toString()}>
                          <div className="flex flex-col gap-1 py-1">
                            <span className="font-medium">
                              {episode.episode_number}. {episode.name}
                            </span>
                            {episode.air_date && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(episode.air_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Episode Preview */}
            {selectedEpisodeData && (
              <div className="bg-muted/10 rounded-lg p-4 border border-border/30">
                <div className="flex gap-4">
                  {selectedEpisodeData.still_path && (
                    <img
                      src={tmdbApi.getImageUrl(selectedEpisodeData.still_path, 'w300')}
                      alt={selectedEpisodeData.name}
                      className="w-32 h-18 object-cover rounded-md bg-muted"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <h3 className="font-medium text-foreground">
                      Episode {selectedEpisodeData.episode_number}: {selectedEpisodeData.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {selectedEpisodeData.air_date && (
                        <span>{new Date(selectedEpisodeData.air_date).toLocaleDateString()}</span>
                      )}
                      {selectedEpisodeData.runtime && (
                        <span>{selectedEpisodeData.runtime} min</span>
                      )}
                    </div>
                    {selectedEpisodeData.overview && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {selectedEpisodeData.overview}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Play Button */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handlePlay}
                disabled={selectedSeason === null || selectedEpisode === null}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Watch Episode
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};