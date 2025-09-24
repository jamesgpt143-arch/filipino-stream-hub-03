import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { List } from 'lucide-react';
import { Card } from './ui/card';
import { Channel } from '@/data/channels';
import { StreamSelector } from './StreamSelector';

// Declare shaka as a global variable (loaded via script tag)
declare global {
  interface Window {
    shaka: any;
  }
}

interface VideoPlayerProps {
  channel: Channel | null;
  onClose: () => void;
}

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
    // Load Shaka Player script dynamically with UI
    const loadShaka = async () => {
      if (!window.shaka) {
        const script = document.createElement('script');
        script.src = 'https://ajax.googleapis.com/ajax/libs/shaka-player/4.3.6/shaka-player.ui.js';
        script.onload = () => {
          if (window.shaka) {
            window.shaka.polyfill.installAll();
            if (!window.shaka.Player.isBrowserSupported()) {
              setError('Browser not supported');
            }
          }
        };
        document.head.appendChild(script);
        
        // Load Shaka UI CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://ajax.googleapis.com/ajax/libs/shaka-player/4.3.6/controls.css';
        document.head.appendChild(link);
      } else {
        window.shaka.polyfill.installAll();
        if (!window.shaka.Player.isBrowserSupported()) {
          setError('Browser not supported');
        }
      }
    };

    loadShaka();

    return () => {
      if (uiRef.current) {
        uiRef.current.destroy();
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!channel || !videoRef.current || !containerRef.current) return;

    const loadChannel = async () => {
      if (!videoRef.current || !containerRef.current) return;
      
      setIsLoading(true);
      setError(null);

      try {
        // Always clean up previous player and UI first
        if (uiRef.current) {
          await uiRef.current.destroy();
          uiRef.current = null;
        }
        if (playerRef.current) {
          await playerRef.current.destroy();
          playerRef.current = null;
        }

        // Stop and clear video element
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.src = '';
          videoRef.current.load(); // This clears the video completely
        }

        if (channel.type === 'youtube') {
          if (channel.hasMultipleStreams && channel.youtubeChannelId) {
            setShowStreamSelector(true);
          } else {
            setCurrentEmbedUrl(channel.embedUrl || '');
          }
          setIsLoading(false);
          return;
        }

        if (!window.shaka) {
          setError('Shaka Player not loaded');
          setIsLoading(false);
          return;
        }

        // Create player and UI
        const player = new window.shaka.Player(videoRef.current);
        playerRef.current = player;

        // Initialize UI
        const ui = new window.shaka.ui.Overlay(player, containerRef.current, videoRef.current);
        uiRef.current = ui;

        // Configure UI
        const config = {
          addBigPlayButton: true,
          addSeekBar: true,
          controlPanelElements: [
            'play_pause',
            'time_and_duration', 
            'spacer',
            'mute',
            'volume',
            'captions',
            'quality',
            'fullscreen'
          ],
          enableTooltips: true
        };
        ui.configure(config);

        // Set up error handling
        player.addEventListener('error', (event: any) => {
          console.error('Shaka Player Error:', event.detail);
          setError(`Player Error: ${event.detail.message || 'Unknown error'}`);
        });

        // Custom request filter with referer
        player.getNetworkingEngine().registerRequestFilter((type, request) => {
          request.headers['Referer'] = channel.referer || 'https://example.com';
          request.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
        });

        // Configure DRM if needed
        if (channel.clearKey) {
          player.configure({ 
            drm: { 
              clearKeys: channel.clearKey 
            } 
          });
        } else if (channel.widevineUrl) {
          player.configure({ 
            drm: { 
              servers: { 
                'com.widevine.alpha': channel.widevineUrl 
              } 
            } 
          });
        }

        // Load the manifest
        await player.load(channel.manifestUri);
        
        // Auto-enable English captions if available
        const textTracks = player.getTextTracks();
        const englishTrack = textTracks.find((track: any) => 
          track.language === 'en' || 
          track.language === 'eng' || 
          track.language.startsWith('en-') ||
          track.label?.toLowerCase().includes('english')
        );
        
        if (englishTrack) {
          player.selectTextTrack(englishTrack);
          player.setTextTrackVisibility(true);
        }
        
        setIsLoading(false);
        
        // Auto-play
        if (videoRef.current) {
          videoRef.current.play();
        }

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

  const handleShowStreamSelector = () => {
    if (channel?.youtubeChannelId) {
      setShowStreamSelector(true);
    }
  };

  if (showStreamSelector && channel?.youtubeChannelId) {
    return (
      <div className="w-full aspect-video">
        <StreamSelector
          channelId={channel.youtubeChannelId}
          channelName={channel.name}
          onStreamSelect={handleStreamSelect}
          onClose={() => setShowStreamSelector(false)}
        />
      </div>
    );
  }

  return (
    <Card className="bg-gradient-card shadow-elegant border-primary/20 overflow-hidden w-full">
      {!channel ? (
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
      ) : (
        <div className="relative bg-black w-full aspect-video">
          {channel.type === 'youtube' && (currentEmbedUrl || channel.embedUrl) ? (
            <div className="relative w-full h-full">
              <iframe
                src={`${currentEmbedUrl || channel.embedUrl}&autoplay=1&mute=0`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              {channel.hasMultipleStreams && channel.youtubeChannelId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShowStreamSelector}
                  className="absolute top-4 left-4 text-white bg-black/50 hover:bg-black/70 backdrop-blur-sm z-10"
                  title="Select different stream"
                >
                  <List className="w-4 h-4" />
                </Button>
              )}
            </div>
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
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center animate-fade-in z-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <p className="text-white text-sm">Loading {channel.name}...</p>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center animate-fade-in z-20">
                  <div className="text-center text-white p-6">
                    <div className="text-red-400 text-lg mb-2">⚠️</div>
                    <h3 className="text-lg font-semibold mb-2">Playback Error</h3>
                    <p className="text-sm text-gray-300">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {channel && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose} 
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-30"
            >
              ✕
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};