-- Fix RLS policies to work with client-side filtering
-- Since authentication is handled by Firebase, we'll make policies permissive
-- and rely on application-level security

DROP POLICY IF EXISTS "Users can view their own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Anyone can create playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can update their own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can delete their own playlists" ON public.playlists;

DROP POLICY IF EXISTS "Users can view their own playlist items" ON public.playlist_items;
DROP POLICY IF EXISTS "Users can add items to their own playlists" ON public.playlist_items;
DROP POLICY IF EXISTS "Users can update items in their own playlists" ON public.playlist_items;
DROP POLICY IF EXISTS "Users can delete items from their own playlists" ON public.playlist_items;

-- Allow all operations on playlists (filtering will be done in application)
CREATE POLICY "Allow all operations on playlists"
ON public.playlists
FOR ALL
USING (true)
WITH CHECK (true);

-- Allow all operations on playlist items
CREATE POLICY "Allow all operations on playlist items"
ON public.playlist_items
FOR ALL
USING (true)
WITH CHECK (true);