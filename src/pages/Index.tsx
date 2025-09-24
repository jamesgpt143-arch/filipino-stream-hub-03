import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { ChannelGrid } from '@/components/ChannelGrid';
import { VideoPlayer } from '@/components/VideoPlayer';
import { channels, Channel } from '@/data/channels';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { toast } = useToast();

  const filteredChannels = useMemo(() => {
    return channels.filter(channel => {
      const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || channel.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

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

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

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
                  {selectedCategory === 'All' ? 'All Channels' : selectedCategory}
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
          <p className="text-xs text-muted-foreground mt-2">
            Powered by Shaka Player | Built with React & TypeScript
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
