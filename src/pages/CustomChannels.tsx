import { useState, useMemo, useEffect } from 'react';
import { ChannelGrid } from '@/components/ChannelGrid';
import { VideoPlayer } from '@/components/VideoPlayer';
import { AddChannelForm } from '@/components/AddChannelForm';
import { Channel } from '@/data/channels';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Eye, EyeOff, Plus } from 'lucide-react';
import { DonateButton } from '@/components/DonateButton';
import { UserStats } from '@/components/UserStats';
import { supabase } from '@/integrations/supabase/client';

const CustomChannels = () => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  const [customChannels, setCustomChannels] = useState<Channel[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  // Load custom channels from Supabase on mount
  useEffect(() => {
    const loadChannels = async () => {
      try {
        const { data, error } = await supabase
          .from('custom_channels')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading custom channels:', error);
          toast({
            title: "Error",
            description: "Failed to load channels. Please refresh the page.",
            variant: "destructive"
          });
          return;
        }

        // Convert Supabase data to Channel format
        const channels: Channel[] = data.map(channel => ({
          name: channel.name,
          manifestUri: channel.manifest_uri,
          type: channel.type as 'mpd' | 'hls' | 'youtube',
          logo: channel.logo,
          category: channel.category || 'Custom',
          creatorUsername: channel.creator_username,
          ...(channel.clear_key ? { clearKey: channel.clear_key as Record<string, string> } : {}),
          ...((channel as any).widevine_url ? { widevineUrl: (channel as any).widevine_url } : {}),
          ...(channel.embed_url ? { embedUrl: channel.embed_url } : {}),
          ...(channel.youtube_channel_id ? { youtubeChannelId: channel.youtube_channel_id } : {}),
          ...(channel.has_multiple_streams !== null ? { hasMultipleStreams: channel.has_multiple_streams } : {})
        }));

        setCustomChannels(channels);
      } catch (error) {
        console.error('Error loading custom channels:', error);
        toast({
          title: "Error", 
          description: "Failed to load channels. Please try again.",
          variant: "destructive"
        });
      }
    };

    loadChannels();
  }, [toast]);

  const filteredChannels = useMemo(() => {
    return customChannels.filter(channel => {
      const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase());
      const isHidden = hiddenChannels.has(channel.name);
      
      if (showHidden) {
        return matchesSearch && isHidden;
      } else {
        return matchesSearch && !isHidden;
      }
    });
  }, [searchTerm, hiddenChannels, showHidden, customChannels]);

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

  const handleDeleteChannel = async (channelName: string) => {
    // 1. ASK FOR CONFIRMATION
    if (!window.confirm(`Are you sure you want to delete ${channelName}?`)) {
        return;
    }

    // 2. ASK FOR PASSWORD (SECURITY CHECK)
    const password = window.prompt("Enter Admin Password to delete:");
    if (password !== "darman18") {
        toast({
            title: "Access Denied",
            description: "Incorrect password. Deletion cancelled.",
            variant: "destructive"
        });
        return;
    }

    // 3. PROCEED WITH DELETION IF PASSWORD IS CORRECT
    try {
      const { error } = await supabase
        .from('custom_channels')
        .delete()
        .eq('name', channelName);

      if (error) {
        console.error('Error deleting channel:', error);
        toast({
          title: "Error",
          description: "Failed to delete channel. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Update local state
      const updatedCustomChannels = customChannels.filter(channel => channel.name !== channelName);
      setCustomChannels(updatedCustomChannels);
      
      // Also remove from hidden channels if it was hidden
      if (hiddenChannels.has(channelName)) {
        const newHiddenChannels = new Set(hiddenChannels);
        newHiddenChannels.delete(channelName);
        setHiddenChannels(newHiddenChannels);
      }
      
      toast({
        title: "Channel Deleted",
        description: `${channelName} has been removed successfully.`,
      });
    } catch (error) {
      console.error('Error deleting channel:', error);
      toast({
        title: "Error",
        description: "Failed to delete channel. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleChannelAdded = async () => {
    // Reload custom channels from Supabase
    try {
      const { data, error } = await supabase
        .from('custom_channels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error reloading custom channels:', error);
        return;
      }

      // Convert Supabase data to Channel format
      const channels: Channel[] = data.map(channel => ({
        name: channel.name,
        manifestUri: channel.manifest_uri,
        type: channel.type as 'mpd' | 'hls' | 'youtube',
        logo: channel.logo,
        category: channel.category || 'Custom',
        creatorUsername: channel.creator_username,
        ...(channel.clear_key ? { clearKey: channel.clear_key as Record<string, string> } : {}),
        ...((channel as any).widevine_url ? { widevineUrl: (channel as any).widevine_url } : {}),
        ...(channel.embed_url ? { embedUrl: channel.embed_url } : {}),
        ...(channel.youtube_channel_id ? { youtubeChannelId: channel.youtube_channel_id } : {}),
        ...(channel.has_multiple_streams !== null ? { hasMultipleStreams: channel.has_multiple_streams } : {})
      }));

      setCustomChannels(channels);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error reloading custom channels:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-card border-b border-border p-4">
        <div className="container mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Custom Channels</h1>
              <p className="text-muted-foreground">Add and manage your own streaming channels</p>
            </div>
            
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Channel
            </Button>
          </div>

          {showAddForm && (
            <div className="mt-4">
              <AddChannelForm onChannelAdded={handleChannelAdded} username="Anonymous" />
            </div>
          )}

          {customChannels.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search custom channels..."
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
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        {customChannels.length === 0 ? (
              <div className="text-center py-12">
                <Card className="max-w-md mx-auto">
                  <CardHeader>
                    <CardTitle>No Custom Channels Yet</CardTitle>
                    <CardDescription>
                      Add your first custom channel to get started watching your favorite streams.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => setShowAddForm(true)}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Channel
                    </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
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
                        Your Channels
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
                      // 👇 Pinapanatili natin ito para makita ang button, pero may password check na sa loob ng handleDeleteChannel
                      isAdmin={true} 
                      currentUsername="Anonymous"
                    />
                </div>
              </div>
            </div>
          )}
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
      <UserStats pagePath="/custom-channels" />
    </div>
  );
};

export default CustomChannels;
