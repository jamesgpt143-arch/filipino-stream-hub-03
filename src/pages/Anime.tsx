import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AnimeCard } from '@/components/AnimeCard';
import { VideoModal } from '@/components/VideoModal';
import { DonateButton } from '@/components/DonateButton';
import { UserStats } from '@/components/UserStats';
import { Search, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { TVShow, Season, Episode, tmdbApi } from '@/lib/tmdb';
import { useToast } from '@/hooks/use-toast';
import { useClickadillaAds } from '@/hooks/useClickadillaAds';

const Anime = () => {
  const [animeList, setAnimeList] = useState<TVShow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnime, setSelectedAnime] = useState<TVShow | null>(null);
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [selectedEpisodeTitle, setSelectedEpisodeTitle] = useState<string>('');
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [showSeasonDialog, setShowSeasonDialog] = useState(false);
  const [showEpisodeDialog, setShowEpisodeDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  
  useClickadillaAds();

  useEffect(() => {
    loadAnime();
  }, [currentPage]);

  useEffect(() => {
    if (searchTerm) {
      const delayDebounce = setTimeout(() => {
        searchAnime();
      }, 500);
      return () => clearTimeout(delayDebounce);
    } else {
      loadAnime();
    }
  }, [searchTerm]);

  const loadAnime = async () => {
    setIsLoading(true);
    try {
      const data = await tmdbApi.getPopularAnime(currentPage);
      setAnimeList(data.results);
      setTotalPages(Math.min(data.total_pages, 500));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load anime. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchAnime = async () => {
    setIsLoading(true);
    try {
      const data = await tmdbApi.searchAnime(searchTerm, currentPage);
      setAnimeList(data.results);
      setTotalPages(Math.min(data.total_pages, 500));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search anime. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAnime = async (anime: TVShow, server: string) => {
    try {
      const showData = await tmdbApi.getTVShowDetails(anime.id);
      if (showData.seasons) {
        setSeasons(showData.seasons.filter(s => s.season_number > 0));
      }
      setSelectedAnime(anime);
      setSelectedServer(server);
      setShowSeasonDialog(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load anime details.",
        variant: "destructive"
      });
    }
  };

  const handleSelectSeason = async (seasonNumber: number) => {
    if (!selectedAnime) return;
    try {
      const seasonData = await tmdbApi.getSeasonEpisodes(selectedAnime.id, seasonNumber);
      setEpisodes(seasonData.episodes || []);
      setSelectedSeason(seasonNumber);
      setShowSeasonDialog(false);
      setShowEpisodeDialog(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load episodes.",
        variant: "destructive"
      });
    }
  };

  const handleSelectEpisode = (episodeNumber: number, episodeName: string) => {
    setSelectedEpisode(episodeNumber);
    setSelectedEpisodeTitle(episodeName);
    setShowEpisodeDialog(false);
    toast({
      title: "Now Playing",
      description: `${selectedAnime?.name} - S${selectedSeason}E${episodeNumber}: ${episodeName}`,
    });
  };

  const handleClosePlayer = () => {
    setSelectedAnime(null);
    setSelectedServer('');
    setSelectedSeason(null);
    setSelectedEpisode(null);
    setSelectedEpisodeTitle('');
    setSeasons([]);
    setEpisodes([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Anime</h1>
            <p className="text-muted-foreground">Watch your favorite anime series</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search anime..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>

        {/* Notice */}
        <Alert className="mb-6 bg-accent/10 border-accent">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Tip: Use an ad blocker for a better streaming experience. Click on an anime to see details and select episodes.
          </AlertDescription>
        </Alert>

        {/* Anime Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
          {isLoading ? (
            Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[2/3] rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
          ) : (
            animeList.map((anime) => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                onPlay={handlePlayAnime}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <span className="text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Season Selection Dialog */}
        <Dialog open={showSeasonDialog} onOpenChange={setShowSeasonDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Select Season - {selectedAnime?.name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
              {seasons.map((season) => (
                <Button
                  key={season.season_number}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center"
                  onClick={() => handleSelectSeason(season.season_number)}
                >
                  <span className="font-semibold">Season {season.season_number}</span>
                  <span className="text-xs text-muted-foreground">{season.episode_count} episodes</span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Episode Selection Dialog */}
        <Dialog open={showEpisodeDialog} onOpenChange={setShowEpisodeDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{selectedAnime?.name} - Season {selectedSeason}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[500px] overflow-y-auto">
              {episodes.map((episode) => (
                <Button
                  key={episode.episode_number}
                  variant="outline"
                  className="h-auto py-3 px-4 flex flex-col items-start text-left"
                  onClick={() => handleSelectEpisode(episode.episode_number, episode.name)}
                >
                  <div className="flex items-center gap-2 w-full">
                    {episode.still_path && (
                      <img
                        src={tmdbApi.getImageUrl(episode.still_path, 'w92')}
                        alt={episode.name}
                        className="w-16 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold block truncate">Ep {episode.episode_number}: {episode.name}</span>
                      <span className="text-xs text-muted-foreground">{episode.runtime ? `${episode.runtime} min` : ''}</span>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Video Modal */}
        {selectedAnime && selectedSeason && selectedEpisode && (
          <VideoModal
            isOpen={!!selectedEpisode}
            onClose={handleClosePlayer}
            videoUrl={tmdbApi.getAnimeEpisodeStreamUrls(selectedAnime.id, selectedSeason, selectedEpisode)[selectedServer as keyof ReturnType<typeof tmdbApi.getAnimeEpisodeStreamUrls>] || tmdbApi.getAnimeEpisodeStreamUrls(selectedAnime.id, selectedSeason, selectedEpisode)['Server 1']}
            title={`${selectedAnime.name} - S${selectedSeason}E${selectedEpisode}: ${selectedEpisodeTitle}`}
          />
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              © 2025 flameiptv. Stream anime for free.
            </p>
            <div className="flex items-center gap-4">
              <DonateButton />
            </div>
          </div>
          <UserStats pagePath="/anime" />
        </footer>
      </div>
    </div>
  );
};

export default Anime;