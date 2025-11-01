import { useState, useMemo } from 'react';
import { ChannelGrid } from '@/components/ChannelGrid';
import { VideoPlayer } from '@/components/VideoPlayer';
import { channels, Channel } from '@/data/channels';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Eye, EyeOff } from 'lucide-react';
import { DonateButton } from '@/components/DonateButton';
import { UserStats } from '@/components/UserStats';

const Channels = () => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  const { toast } = useToast();

  // Only show static IPTV channels
  const allChannels = useMemo(() => {
    return channels;
  }, []);

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
    // This function is not used for IPTV channels as they cannot be deleted
    console.log('Delete not available for IPTV channels:', channelName);
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
                  IPTV Channels
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
                  customChannels={[]}
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
          <div className="mt-3">
            <DonateButton />
          </div>
        </div>
      </footer>
      <UserStats pagePath="/channels" />
    </div>
  );
};

export default Channels;