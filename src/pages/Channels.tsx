import { useState, useMemo, useEffect } from 'react';
import { ChannelGrid } from '@/components/ChannelGrid';
import { VideoPlayer } from '@/components/VideoPlayer';
import { channels, Channel } from '@/data/channels';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Eye, EyeOff } from 'lucide-react';

const Channels = () => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  const [customChannels, setCustomChannels] = useState<Channel[]>([]);
  const { toast } = useToast();

  // Load custom channels from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('customChannels');
      if (saved) {
        setCustomChannels(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading custom channels:', error);
    }
  }, []);

  // Combine static and custom channels
  const allChannels = useMemo(() => {
    return [...channels, ...customChannels];
  }, [customChannels]);

  const filteredChannels = useMemo(() => {
    return allChannels.filter(channel => {
      const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase());
      const isHidden = hiddenChannels.has(channel.name);
      
      if (showHidden) {
        return matchesSearch && isHidden;
      } else {
        return matchesSearch && !isHidden;
      }
    });
  }, [searchTerm, hiddenChannels, showHidden, allChannels]);

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    toast({
      title: "Loading Channel",
      description: `Starting ${channel.name}...`,
    });
  };

  const handleClosePlayer = () => {
    setSelectedChannel(null);
  };

  const handleToggleHide = (channelName: string) => {
    const newHiddenChannels = new Set(hiddenChannels);
    if (newHiddenChannels.has(channelName)) {
      newHiddenChannels.delete(channelName);
      toast({
        title: "Channel Shown",
        description: `${channelName} is now visible`,
      });
    } else {
      newHiddenChannels.add(channelName);
      toast({
        title: "Channel Hidden",
        description: `${channelName} has been hidden`,
      });
    }
    setHiddenChannels(newHiddenChannels);
  };

  const handleDeleteChannel = (channelName: string) => {
    try {
      const updatedCustomChannels = customChannels.filter(channel => channel.name !== channelName);
      localStorage.setItem('customChannels', JSON.stringify(updatedCustomChannels));
      setCustomChannels(updatedCustomChannels);
      
      // Also remove from hidden channels if it was hidden
      if (hiddenChannels.has(channelName)) {
        const newHiddenChannels = new Set(hiddenChannels);
        newHiddenChannels.delete(channelName);
        setHiddenChannels(newHiddenChannels);
      }
      
      toast({
        title: "Channel Deleted",
        description: `${channelName} has been removed from your channels`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete channel. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Search and Filter Section */}
      <div className="bg-card border-b border-border p-4">
        <div className="container mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Hide/Show Toggle */}
            <Button
              variant={showHidden ? "default" : "outline"}
              onClick={() => setShowHidden(!showHidden)}
              className="flex items-center gap-2"
            >
              {showHidden ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Hidden Channels ({hiddenChannels.size})
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  All Channels
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-200px)]">
          {/* Video Player */}
          <div className="w-full lg:w-2/3 flex-shrink-0">
            <div className="sticky top-6">
              <VideoPlayer
                channel={selectedChannel}
                onClose={handleClosePlayer}
              />
            </div>
          </div>

          {/* Channel List */}
          <div className="w-full lg:w-1/3 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  All Channels
                </h2>
                <p className="text-sm text-muted-foreground">
                  {filteredChannels.length} channel{filteredChannels.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
              <ChannelGrid
                channels={filteredChannels}
                onChannelSelect={handleChannelSelect}
                onToggleHide={handleToggleHide}
                onDelete={handleDeleteChannel}
                hiddenChannels={hiddenChannels}
                customChannels={customChannels}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            flameiptv
          </p>
          <div className="mt-3 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
            <p className="text-sm font-medium text-primary">💰 GCASH: 09310799262</p>
            <p className="text-xs text-muted-foreground mt-1">Support the stream</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Channels;