import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { TVShow, tmdbApi, Season, Episode } from '@/lib/tmdb';
import { Button } from '@/components/ui/button';
import { Play, Calendar, Star, ArrowLeft, Layers, ExternalLink, Loader2, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VideoModal } from '@/components/VideoModal';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { UserStats } from '@/components/UserStats';
import { useClickadillaAds } from '@/hooks/useClickadillaAds';

// API KEY MO
const CUTY_API_KEY = '67e33ac96fe3e5f792747feb8c184f871726dc01';

const TVSeriesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [show, setShow] = useState<TVShow | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("1");
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [currentServer, setCurrentServer] = useState('Server 1');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  
  const { toast } = useToast();
  useClickadillaAds();

  // 1. AUTO-PLAY DETECTION (Pagbalik galing Cuty)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('autoplay') === 'true') {
      // Note: Sa TV Series, medyo tricky ang autoplay kasi kailangan alam natin kung anong episode.
      // For now, bubuksan nito ang player kung may selected episode na, or mag-aabang.
      // Dahil nag-reload ang page, pwedeng reset sa S1E1 ito. 
      // Pero okay lang 'yun, at least nag-play.
      
      // Auto-select first episode if none selected logic can be added here
      setIsVideoOpen(true);
      
      window.history.replaceState({}, '', location.pathname);
      toast({
        title: "Thanks for supporting!",
        description: "Enjoy watching the series.",
        duration: 3000,
        className: "bg-green-600 text-white border-none"
      });
    }
  }, [location]);

  useEffect(() => {
    const fetchShowData = async () => {
      if (!id) return;
      try {
        const showData = await tmdbApi.getTVShowDetails(parseInt(id));
        setShow(showData);
        setSeasons(showData.seasons || []);
      } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Failed to load show details", variant: "destructive" });
      }
    };
    fetchShowData();
  }, [id]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!id || !selectedSeason) return;
      try {
        const data = await tmdbApi.getSeasonEpisodes(parseInt(id), parseInt(selectedSeason));
        setEpisodes(data.episodes || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchEpisodes();
  }, [id, selectedSeason]);

  const handlePlayEpisode = (episode: Episode) => {
    setCurrentEpisode(episode);
    setIsVideoOpen(true);
  };

  // 2. MONETIZATION HANDLER (THE WORKING FIX)
  const handleMonetizedClick = async () => {
    // Check muna kung may piniling episode
    if (!currentEpisode && episodes.length > 0) {
        // Default to first episode if none clicked yet
        setCurrentEpisode(episodes[0]);
    } else if (!currentEpisode && episodes.length === 0) {
        toast({ description: "Please wait for episodes to load.", variant: "destructive" });
        return;
    }

    setIsGeneratingLink(true);
    
    try {
        const currentPageUrl = window.location.href.split('?')[0];
        const returnUrl = `${currentPageUrl}?autoplay=true`;
        
        // Target URL (Cuty API)
        const targetApiUrl = `https://cuty.io/api?api=${CUTY_API_KEY}&url=${encodeURIComponent(returnUrl)}`;
        
        // Proxy URL (allorigins)
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetApiUrl)}`;

        const response = await fetch(proxyUrl);
        const proxyData = await response.json();

        if (proxyData.contents) {
            const cutyData = JSON.parse(proxyData.contents);

            if (cutyData.shortenedUrl) {
                window.location.href = cutyData.shortenedUrl;
                return;
            }
        }
        throw new Error("Invalid response");

    } catch (error) {
        console.error("Monetization Error:", error);
        toast({ 
            title: "Support Link Error", 
            description: "Opening player directly...", 
            variant: "destructive" 
        });
        setIsVideoOpen(true);
    } finally {
        setIsGeneratingLink(false);
    }
  };

  if (!show) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p>Loading TV Show...</p>
        </div>
      </div>
    );
  }

  // Get stream URLs logic
  const getStreamUrl = () => {
    if (!currentEpisode) return "";
    const urls = tmdbApi.getTVEpisodeStreamUrls(show.id, parseInt(selectedSeason), currentEpisode.episode_number);
    return urls[currentServer as keyof typeof urls];
  };

  // Get available servers for display
  const availableServers = currentEpisode 
    ? tmdbApi.getTVEpisodeStreamUrls(show.id, parseInt(selectedSeason), currentEpisode.episode_number) 
    : { 'Server 1': '', 'Server 2': '' };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh]">
        <div className="absolute inset-0">
          <img
            src={tmdbApi.getImageUrl(show.backdrop_path, 'original')}
            alt={show.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />
        </div>

        <div className="absolute top-4 left-4 z-50">
           <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => navigate(-1)}>
             <ArrowLeft className="mr-2 h-4 w-4" /> Back
           </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 container mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <img
              src={tmdbApi.getImageUrl(show.poster_path)}
              alt={show.name}
              className="w-32 md:w-48 rounded-lg shadow-2xl hidden md:block"
            />

            <div className="flex-1 space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold text-white">{show.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  {show.vote_average.toFixed(1)}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(show.first_air_date).getFullYear()}
                </div>
                <div className="flex items-center gap-1">
                  <Layers className="w-4 h-4" />
                  {show.seasons?.length} Seasons
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {show.genre_ids?.map(id => (
                   <Badge key={id} variant="outline" className="text-white border-white/20">
                     Genre {id}
                   </Badge>
                ))}
              </div>

               {/* SERVER SELECTOR */}
               <div className="flex flex-col gap-2 pt-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Select Server:</span>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(availableServers).map((serverName) => (
                    <Button
                      key={serverName}
                      variant={currentServer === serverName ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentServer(serverName)}
                      className={`h-8 border-white/20 ${currentServer === serverName ? 'bg-primary text-primary-foreground' : 'text-white hover:bg-white/10'}`}
                    >
                      <Server className="w-3 h-3 mr-2" />
                      {serverName}
                    </Button>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap gap-3 pt-2">
                {/* Note: Direct Play is usually triggered by clicking an episode list item below, 
                    but we can add a "Play First Episode" button here */}
                <Button 
                    size="lg" 
                    className="gap-2 bg-primary/90 hover:bg-primary"
                    onClick={() => {
                        if(episodes.length > 0) handlePlayEpisode(episodes[0]);
                    }}
                >
                  <Play className="w-5 h-5" /> Start Watching
                </Button>

                {/* MONETIZED BUTTON */}
                <Button 
                    size="lg" 
                    variant="secondary" 
                    disabled={isGeneratingLink}
                    className="gap-2 bg-yellow-600 hover:bg-yellow-700 text-white border-none shadow-lg shadow-yellow-900/20"
                    onClick={handleMonetizedClick}
                >
                  {isGeneratingLink ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Generating Link...
                    </>
                  ) : (
                    <>
                        <ExternalLink className="w-5 h-5" /> Support & Watch
                    </>
                  )}
                </Button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Overview */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Overview</h2>
            <p className="text-muted-foreground leading-relaxed">{show.overview}</p>
          </section>

          {/* Season & Episodes */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Episodes</h2>
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select Season" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((season) => (
                    <SelectItem key={season.id} value={season.season_number.toString()}>
                      Season {season.season_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-[500px] rounded-md border p-4">
              <div className="space-y-4">
                {episodes.map((episode) => (
                  <Card 
                    key={episode.id} 
                    className="cursor-pointer hover:bg-accent transition-colors group"
                    onClick={() => handlePlayEpisode(episode)}
                  >
                    <CardContent className="p-4 flex gap-4">
                      <div className="relative w-32 aspect-video flex-shrink-0 bg-muted rounded overflow-hidden">
                        {episode.still_path ? (
                          <img 
                            src={tmdbApi.getImageUrl(episode.still_path, 'w300')} 
                            alt={episode.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Play className="w-8 h-8 opacity-50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold truncate pr-2">
                            {episode.episode_number}. {episode.name}
                          </h3>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {episode.runtime ? `${episode.runtime}m` : 'N/A'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {episode.overview || "No description available."}
                        </p>
                        <div className="mt-2 text-xs text-muted-foreground">
                            {new Date(episode.air_date).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </section>
        </div>
      </div>

      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        title={currentEpisode ? `S${selectedSeason}E${currentEpisode.episode_number}: ${currentEpisode.name}` : show.name}
        videoUrl={getStreamUrl()}
      />
      <UserStats pagePath={`/tv-series/${id}`} />
    </div>
  );
};

export default TVSeriesDetail;
