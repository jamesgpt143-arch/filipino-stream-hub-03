import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search } from 'lucide-react';
import { TVShowCard } from '@/components/TVShowCard';
import { VideoModal } from '@/components/VideoModal';
import { Clock } from '@/components/Clock';
import { TVShow, Season, Episode, tmdbApi } from '@/lib/tmdb';
import { useToast } from '@/hooks/use-toast';

const TVSeries = () => {
  const [shows, setShows] = useState<TVShow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShow, setSelectedShow] = useState<TVShow | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [showEpisodeModal, setShowEpisodeModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    loadTVShows();
  }, [currentPage]);

  useEffect(() => {
    if (searchTerm) {
      searchTVShows();
    } else {
      loadTVShows();
    }
  }, [searchTerm]);

  const loadTVShows = async () => {
    try {
      setIsLoading(true);
      const data = await tmdbApi.getPopularTVShows(currentPage);
      setShows(data.results);
      setTotalPages(data.total_pages);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load TV shows. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchTVShows = async () => {
    try {
      setIsLoading(true);
      const data = await tmdbApi.searchTVShows(searchTerm, currentPage);
      setShows(data.results);
      setTotalPages(data.total_pages);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search TV shows. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayShow = async (show: TVShow, server: string) => {
    try {
      setSelectedShow(show);
      setSelectedServer(server);
      const data = await tmdbApi.getTVShowSeasons(show.id);
      setSeasons(data.seasons.filter(season => season.season_number > 0));
      setShowSeasonModal(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load seasons. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSelectSeason = async (season: Season) => {
    try {
      setSelectedSeason(season);
      setShowSeasonModal(false);
      const data = await tmdbApi.getSeasonEpisodes(selectedShow!.id, season.season_number);
      setEpisodes(data.episodes);
      setShowEpisodeModal(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load episodes. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSelectEpisode = (episode: Episode) => {
    setSelectedEpisode(episode);
    setShowEpisodeModal(false);
    toast({
      title: "Loading Episode",
      description: `Starting ${selectedShow?.name} S${selectedSeason?.season_number}E${episode.episode_number}...`,
    });
  };

  const handleClosePlayer = () => {
    setSelectedEpisode(null);
    setSelectedSeason(null);
    setSelectedShow(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero shadow-elegant border-b border-primary/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground mb-2">TV Series</h1>
              <p className="text-primary-foreground/80">Discover popular TV shows</p>
              <Clock />
            </div>
            
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search TV shows..."
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
              {shows.map((show) => (
                <TVShowCard
                  key={show.id}
                  show={show}
                  onPlay={handlePlayShow}
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

      {/* Season Selection Modal */}
      <Dialog open={showSeasonModal} onOpenChange={setShowSeasonModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select Season - {selectedShow?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {seasons.map((season) => (
              <Button
                key={season.id}
                variant="outline"
                onClick={() => handleSelectSeason(season)}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <img
                  src={tmdbApi.getImageUrl(season.poster_path, 'w300')}
                  alt={season.name}
                  className="w-full aspect-[2/3] object-cover rounded"
                />
                <div className="text-center">
                  <div className="font-semibold">{season.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {season.episode_count} episodes
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Episode Selection Modal */}
      <Dialog open={showEpisodeModal} onOpenChange={setShowEpisodeModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Select Episode - {selectedShow?.name} {selectedSeason?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 max-h-96 overflow-y-auto">
            {episodes.map((episode) => (
              <Button
                key={episode.id}
                variant="outline"
                onClick={() => handleSelectEpisode(episode)}
                className="h-auto p-4 flex items-start gap-4 text-left"
              >
                <img
                  src={tmdbApi.getImageUrl(episode.still_path, 'w300')}
                  alt={episode.name}
                  className="w-32 aspect-video object-cover rounded flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="font-semibold mb-1">
                    {episode.episode_number}. {episode.name}
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-3">
                    {episode.overview}
                  </div>
                  {episode.air_date && (
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(episode.air_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      {selectedEpisode && selectedShow && selectedSeason && (
        <VideoModal
          isOpen={!!selectedEpisode}
          onClose={handleClosePlayer}
          title={`${selectedShow.name} S${selectedSeason.season_number}E${selectedEpisode.episode_number} - ${selectedEpisode.name}`}
          videoUrl={tmdbApi.getTVEpisodeStreamUrls(
            selectedShow.id,
            selectedSeason.season_number,
            selectedEpisode.episode_number
          )[selectedServer]}
        />
      )}
    </div>
  );
};

export default TVSeries;