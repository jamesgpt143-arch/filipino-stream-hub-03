// src/components/VideoPlayer.tsx

import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { List } from 'lucide-react';
import { Card } from './ui/card';
import { Channel } from '@/data/channels';
import { StreamSelector } from './StreamSelector';

// Idineklara ang shaka at jwplayer bilang global variable (na-load sa index.html)
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
  const jwPlayerContainerRef = useRef<HTMLDivElement>(null);

  // Player instances
  const playerRef = useRef<any>(null); // Shaka Player
  const jwPlayerRef = useRef<any>(null); // JW Player

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStreamSelector, setShowStreamSelector] = useState(false);
  const [currentEmbedUrl, setCurrentEmbedUrl] = useState<string>('');

  // Cleanup effect to destroy players when component unmounts
  useEffect(() => {
    if (window.shaka) {
      window.shaka.polyfill.installAll();
      if (!window.shaka.Player.isBrowserSupported()) {
        setError('Browser not supported');
      }
    }
    
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (jwPlayerRef.current) {
        jwPlayerRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    const cleanupPlayers = () => {
        if (playerRef.current) {
            playerRef.current.destroy();
            playerRef.current = null;
        }
        if (jwPlayerRef.current) {
            jwPlayerRef.current.remove();
            jwPlayerRef.current = null;
        }
    };

    const loadChannel = async () => {
      cleanupPlayers();
      
      if (!channel) {
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      setShowStreamSelector(false);
      setCurrentEmbedUrl('');

      if (channel.type === 'youtube') {
        if (channel.hasMultipleStreams && channel.youtubeChannelId) {
          setShowStreamSelector(true);
        } else {
          setCurrentEmbedUrl(channel.embedUrl || '');
        }
        setIsLoading(false);
        return;
      }
      
      const isM3u8 = channel.manifestUri?.includes('.m3u8');

      if (isM3u8 && window.jwplayer && jwPlayerContainerRef.current) {
        try {
          const player = window.jwplayer(jwPlayerContainerRef.current.id).setup({
            file: channel.manifestUri,
            width: '100%',
            height: '100%',
            autostart: true,
          });
          jwPlayerRef.current = player;
          player.on('ready', () => setIsLoading(false));
          player.on('error', (e: any) => setError(`Player Error: ${e.message}`));
        } catch (err) {
          setError(`Failed to load ${channel.name}`);
        }
      } 
      else if (videoRef.current && containerRef.current) {
        try {
          const player = new window.shaka.Player(videoRef.current);
          playerRef.current = player;

          const ui = new window.shaka.ui.Overlay(player, containerRef.current, videoRef.current);
          ui.configure({ addBigPlayButton: true });

          player.addEventListener('error', (event: any) => {
            console.error('Shaka Player Error:', event.detail);
            setError(`Player Error: ${event.detail.message || 'Unknown error'}`);
          });

          if (channel.clearKey) {
            player.configure({ drm: { clearKeys: channel.clearKey } });
          }

          await player.load(channel.manifestUri);
          
          // PAGBABAGO: Ibinalik ang logic para sa pag-detect at pag-enable ng captions
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

  const isShaka = channel.type === 'mpd' || (channel.type === 'hls' && !channel.manifestUri?.includes('.m3u8'));
  const isJWP = channel.type === 'hls' && channel.manifestUri?.includes('.m3u8');
  const isYoutube = channel.type === 'youtube';

  return (
    <Card className="bg-gradient-card shadow-elegant border-primary/20 overflow-hidden w-full">
      <div className="relative bg-black w-full aspect-video">
        {/* Shaka Player Container */}
        <div 
          ref={containerRef}
          className={`relative w-full h-full ${isShaka ? 'block' : 'hidden'}`}
          style={{ '--shaka-primary-color': 'hsl(var(--primary))' } as any}
        >
          <video
            ref={videoRef}
            className="w-full h-full"
            poster=""
          />
        </div>

        {/* JW Player Container */}
        <div 
            ref={jwPlayerContainerRef}
            id={`jwplayer-container-${Date.now()}`}
            className={`w-full h-full ${isJWP ? 'block' : 'hidden'}`}
        />

        {/* YouTube Player Container */}
        {isYoutube && (
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
        )}

        {/* Loading and Error Overlays */}
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

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose} 
          className="absolute top-4 right-4 text-white hover:bg-white/20 z-30"
        >
          ✕
        </Button>
        {isYoutube && channel.hasMultipleStreams && channel.youtubeChannelId && !showStreamSelector && (
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
