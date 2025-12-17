import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { TVShow, tmdbApi, Season, Episode } from '@/lib/tmdb';
import { Button } from '@/components/ui/button';
import { Play, Calendar, Star, ArrowLeft, Layers, Server, Loader2, Lock, Unlock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VideoModal } from '@/components/VideoModal';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { UserStats } from '@/components/UserStats';
import { useClickadillaAds } from '@/hooks/useClickadillaAds';

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
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { toast } = useToast();
  useClickadillaAds();

  // 1. CHECK ACCESS LOGIC
  useEffect(() => {
    const checkAccess = () => {
      const now = Date.now();
      const expiry = localStorage.getItem('flame_session_expiry');
      
      const params = new URLSearchParams(location.search);
      if (params.get('auth') === 'success') {
         const newExpiry = now + (12 * 60 * 60 * 1000);
         localStorage.setItem('flame_session_expiry', newExpiry.toString());
         setIsUnlocked(true);
         
         const retS = params.get('s');
         const retE = params.get('e');
         if (retS && retE) {
             setSelectedSeason(retS);
             // Note: Episode might not be loaded yet, user might need to click manually if not instant
             // But we unlocked it!
             toast({ title: "Unlocked! 🔓", description: `You can now watch S${retS}:E${retE}` });
         } else {
             toast({ title: "Unlocked! 🔓", description: "Enjoy watching!" });
         }

         window.history.replaceState({}, '', location.pathname);
         return;
      }

      if (expiry && parseInt(expiry) > now) {
        setIsUnlocked(true);
      } else {
        setIsUnlocked(false);
      }
    };
    checkAccess();
  }, [location, toast]);

  useEffect(() => {
    const fetchShowData = async () => {
      if (!id) return;
      try {
        const showData = await tmdbApi.getTVShowDetails(parseInt(id));
        setShow(showData);
        setSeasons(showData.seasons || []);
      } catch (error) {
        console.error(error);
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

  // SAVE HISTORY HELPER
  const addToHistory = (episode: Episode) => {
    if (!show) return;
    
    const historyItem = {
        id: `tv-${show.id}`,
        tmdbId: show.id,
        type: 'tv',
        title: show.name,
        posterPath: show.backdrop_path || show.poster_path,
        lastWatchedAt: Date.now(),
        season: selectedSeason,
        episode: episode.episode_number,
        episodeName: episode.name,
        link: `/tv-series/${show.id}?auth=success&s=${selectedSeason}&e=${episode.episode_number}`
    };

    const stored = localStorage.getItem('flame_watch_history');
    let history = stored ? JSON.parse(stored) : [];
    
    history = history.filter((h: any) => h.id !== historyItem.id);
    history.unshift(historyItem);
    if (history.length > 20) history.pop();

    localStorage.setItem('flame_watch_history', JSON.stringify(history));
  };

  // EPISODE CLICK
  const handleEpisodeClick = async (episode: Episode) => {
    setCurrentEpisode(episode);

    // If Unlocked, play directly & save
    if (isUnlocked) {
        addToHistory(episode);
        setIsVideoOpen(true);
        return;
    }

    // If Locked, redirect to Ads
    if (!window.confirm(`Watch a short ad to unlock ${show?.name} for 12 hours?`)) return;

    setIsProcessing(true);
    try {
        const currentPageUrl = window.location.href.split('?')[0];
        const returnUrl = `${currentPageUrl}?auth=success&s=${selectedSeason}&e=${episode.episode_number}`;
        
        const targetApiUrl = `https://cuty.io/api?api=${CUTY_API_KEY}&url=${encodeURIComponent(returnUrl)}`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetApiUrl)}`;

        const response = await fetch(proxyUrl);
        const data = await response.json();

        if (data.shortenedUrl) {
            window.location.href = data.shortenedUrl;
        } else {
            throw new Error("No link generated");
        }
    } catch (error) {
        console.error("Ad Link Error:", error);
        toast({ title: "Connection Error", description: "Try disabling AdBlock.", variant: "destructive" });
        setIsProcessing(false);
    }
  };

  if (!show) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const getStreamUrl = () => {
    if (!currentEpisode) return "";
    const urls = tmdbApi.getTVEpisodeStreamUrls(show.id, parseInt(selectedSeason), currentEpisode.episode_number);
    return urls[currentServer as keyof typeof urls];
  };

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
                   {isUnlocked ? <Unlock className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-red-500" />}
                   {isUnlocked ? "Premium Access" : "Ad-Supported"}
                 </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  {show.vote_average.toFixed(1)}
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

              <div className="flex flex-wrap gap-3 pt-2">
                <Button 
                    size="lg" 
                    className={`gap-2 ${isUnlocked ? 'bg-primary' : 'bg-yellow-600'}`}
                    disabled={episodes.length === 0 || isProcessing}
                    onClick={() => {
                        if(episodes.length > 0) handleEpisodeClick(episodes[0]);
                    }}
                >
                   {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : isUnlocked ? <Play className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                   {isProcessing ? "Unlocking..." : isUnlocked ? "Start Watching S1:E1" : "Unlock to Watch"}
                </Button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <section>
            <h2 className="text-xl font-semibold mb-3">Overview</h2>
            <p className="text-muted-foreground leading-relaxed">{show.overview}</p>
          </section>

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
                    className={`cursor-pointer transition-all group border-transparent hover:border-primary/50 ${isUnlocked ? 'hover:bg-accent' : 'opacity-90 hover:opacity-100 bg-secondary/50'}`}
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
                         {!isUnlocked && (
                           <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                              <Lock className="w-6 h-6 text-white/80" />
                           </div>
                        )}
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
