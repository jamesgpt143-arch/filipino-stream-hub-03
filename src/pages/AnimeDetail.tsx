import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AnimeCard } from '@/components/AnimeCard';
import { SeasonEpisodeSelector } from '@/components/SeasonEpisodeSelector';
import { VideoModal } from '@/components/VideoModal';
import { TrailerModal } from '@/components/TrailerModal';
import { ArrowLeft, Play, Star, ChevronDown, Youtube } from 'lucide-react';
import { TVShow, Video, tmdbApi } from '@/lib/tmdb';
import { useToast } from '@/hooks/use-toast';

const AnimeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [anime, setAnime] = useState<TVShow | null>(null);
  const [recommendations, setRecommendations] = useState<TVShow[]>([]);
  const [trailer, setTrailer] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  
  // Player states
  const [selectedAnime, setSelectedAnime] = useState<TVShow | null>(null);
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [selectedEpisodeTitle, setSelectedEpisodeTitle] = useState<string>('');
  const [showSeasonSelector, setShowSeasonSelector] = useState(false);

  useEffect(() => {
    const fetchAnimeDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const [animeData, videosData] = await Promise.all([
          tmdbApi.getTVShowDetails(parseInt(id)),
          tmdbApi.getTVShowVideos(parseInt(id))
        ]);
        
        setAnime(animeData);
        
        // Find trailer
        const trailerVideo = videosData.results.find(
          v => v.type === 'Trailer' && v.site === 'YouTube'
        ) || videosData.results.find(v => v.site === 'YouTube');
        setTrailer(trailerVideo || null);
        
        // Fetch recommendations
        try {
          const recsData = await tmdbApi.getAnimeRecommendations(parseInt(id));
          setRecommendations(recsData.results.slice(0, 12));
        } catch {
          const popularData = await tmdbApi.getPopularAnime();
          setRecommendations(popularData.results.slice(0, 12));
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load anime details.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnimeDetails();
  }, [id, toast]);

  const handlePlayAnime = (animeToPlay: TVShow, server: string) => {
    setSelectedAnime(animeToPlay);
    setSelectedServer(server);
    setShowSeasonSelector(true);
  };

  const handleEpisodeSelect = (season: number, episode: number, title: string) => {
    setSelectedSeason(season);
    setSelectedEpisode(episode);
    setSelectedEpisodeTitle(title);
    setShowSeasonSelector(false);
  };

  const handleClosePlayer = () => {
    setSelectedAnime(null);
    setSelectedServer('');
    setSelectedSeason(null);
    setSelectedEpisode(null);
    setSelectedEpisodeTitle('');
  };

  const handleBackToServerSelection = () => {
    setShowSeasonSelector(false);
    setSelectedAnime(null);
    setSelectedServer('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-[400px] w-full rounded-xl mb-6" />
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Anime not found</h1>
          <Button onClick={() => navigate('/anime')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Anime
          </Button>
        </div>
      </div>
    );
  }

  const servers = tmdbApi.getAnimeEpisodeStreamUrls(anime.id, 1, 1);

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Button variant="ghost" onClick={() => navigate('/anime')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Anime
        </Button>
      </div>

      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${tmdbApi.getImageUrl(anime.backdrop_path || anime.poster_path, 'original')})`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <Badge className="bg-accent text-accent-foreground mb-2">Anime</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {anime.name}
            </h1>
            <div className="flex items-center gap-4 mb-6">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {anime.vote_average.toFixed(1)}
              </Badge>
              <span className="text-muted-foreground">
                {anime.first_air_date ? new Date(anime.first_air_date).getFullYear() : 'TBA'}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="lg" className="bg-accent hover:bg-accent/90">
                    <Play className="w-5 h-5 mr-2" />
                    Watch Now
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {Object.keys(servers).map((serverName) => (
                    <DropdownMenuItem
                      key={serverName}
                      onClick={() => handlePlayAnime(anime, serverName)}
                    >
                      {serverName}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {trailer && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowTrailer(true)}
                >
                  <Youtube className="w-5 h-5 mr-2" />
                  Trailer
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Synopsis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Synopsis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {anime.overview || 'No synopsis available.'}
            </p>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">More Like This</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendations.map((rec) => (
                <AnimeCard
                  key={rec.id}
                  anime={rec}
                  onPlay={handlePlayAnime}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Season/Episode Selector */}
      {showSeasonSelector && selectedAnime && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <SeasonEpisodeSelector
              show={selectedAnime}
              server={selectedServer}
              onEpisodeSelect={handleEpisodeSelect}
              onBack={handleBackToServerSelection}
            />
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedAnime && selectedSeason && selectedEpisode && (
        <VideoModal
          isOpen={!!selectedEpisode}
          onClose={handleClosePlayer}
          videoUrl={tmdbApi.getAnimeEpisodeStreamUrls(selectedAnime.id, selectedSeason, selectedEpisode)[selectedServer as keyof ReturnType<typeof tmdbApi.getAnimeEpisodeStreamUrls>] || tmdbApi.getAnimeEpisodeStreamUrls(selectedAnime.id, selectedSeason, selectedEpisode)['Server 1']}
          title={`${selectedAnime.name} - S${selectedSeason}E${selectedEpisode}: ${selectedEpisodeTitle}`}
        />
      )}

      {/* Trailer Modal */}
      {trailer && (
        <TrailerModal
          isOpen={showTrailer}
          onClose={() => setShowTrailer(false)}
          videoKey={trailer.key}
          title={`${anime.name} - Trailer`}
        />
      )}
    </div>
  );
};

export default AnimeDetail;