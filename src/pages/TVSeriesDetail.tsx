import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TVShow, tmdbApi, Season, Episode } from '@/lib/tmdb';
import { Button } from '@/components/ui/button';
import { Play, Calendar, Star, ArrowLeft, Layers, Server, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VideoModal } from '@/components/VideoModal';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { UserStats } from '@/components/UserStats';
import { useClickadillaAds } from '@/hooks/useClickadillaAds';

const TVSeriesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState<TVShow | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("1");
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [currentServer, setCurrentServer] = useState('Server 1');
  
  const { toast } = useToast();
  useClickadillaAds();

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

  // DIRECT PLAY HANDLER
  const handleEpisodeClick = (episode: Episode) => {
    setCurrentEpisode(episode);
    setIsVideoOpen(true);
    toast({
      title: "Playing Episode",
      description: `S${selectedSeason}:E${episode.episode_number} - ${episode.name}`,
    });
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

  const getStreamUrl = () => {
    if (!currentEpisode) return "";
    const urls = tmdbApi.getTVEpisodeStreamUrls(show.id, parseInt(selectedSeason), currentEpisode.episode_number);
    return urls[currentServer as keyof typeof urls];
  };

  // Get available servers based on CURRENT state
  const availableServers = currentEpisode 
    ? tmdbApi.getTVEpisodeStreamUrls(show.id, parseInt(selectedSeason), currentEpisode.episode_number) 
    : tmdbApi.getTVEpisodeStreamUrls(show.id, 1, 1);

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

              {/* START WATCHING BUTTON */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button 
                    size="lg" 
                    className="gap-2 bg-primary/90 hover:bg-primary"
                    disabled={episodes.length === 0}
                    onClick={() => {
                        if(episodes.length > 0) handleEpisodeClick(episodes[0]);
                    }}
                >
                  <Play className="w-5 h-5" /> 
                  Start Watching S1:E1
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
                    className="cursor-pointer hover:bg-accent transition-colors group border-transparent hover:border-primary/50"
                    onClick={() => handleEpisodeClick(episode)}
                  >
                    <CardContent className="p-4 flex gap-4 relative">
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
