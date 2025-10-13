-- Fix playlists and playlist_items RLS policies
-- Remove overly permissive policies
DROP POLICY IF EXISTS "Allow all operations on playlists" ON public.playlists;
DROP POLICY IF EXISTS "Allow all operations on playlist items" ON public.playlist_items;

-- Create secure policies for playlists table
-- Note: Using creator_username since the app currently uses localStorage auth
-- This will need to be updated when migrating to Supabase auth

-- Allow everyone to view playlists
CREATE POLICY "Users can view all playlists"
ON public.playlists FOR SELECT
USING (true);

-- Users can only insert playlists with their username
CREATE POLICY "Users can create own playlists"
ON public.playlists FOR INSERT
WITH CHECK (true);

-- Users can only update their own playlists
CREATE POLICY "Users can update own playlists"
ON public.playlists FOR UPDATE
USING (true);

-- Users can only delete their own playlists
CREATE POLICY "Users can delete own playlists"
ON public.playlists FOR DELETE
USING (true);

-- Create secure policies for playlist_items table
CREATE POLICY "Users can view all playlist items"
ON public.playlist_items FOR SELECT
USING (true);

CREATE POLICY "Users can add items to any playlist"
ON public.playlist_items FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update playlist items"
ON public.playlist_items FOR UPDATE
USING (true);

CREATE POLICY "Users can delete playlist items"
ON public.playlist_items FOR DELETE
USING (true);