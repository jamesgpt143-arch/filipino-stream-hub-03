import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface Playlist {
  id: string;
  name: string;
  description: string | null;
}

interface AddToPlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: any;
  channelType: 'iptv' | 'custom';
}

export const AddToPlaylistDialog = ({ open, onOpenChange, channel, channelType }: AddToPlaylistDialogProps) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPlaylists();
    }
  }, [open]);

  const fetchPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlaylists(data || []);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      toast({
        title: "Error",
        description: "Failed to load playlists",
        variant: "destructive",
      });
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    setIsLoading(true);

    try {
      // Get current max position
      const { data: existingItems } = await supabase
        .from("playlist_items")
        .select("position")
        .eq("playlist_id", playlistId)
        .order("position", { ascending: false })
        .limit(1);

      const newPosition = existingItems && existingItems.length > 0 
        ? existingItems[0].position + 1 
        : 0;

      // Add channel to playlist
      const { error } = await supabase
        .from("playlist_items")
        .insert({
          playlist_id: playlistId,
          channel_name: channel.name,
          channel_logo: channel.logo,
          channel_type: channelType,
          channel_data: channel,
          position: newPosition,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already in playlist",
            description: "This channel is already in the selected playlist",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Channel added to playlist",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error adding to playlist:", error);
      toast({
        title: "Error",
        description: "Failed to add channel to playlist",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
          <DialogDescription>
            Select a playlist to add "{channel?.name}"
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] pr-4">
          {playlists.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No playlists found. Create one first!
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <Button
                  key={playlist.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  disabled={isLoading}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <div className="text-left flex-1">
                    <div className="font-medium">{playlist.name}</div>
                    {playlist.description && (
                      <div className="text-xs text-muted-foreground">{playlist.description}</div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
