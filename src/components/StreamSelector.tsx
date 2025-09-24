import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Users, Clock } from 'lucide-react';

interface LiveStream {
  id: string;
  title: string;
  thumbnailUrl: string;
  viewerCount?: string;
  isLive: boolean;
  embedUrl: string;
}

interface StreamSelectorProps {
  channelId: string;
  channelName: string;
  onStreamSelect: (stream: LiveStream) => void;
  onClose: () => void;
}

export const StreamSelector = ({ channelId, channelName, onStreamSelect, onClose }: StreamSelectorProps) => {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStreamId, setSelectedStreamId] = useState<string>('');

  useEffect(() => {
    // Simulate fetching live streams - in a real implementation, this would call YouTube Data API
    const fetchStreams = async () => {
      setIsLoading(true);
      try {
        // For now, we'll create mock streams to demonstrate the functionality
        // In a real implementation, you would fetch from YouTube Data API
        const mockStreams: LiveStream[] = [
          {
            id: `${channelId}_main`,
            title: `${channelName} - Main Stream`,
            thumbnailUrl: `https://img.youtube.com/vi/live/maxresdefault.jpg`,
            viewerCount: '12.5K',
            isLive: true,
            embedUrl: `https://www.youtube.com/embed/live_stream?channel=${channelId}`
          },
          {
            id: `${channelId}_alt1`,
            title: `${channelName} - Alternative Stream`,
            thumbnailUrl: `https://img.youtube.com/vi/live/maxresdefault.jpg`,
            viewerCount: '8.2K',
            isLive: true,
            embedUrl: `https://www.youtube.com/embed/live_stream?channel=${channelId}&stream=alt1`
          },
          {
            id: `${channelId}_special`,
            title: `${channelName} - Special Event`,
            thumbnailUrl: `https://img.youtube.com/vi/live/maxresdefault.jpg`,
            viewerCount: '15.7K',
            isLive: true,
            embedUrl: `https://www.youtube.com/embed/live_stream?channel=${channelId}&stream=special`
          }
        ];

        setStreams(mockStreams);
        if (mockStreams.length > 0) {
          setSelectedStreamId(mockStreams[0].id);
        }
      } catch (error) {
        console.error('Error fetching streams:', error);
        // Fallback to single stream
        const fallbackStream: LiveStream = {
          id: `${channelId}_default`,
          title: `${channelName} - Live Stream`,
          thumbnailUrl: `https://img.youtube.com/vi/live/maxresdefault.jpg`,
          isLive: true,
          embedUrl: `https://www.youtube.com/embed/live_stream?channel=${channelId}`
        };
        setStreams([fallbackStream]);
        setSelectedStreamId(fallbackStream.id);
      }
      setIsLoading(false);
    };

    fetchStreams();
  }, [channelId, channelName]);

  const handleStreamSelect = () => {
    const selectedStream = streams.find(stream => stream.id === selectedStreamId);
    if (selectedStream) {
      onStreamSelect(selectedStream);
    }
  };

  const selectedStream = streams.find(stream => stream.id === selectedStreamId);

  return (
    <Card className="bg-gradient-card border-primary/20 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-foreground">
          <Play className="w-5 h-5 text-accent" />
          Select Live Stream
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Multiple live streams detected for {channelName}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <span className="ml-3 text-muted-foreground">Loading streams...</span>
          </div>
        ) : (
          <>
            {/* Stream Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Available Streams:</label>
              <Select value={selectedStreamId} onValueChange={setSelectedStreamId}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {streams.map((stream) => (
                    <SelectItem key={stream.id} value={stream.id}>
                      <div className="flex items-center gap-2">
                        <span>{stream.title}</span>
                        {stream.isLive && (
                          <Badge variant="secondary" className="bg-red-500/20 text-red-400 text-xs">
                            LIVE
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stream Preview */}
            {selectedStream && (
              <div className="bg-muted/10 rounded-lg p-4 border border-border/30">
                <div className="flex items-start gap-3">
                  <img 
                    src={selectedStream.thumbnailUrl} 
                    alt={selectedStream.title}
                    className="w-24 h-18 object-cover rounded-md bg-muted"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMTIwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iOTAiIGZpbGw9IiMyMzIzMjMiLz48cGF0aCBkPSJNNDUgMzBWNjBMNzUgNDVMNDUgMzBaIiBmaWxsPSIjNjY2NjY2Ii8+PC9zdmc+';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground text-sm mb-1">
                      {selectedStream.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {selectedStream.isLive && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span>LIVE</span>
                        </div>
                      )}
                      {selectedStream.viewerCount && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{selectedStream.viewerCount} viewers</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                onClick={handleStreamSelect}
                disabled={!selectedStreamId}
                className="bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Watch Selected Stream
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="border-primary/20 hover:bg-primary/10"
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};