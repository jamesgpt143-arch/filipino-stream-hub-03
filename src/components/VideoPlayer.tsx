import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { List } from 'lucide-react';
import { Card } from './ui/card';
import { Channel } from '@/data/channels';
import { StreamSelector } from './StreamSelector';

// Idineklara ang shaka bilang global variable (na-load sa index.html)
declare global {
  interface Window {
    shaka: any;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStreamSelector, setShowStreamSelector] = useState(false);
  const [currentEmbedUrl, setCurrentEmbedUrl] = useState<string>('');

  useEffect(() => {
    // Tinitiyak na ang Shaka player ay available dahil na-load na ito sa index.html
    if (window.shaka) {
      window.shaka.polyfill.installAll();
      if (!window.shaka.Player.isBrowserSupported()) {
        setError('Browser not supported');
      }
    }

    // Ang cleanup function na ito ay tatakbo kapag nagbago ang channel o kapag na-unmount ang component
    return () => {
      if (uiRef.current) {
        uiRef.current.destroy();
        uiRef.current = null;
      }
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const loadChannel = async () => {
      // Linisin muna ang dating player instance
      if (uiRef.current) await uiRef.current.destroy();
      if (playerRef.current) await playerRef.current.destroy();
      playerRef.current = null;
      uiRef.current = null;
      
      if (!channel) return;

      setIsLoading(true);
      setError(null);

      // Kung ang channel ay YouTube, huwag nang ituloy ang Shaka player setup
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

      // Kung HLS/MPD, ituloy ang Shaka player setup
      setShowStreamSelector(false);
      if (!videoRef.current || !containerRef.current) return;
      
      try {
        if (!window.shaka || !window.shaka.ui) {
          setError('Shaka Player UI not ready');
          setIsLoading(false);
          return;
        }

        const player = new window.shaka.Player(videoRef.current);
        const ui = new window.shaka.ui.Overlay(player, containerRef.current, videoRef.current);
        playerRef.current = player;
        uiRef.current = ui;

        ui.configure({ addBigPlayButton: true });

        player.addEventListener('error', (event: any) => {
          console.error('Shaka Player Error:', event.detail);
          setError(`Player Error: ${event.detail.message || 'Unknown error'}`);
        });

        player.getNetworkingEngine().registerRequestFilter((type: any, request: any) => {
          request.headers['Referer'] = channel.referer || 'https://example.com';
        });

        if (channel.clearKey) {
          player.configure({ drm: { clearKeys: channel.clearKey } });
        } else if (channel.widevineUrl) {
          player.configure({ drm: { servers: { 'com.widevine.alpha': channel.widevineUrl } } });
        }

        await player.load(channel.manifestUri);

        const textTracks = player.getTextTracks();
        const englishTrack = textTracks.find((track: any) => track.language === 'en');
        if (englishTrack) {
          player.setTextTrackVisibility(true);
          player.selectTextTrack(englishTrack);
        }
        
        setIsLoading(false);
        videoRef.current?.play();

      } catch (err) {
        console.error('Error loading channel:', err);
        setError(`Failed to load ${channel.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    loadChannel();
  }, [channel]);

  const handleStreamSelect = (stream: any) => {
    setCurrentEmbedUrl(stream.embedUrl);
    setShowStreamSelector(false);
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
      <div className="relative bg-black w-full aspect-video">
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
            ref={containerRef}
            className="relative w-full h-full"
            style={{ '--shaka-primary-color': 'hsl(var(--primary))' } as any}
          >
            <video
              ref={videoRef}
              className="w-full h-full"
              poster=""
            />
            {isLoading && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center animate-fade-in z-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center animate-fade-in z-20">
                <p className="text-white text-center p-4">{error}</p>
              </div>
            )}
          </div>
        )}

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose} 
          className="absolute top-4 right-4 text-white hover:bg-white/20 z-30"
        >
          ✕
        </Button>
        {channel.type === 'youtube' && channel.hasMultipleStreams && channel.youtubeChannelId && !showStreamSelector && (
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
