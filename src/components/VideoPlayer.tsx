import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { List, AlertCircle, RefreshCw } from 'lucide-react'; // Added icons
import { Card } from './ui/card';
import { Channel } from '@/data/channels';
import { StreamSelector } from './StreamSelector';

// Idineklara ang shaka at jwplayer bilang global variable
declare global {
  interface Window {
    shaka: any;
    jwplayer: any;
  }
}

interface VideoPlayerProps {
  channel: Channel | null;
  onClose: () => void;
}

const Placeholder = () => (
  <div className="aspect-video bg-gradient-to-br from-muted/20 to-muted/10 flex items-center justify-center p-4">
    <div className="text-center">
      <div className="bg-muted/20 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
        <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">Select a Channel</h3>
      <p className="text-sm text-muted-foreground">Choose a channel from the list to start watching</p>
    </div>
  </div>
);

export const VideoPlayer = ({ channel, onClose }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const uiRef = useRef<any>(null);
  const jwPlayerRef = useRef<any>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStreamSelector, setShowStreamSelector] = useState(false);
  const [currentEmbedUrl, setCurrentEmbedUrl] = useState<string>('');
  const [retryTrigger, setRetryTrigger] = useState(0); // Pang-trigger ng manual reload

  useEffect(() => {
    // Ensure Shaka polyfills are installed
    if (window.shaka) {
      window.shaka.polyfill.installAll();
      if (!window.shaka.Player.isBrowserSupported()) {
        setError('Browser not supported');
      }
    }

    return () => {
      destroyPlayers();
    };
  }, []);

  const destroyPlayers = async () => {
    if (uiRef.current) {
      await uiRef.current.destroy();
      uiRef.current = null;
    }
    if (playerRef.current) {
      await playerRef.current.destroy();
      playerRef.current = null;
    }
    if (jwPlayerRef.current) {
      jwPlayerRef.current.remove();
      jwPlayerRef.current = null;
    }
  };

  const loadChannel = useCallback(async () => {
    await destroyPlayers();

    if (!channel) return;

    setIsLoading(true);
    setError(null);

    // 1. Handle YouTube type
    if (channel.type === 'youtube') {
      if (channel.hasMultipleStreams && channel.youtubeChannelId) {
        setShowStreamSelector(true);
      } else {
        setShowStreamSelector(false);
        setCurrentEmbedUrl(channel.embedUrl || '');
      }
      setIsLoading(false);
      return;
    }

    // 2. Check kung m3u8 → JW Player
    const isM3u8 = channel.manifestUri?.includes('.m3u8');
    setShowStreamSelector(false);

    if (isM3u8 && window.jwplayer) {
      try {
        if (!containerRef.current) return;

        const playerId = `jwplayer-${Date.now()}`;
        const playerDiv = document.createElement('div');
        playerDiv.id = playerId;
        playerDiv.className = 'w-full h-full';

        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(playerDiv);

        const player = window.jwplayer(playerId).setup({
          file: channel.manifestUri,
          width: '100%',
          height: '100%',
          autostart: true,
          mute: false,
          stretching: 'uniform',
          primary: 'html5',
          hlshtml: true,
          androidhls: true
        });

        jwPlayerRef.current = player;

        player.on('ready', () => {
          setIsLoading(false);
          console.log('JW Player ready for', channel.name);
        });

        player.on('error', (event: any) => {
          console.error('JW Player Error:', event);
          setError(`Stream Error: ${event.message || 'The stream might be offline.'}`);
          setIsLoading(false);
        });

      } catch (err) {
        console.error('Error loading JW Player:', err);
        setError('Failed to load player components.');
        setIsLoading(false);
      }
    } else {
      // 3. Shaka Player for DASH/others (With Retry Logic)
      if (!containerRef.current) return;

      try {
        if (!window.shaka || !window.shaka.ui) {
          setError('Video Player resources not ready. Please refresh.');
          setIsLoading(false);
          return;
        }

        // 🟢 Recreate <video> element para clean slate
        containerRef.current.innerHTML = '';
        const videoEl = document.createElement('video');
        videoEl.className = 'w-full h-full';
        videoEl.autoplay = true; // Auto-play
        containerRef.current.appendChild(videoEl);
        videoRef.current = videoEl as HTMLVideoElement;

        const player = new window.shaka.Player(videoRef.current);
        const ui = new window.shaka.ui.Overlay(player, containerRef.current, videoRef.current);
        playerRef.current = player;
        uiRef.current = ui;

        ui.configure({ addBigPlayButton: true });

        // Better Error Handling
        player.addEventListener('error', (event: any) => {
          const { category, code } = event.detail;
          console.error('Shaka Error:', code, category);

          if (category === window.shaka.util.Error.Category.NETWORK) {
             // Network error - usually CORS or offline
             setError('Network Error: Stream is unreachable or blocked. Try Retrying.');
          } else if (category === window.shaka.util.Error.Category.MANIFEST) {
             setError('Stream Error: Invalid link or stream ended.');
          } else {
             setError(`Playback Error: ${event.detail.message || 'Unknown error'}`);
          }
          setIsLoading(false);
        });

        player.getNetworkingEngine().registerRequestFilter((type: any, request: any) => {
          request.headers['Referer'] = channel.referer || 'https://example.com';
        });

        // AUTO-RETRY CONFIGURATION
        const config = {
            streaming: {
                bufferingGoal: 15,
                rebufferingGoal: 2,
                retryParameters: {
                    maxAttempts: 2, // Subukan ng 2 beses pag nag-fail
                    baseDelay: 1000,
                    backoffFactor: 2,
                    fuzzFactor: 0.5,
                }
            }
        };
        player.configure(config);

        if (channel.clearKey) {
          player.configure({ drm: { clearKeys: channel.clearKey } });
        } else if (channel.widevineUrl) {
          player.configure({ drm: { servers: { 'com.widevine.alpha': channel.widevineUrl } } });
        }

        await player.load(channel.manifestUri);

        // Auto-select English subtitles if available
        const textTracks = player.getTextTracks();
        const englishTrack = textTracks.find((track: any) => track.language === 'en');
        if (englishTrack) {
          player.setTextTrackVisibility(true);
          player.selectTextTrack(englishTrack);
        }

        setIsLoading(false);
        // Ensure play is triggered
        videoRef.current?.play().catch(() => {
            console.log("Autoplay blocked, waiting for user interaction");
        });

      } catch (err) {
        console.error('Error loading channel:', err);
        setError(`Failed to load stream. It might be offline.`);
        setIsLoading(false);
      }
    }
  }, [channel]);

  // Trigger loadChannel when channel changes or retry is clicked
  useEffect(() => {
    loadChannel();
  }, [loadChannel, retryTrigger]);

  const handleStreamSelect = (stream: any) => {
    setCurrentEmbedUrl(stream.embedUrl);
    setShowStreamSelector(false);
  };

  const handleManualRetry = () => {
    setRetryTrigger(prev => prev + 1);
  };

  if (!channel) {
    return (
      <Card className="bg-gradient-card shadow-elegant border-primary/20 overflow-hidden w-full">
        <Placeholder />
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card shadow-elegant border-primary/20 overflow-hidden w-full">
      <div className="relative bg-black w-full aspect-video group">
        {channel.type === 'youtube' ? (
          <>
            {showStreamSelector && channel.youtubeChannelId ? (
              <StreamSelector
                channelId={channel.youtubeChannelId}
                channelName={channel.name}
                onStreamSelect={handleStreamSelect}
                onClose={() => setShowStreamSelector(false)}
              />
            ) : (
              <iframe
                src={`${currentEmbedUrl || channel.embedUrl}&autoplay=1&mute=0`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </>
        ) : (
          <div
            id="iptv-video-player"
            ref={containerRef}
            className="relative w-full h-full"
            style={{ '--shaka-primary-color': 'hsl(var(--primary))' } as any}
          >
            {/* JW Player or Shaka creates elements here */}
            
            {/* LOADING SPINNER */}
            {isLoading && !error && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center animate-fade-in z-20 pointer-events-none">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}

            {/* ERROR UI WITH RETRY BUTTON */}
            {error && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center animate-fade-in z-30 p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Stream Error</h3>
                <p className="text-gray-300 mb-6 max-w-md text-sm">{error}</p>
                
                <Button 
                    onClick={handleManualRetry}
                    className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                    <RefreshCw className="w-4 h-4" />
                    Retry Connection
                </Button>
              </div>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:bg-white/20 z-40"
        >
          ✕
        </Button>
        {channel.type === 'youtube' &&
          channel.hasMultipleStreams &&
          channel.youtubeChannelId &&
          !showStreamSelector && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStreamSelector(true)}
              className="absolute top-4 left-4 text-white bg-black/50 hover:bg-black/70 backdrop-blur-sm z-10"
              title="Select different stream"
            >
              <List className="w-4 h-4" />
            </Button>
          )}
      </div>
    </Card>
  );
};
