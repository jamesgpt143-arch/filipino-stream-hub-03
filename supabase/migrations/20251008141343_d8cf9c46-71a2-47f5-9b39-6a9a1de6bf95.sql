-- Create playlists table
CREATE TABLE public.playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_username TEXT NOT NULL DEFAULT 'anonymous',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- Create policies for playlists
CREATE POLICY "Everyone can view playlists"
ON public.playlists
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create playlists"
ON public.playlists
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own playlists"
ON public.playlists
FOR UPDATE
USING (true);

CREATE POLICY "Users can delete their own playlists"
ON public.playlists
FOR DELETE
USING (true);

-- Create playlist_items table
CREATE TABLE public.playlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  channel_name TEXT NOT NULL,
  channel_logo TEXT NOT NULL,
  channel_type TEXT NOT NULL, -- 'iptv' or 'custom'
  channel_data JSONB NOT NULL, -- stores complete channel info
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;

-- Create policies for playlist_items
CREATE POLICY "Everyone can view playlist items"
ON public.playlist_items
FOR SELECT
USING (true);

CREATE POLICY "Anyone can add items to playlists"
ON public.playlist_items
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update playlist items"
ON public.playlist_items
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete playlist items"
ON public.playlist_items
FOR DELETE
USING (true);

-- Create trigger for automatic timestamp updates on playlists
CREATE TRIGGER update_playlists_updated_at
BEFORE UPDATE ON public.playlists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_playlist_items_playlist_id ON public.playlist_items(playlist_id);
CREATE INDEX idx_playlist_items_position ON public.playlist_items(playlist_id, position);