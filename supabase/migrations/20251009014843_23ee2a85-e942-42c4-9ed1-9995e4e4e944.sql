-- Update RLS policies for playlists table
DROP POLICY IF EXISTS "Everyone can view playlists" ON public.playlists;
DROP POLICY IF EXISTS "Anyone can create playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can update their own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can delete their own playlists" ON public.playlists;

CREATE POLICY "Users can view their own playlists"
ON public.playlists
FOR SELECT
USING (creator_username = current_setting('request.jwt.claims', true)::json->>'username');

CREATE POLICY "Anyone can create playlists"
ON public.playlists
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own playlists"
ON public.playlists
FOR UPDATE
USING (creator_username = current_setting('request.jwt.claims', true)::json->>'username');

CREATE POLICY "Users can delete their own playlists"
ON public.playlists
FOR DELETE
USING (creator_username = current_setting('request.jwt.claims', true)::json->>'username');

-- Update RLS policies for playlist_items table
DROP POLICY IF EXISTS "Everyone can view playlist items" ON public.playlist_items;
DROP POLICY IF EXISTS "Anyone can add items to playlists" ON public.playlist_items;
DROP POLICY IF EXISTS "Anyone can update playlist items" ON public.playlist_items;
DROP POLICY IF EXISTS "Anyone can delete playlist items" ON public.playlist_items;

CREATE POLICY "Users can view their own playlist items"
ON public.playlist_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_items.playlist_id
    AND playlists.creator_username = current_setting('request.jwt.claims', true)::json->>'username'
  )
);

CREATE POLICY "Users can add items to their own playlists"
ON public.playlist_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_items.playlist_id
    AND playlists.creator_username = current_setting('request.jwt.claims', true)::json->>'username'
  )
);

CREATE POLICY "Users can update items in their own playlists"
ON public.playlist_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_items.playlist_id
    AND playlists.creator_username = current_setting('request.jwt.claims', true)::json->>'username'
  )
);

CREATE POLICY "Users can delete items from their own playlists"
ON public.playlist_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_items.playlist_id
    AND playlists.creator_username = current_setting('request.jwt.claims', true)::json->>'username'
  )
);