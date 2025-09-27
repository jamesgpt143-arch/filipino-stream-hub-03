import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoModal } from '@/components/VideoModal';
import { TVShowCard } from '@/components/TVShowCard';
import { DonateButton } from '@/components/DonateButton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Star, Play, ChevronDown } from 'lucide-react';
import { TVShow, tmdbApi } from '@/lib/tmdb';

const TVSeriesDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [show, setShow] = useState<TVShow | null>(null);
  const [recommendedShows, setRecommendedShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShow, setSelectedShow] = useState<TVShow | null>(null);
  const [selectedServer, setSelectedServer] = useState<string>('');

  useEffect(() => {
    const loadShowData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const showData = await tmdbApi.getTVShowDetails(Number(id));
        setShow(showData);
        
        // Load recommended TV shows (popular shows for now)
        const popularShows = await tmdbApi.getPopularTVShows(1);
        setRecommendedShows(popularShows.results.slice(0, 8));
      } catch (error) {
        console.error('Error loading TV show data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadShowData();
  }, [id]);

  const handlePlayShow = (show: TVShow, server: string) => {
    setSelectedShow(show);
    setSelectedServer(server);
  };

  const handleClosePlayer = () => {
    setSelectedShow(null);
    setSelectedServer('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-8"></div>
            <div className="h-96 bg-muted rounded mb-8"></div>
            <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-full mb-2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">TV Series not found</h1>
          <Button onClick={() => navigate('/tv-series')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to TV Series
          </Button>
        </div>
      </div>
    );
  }

  const servers = tmdbApi.getTVEpisodeStreamUrls(show.id, 1, 1);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => navigate('/tv-series')}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to TV Series
        </Button>

        {/* TV Show Header with Backdrop */}
        <div 
          className="relative rounded-lg overflow-hidden mb-8 h-96 bg-cover bg-center"
          style={{ 
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${tmdbApi.getImageUrl(show.backdrop_path, 'w1280')})` 
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4">{show.name}</h1>
              <div className="flex items-center justify-center gap-4 mb-6">
                <Badge variant="secondary" className="bg-background/80 text-foreground">
                  <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                  {show.vote_average.toFixed(1)}
                </Badge>
                <Badge variant="secondary" className="bg-background/80 text-foreground">
                  {new Date(show.first_air_date).getFullYear()}
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    Watch Now
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background border-border">
                  {Object.keys(servers).map((server) => (
                    <DropdownMenuItem
                      key={server}
                      onClick={() => handlePlayShow(show, server)}
                      className="cursor-pointer hover:bg-muted"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {server}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Synopsis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Synopsis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {show.overview}
            </p>
          </CardContent>
        </Card>

        {/* Recommended TV Shows */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Recommended TV Series</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {recommendedShows.map((recommendedShow) => (
              <TVShowCard
                key={recommendedShow.id}
                show={recommendedShow}
                onPlay={handlePlayShow}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <DonateButton />
        </div>
      </div>

      {/* Video Modal */}
      {selectedShow && (
        <VideoModal
          isOpen={!!selectedShow}
          title={selectedShow.name}
          videoUrl={tmdbApi.getTVEpisodeStreamUrls(selectedShow.id, 1, 1)[selectedServer]}
          onClose={handleClosePlayer}
        />
      )}
    </div>
  );
};

export default TVSeriesDetail;