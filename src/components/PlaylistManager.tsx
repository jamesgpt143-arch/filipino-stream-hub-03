import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreatePlaylistDialog } from "./CreatePlaylistDialog";
import { VideoPlayer } from "./VideoPlayer";
import { Plus, Trash2, Play, List } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  creator_username: string;
  created_at: string;
}

interface PlaylistItem {
  id: string;
  channel_name: string;
  channel_logo: string;
  channel_type: string;
  channel_data: any;
  position: number;
}

interface PlaylistManagerProps {
  username: string;
  currentUsername: string;
  isAdmin: boolean;
}

export const PlaylistManager = ({ username, currentUsername, isAdmin }: PlaylistManagerProps) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [playlistItems, setPlaylistItems] = useState<PlaylistItem[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deletePlaylistId, setDeletePlaylistId] = useState<string | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  useEffect(() => {
    if (selectedPlaylist) {
      fetchPlaylistItems(selectedPlaylist);
    }
  }, [selectedPlaylist]);

  const fetchPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("creator_username", username)
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

  const fetchPlaylistItems = async (playlistId: string) => {
    try {
      const { data, error } = await supabase
        .from("playlist_items")
        .select("*")
        .eq("playlist_id", playlistId)
        .order("position", { ascending: true });

      if (error) throw error;
      setPlaylistItems(data || []);
    } catch (error) {
      console.error("Error fetching playlist items:", error);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!deletePlaylistId) return;

    try {
      const { error } = await supabase
        .from("playlists")
        .delete()
        .eq("id", deletePlaylistId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Playlist deleted successfully",
      });

      if (selectedPlaylist === deletePlaylistId) {
        setSelectedPlaylist(null);
        setPlaylistItems([]);
      }

      fetchPlaylists();
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast({
        title: "Error",
        description: "Failed to delete playlist",
        variant: "destructive",
      });
    } finally {
      setDeletePlaylistId(null);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItemId) return;

    try {
      const { error } = await supabase
        .from("playlist_items")
        .delete()
        .eq("id", deleteItemId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Channel removed from playlist",
      });

      if (selectedPlaylist) {
        fetchPlaylistItems(selectedPlaylist);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to remove channel",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const canDeletePlaylist = (playlist: Playlist) => {
    return playlist.creator_username === currentUsername || isAdmin;
  };

  const handlePlayChannel = (channel: any) => {
    setSelectedChannel(channel);
    setShowPlayer(true);
  };

  return (
    <div className="space-y-6">
      {showPlayer && selectedChannel && (
        <VideoPlayer
          channel={selectedChannel}
          onClose={() => {
            setShowPlayer(false);
            setSelectedChannel(null);
          }}
        />
      )}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Playlists
              </CardTitle>
              <CardDescription>Organize your favorite channels</CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Playlist
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {playlists.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No playlists yet. Create one to get started!
              </div>
            ) : (
              <div className="space-y-2">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedPlaylist === playlist.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedPlaylist(playlist.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{playlist.name}</h4>
                        {playlist.description && (
                          <p className="text-sm text-muted-foreground">{playlist.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          By {playlist.creator_username}
                        </p>
                      </div>
                      {canDeletePlaylist(playlist) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletePlaylistId(playlist.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedPlaylist && (
        <Card>
          <CardHeader>
            <CardTitle>Playlist Channels</CardTitle>
            <CardDescription>
              {playlistItems.length} channel{playlistItems.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {playlistItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No channels in this playlist yet
                </div>
              ) : (
                <div className="space-y-2">
                  {playlistItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <img
                        src={item.channel_logo}
                        alt={item.channel_name}
                        className="w-16 h-16 object-contain rounded"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium">{item.channel_name}</h5>
                        <p className="text-xs text-muted-foreground">
                          {item.channel_type === "iptv" ? "IPTV Channel" : "Custom Channel"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handlePlayChannel(item.channel_data)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteItemId(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <CreatePlaylistDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onPlaylistCreated={fetchPlaylists}
        username={username}
      />

      <AlertDialog open={!!deletePlaylistId} onOpenChange={() => setDeletePlaylistId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playlist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this playlist? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlaylist}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Channel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this channel from the playlist?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
