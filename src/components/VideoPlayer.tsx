import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  Settings,
  ArrowLeft,
  List
} from "lucide-react";
import { Card } from './ui/card';
import { Channel } from '@/data/channels';
import { StreamSelector } from './StreamSelector';

// Declare shaka as global variable (loaded in index.html)
declare global {
  interface Window {
    shaka: any;
  }
}

interface VideoPlayerProps {
  channel: Channel | null;
  onClose: () => void;
}

type ShakaPlayer = {
  configure(config: any): void;
  load(uri: string): Promise<void>;
  destroy(): Promise<void>;
  addEventListener(type: string, listener: (event: any) => void): void;
  removeEventListener(type: string, listener: (event: any) => void): void;
  getNetworkingEngine(): any;
  getTextTracks(): any[];
  setTextTrackVisibility(visible: boolean): void;
  selectTextTrack(track: any): void;
};

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStreamSelector, setShowStreamSelector] = useState(false);
  const [currentEmbedUrl, setCurrentEmbedUrl] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const shakaPlayerRef = useRef<ShakaPlayer | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    const playerContainer = containerRef.current;
    playerContainer?.addEventListener('mousemove', handleMouseMove);

    return () => {
      playerContainer?.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Check if URL is YouTube live
  const isYouTubeLive = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Initialize Shaka Player with clearkey support and HLS
  useEffect(() => {
    const loadChannel = async () => {
      // Clean up previous player instance
      if (shakaPlayerRef.current) {
        await shakaPlayerRef.current.destroy();
        shakaPlayerRef.current = null;
      }
      
      if (!channel) return;

      setIsLoading(true);
      setError(null);

      // Handle YouTube channels
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

      // Handle HLS/MPD streams
      setShowStreamSelector(false);
      if (!videoRef.current || !containerRef.current) return;

      try {
        // Ensure Shaka is available
        if (!window.shaka) {
          setError('Shaka Player not available');
          setIsLoading(false);
          return;
        }

        // Install polyfills
        window.shaka.polyfill.installAll();

        // Check browser support
        if (!window.shaka.Player.isBrowserSupported()) {
          setError("Browser does not support Shaka Player");
          setIsLoading(false);
          return;
        }

        const video = videoRef.current;
        const player = new window.shaka.Player(video);
        shakaPlayerRef.current = player;

        // Channel-specific DRM configurations
        const channelDrmConfigs: Record<string, any> = {
          "Jeepney TV": {
            drm: {
              clearKeys: {
                "90ea4079e02f418db7b170e8763e65f0": "1bfe2d166e31d03eee86ee568bd6c272"
              }
            }
          },
          "A2Z": {
            drm: {
              clearKeys: {
                "f703e4c8ec9041eeb5028ab4248fa094": "c22f2162e176eee6273a5d0b68d19530"
              }
            }
          },
          "ABC Australia": {
            drm: {
              clearKeys: {
                "389497f9f8584a57b234e27e430e04b7": "3b85594c7f88604adf004e45c03511c0"
              }
            }
          },
          "Animal Planet": {
            drm: {
              clearKeys: {
                "436b69f987924fcbbc06d40a69c2799a": "c63d5b0d7e52335b61aeba4f6537d54d"
              }
            }
          },
          "Animax": {
            drm: {
              clearKeys: {
                "92032b0e41a543fb9830751273b8debd": "03f8b65e2af785b10d6634735dbe6c11"
              }
            }
          },
          "Ani-One": {
            drm: {
              clearKeys: {
                "92032b0e41a543fb9830751273b8debd": "03f8b65e2af785b10d6634735dbe6c11"
              }
            }
          }
        };

        // Configure player with HLS support and DRM
        const config: any = {
          streaming: {
            retryParameters: {
              timeout: 30000,
              maxAttempts: 4,
              baseDelay: 1000,
              backoffFactor: 2,
              fuzzFactor: 0.5
            }
          },
          manifest: {
            hls: {
              useFullSegmentsForStartTime: true,
              ignoreManifestProgramDateTime: false
            }
          }
        };

        // Add DRM config if channel has it
        if (channel.name && channelDrmConfigs[channel.name]) {
          config.drm = channelDrmConfigs[channel.name].drm;
        } else if (channel.clearKey) {
          config.drm = { clearKeys: channel.clearKey };
        } else if (channel.widevineUrl) {
          config.drm = { servers: { 'com.widevine.alpha': channel.widevineUrl } };
        }

        player.configure(config);

        // Set up request filter for referer
        player.getNetworkingEngine().registerRequestFilter((type: any, request: any) => {
          request.headers['Referer'] = channel.referer || 'https://example.com';
        });

        // Set up event listeners
        const handleError = (event: any) => {
          console.error("Shaka Player error:", event);
          setIsLoading(false);
          setError(`Stream error: ${event.detail?.message || "Unable to load stream"}`);
        };

        const handleCanPlay = () => {
          setIsLoading(false);
          setError(null);
        };

        const handleTimeUpdate = () => {
          if (video.currentTime !== undefined && video.duration !== undefined) {
            setCurrentTime(video.currentTime);
            setDuration(video.duration);
          }
        };

        // Add event listeners
        player.addEventListener('error', handleError);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('play', () => setIsPlaying(true));
        video.addEventListener('pause', () => setIsPlaying(false));

        // Load the stream
        await player.load(channel.manifestUri);

        // Handle text tracks
        const textTracks = player.getTextTracks();
        const englishTrack = textTracks.find((track: any) => track.language === 'en');
        if (englishTrack) {
          player.setTextTrackVisibility(true);
          player.selectTextTrack(englishTrack);
        }
        
        setIsLoading(false);
        video.play();

      } catch (err) {
        console.error('Error loading channel:', err);
        setError(`Failed to load ${channel.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    loadChannel();
  }, [channel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (shakaPlayerRef.current) {
        shakaPlayerRef.current.destroy();
        shakaPlayerRef.current = null;
      }
    };
  }, []);

  const handleStreamSelect = (stream: any) => {
    setCurrentEmbedUrl(stream.embedUrl);
    setShowStreamSelector(false);
  };

  const togglePlay = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          await videoRef.current.play();
        }
      } catch (err) {
        console.error("Playback error:", err);
        setError("Playback failed. Please try again.");
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    try {
      if (!isFullscreen && container) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const formatTime = (time: number) => {
    if (!isFinite(time) || time < 0) return "0:00";
    
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
      <div 
        ref={containerRef}
        className={`relative bg-black overflow-hidden group ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'rounded-lg w-full aspect-video'
        }`}
      >
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
          <>
            {/* Video Element */}
            <video
              ref={videoRef}
              className={`w-full object-cover ${isMobile ? 'h-[50vh]' : 'aspect-video'}`}
              crossOrigin="anonymous"
              playsInline
              muted={isMuted}
              onClick={togglePlay}
              controls={false}
              poster=""
            />

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p>Loading {channel.name}...</p>
                  {(channel.name === "Jeepney TV" || channel.name === "A2Z" || channel.name === "ABC Australia" || channel.name === "Animal Planet" || channel.name === "Animax" || channel.name === "Ani-One") && (
                    <p className="text-sm text-gray-300 mt-2">Initializing DRM protection...</p>
                  )}
                </div>
              </div>
            )}

            {/* Error Overlay */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center text-white max-w-md p-6">
                  <div className="text-red-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Stream Unavailable</h3>
                  <p className="text-sm text-gray-300 mb-4">{error}</p>
                  <Button 
                    variant="secondary" 
                    onClick={() => window.location.reload()}
                    className="mt-4"
                  >
                    Reload Player
                  </Button>
                </div>
              </div>
            )}

            {/* Video Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

            {/* Controls Overlay */}
            <div 
              className={`absolute inset-0 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Top Bar */}
              <div className={`absolute top-0 left-0 right-0 ${isMobile ? 'p-2' : 'p-4'} flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent`}>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size={isMobile ? "sm" : "sm"}
                    onClick={onClose}
                    className="text-white hover:bg-white/20"
                  >
                    <ArrowLeft className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  </Button>
                  <div>
                    <h2 className={`text-white font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>{channel.name}</h2>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className={`text-red-400 font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>LIVE</span>
                      {(channel.name === "Jeepney TV" || channel.name === "A2Z" || channel.name === "ABC Australia" || channel.name === "Animal Planet" || channel.name === "Animax" || channel.name === "Ani-One") && (
                        <span className={`text-green-400 ${isMobile ? 'text-xs' : 'text-xs'} ml-2`}>🔒 DRM</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {!isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                )}
              </div>

              {/* Center Play Button (when paused or error) */}
              {(!isPlaying && !isLoading && !error) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={togglePlay}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-6"
                  >
                    <Play className="h-12 w-12 fill-current" />
                  </Button>
                </div>
              )}

              {/* Bottom Controls */}
              {!error && (
                <div className={`absolute bottom-0 left-0 right-0 ${isMobile ? 'p-2' : 'p-4'} bg-gradient-to-t from-black/80 to-transparent`}>
                  {/* Progress Bar */}
                  <div className={`${isMobile ? 'mb-2' : 'mb-4'}`}>
                    <div className={`w-full bg-white/20 rounded-full ${isMobile ? 'h-1 mb-1' : 'h-1 mb-2'}`}>
                      <div 
                        className="bg-primary h-1 rounded-full transition-all duration-300"
                        style={{ 
                          width: duration && isFinite(duration) && duration > 0 
                            ? `${(currentTime / duration) * 100}%` 
                            : '0%' 
                        }}
                      />
                    </div>
                    <div className={`flex justify-between text-white ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      <span>{formatTime(currentTime)}</span>
                      <span>LIVE</span>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
                      <Button
                        variant="ghost"
                        size={isMobile ? "sm" : "sm"}
                        onClick={togglePlay}
                        className="text-white hover:bg-white/20"
                        disabled={isLoading}
                      >
                        {isPlaying ? (
                          <Pause className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                        ) : (
                          <Play className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} fill-current`} />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size={isMobile ? "sm" : "sm"}
                        onClick={toggleMute}
                        className="text-white hover:bg-white/20"
                        disabled={isLoading}
                      >
                        {isMuted ? (
                          <VolumeX className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                        ) : (
                          <Volume2 className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                        )}
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size={isMobile ? "sm" : "sm"}
                      onClick={toggleFullscreen}
                      className="text-white hover:bg-white/20"
                    >
                      {isFullscreen ? (
                        <Minimize className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                      ) : (
                        <Maximize className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Stream Selector Button for YouTube channels */}
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