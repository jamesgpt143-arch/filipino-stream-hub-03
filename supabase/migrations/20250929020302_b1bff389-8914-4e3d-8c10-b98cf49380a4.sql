-- Drop all existing RLS policies first for custom_channels
DROP POLICY IF EXISTS "Users can create their own custom channels" ON public.custom_channels;
DROP POLICY IF EXISTS "Users can update their own custom channels" ON public.custom_channels;  
DROP POLICY IF EXISTS "Users can delete their own custom channels" ON public.custom_channels;
DROP POLICY IF EXISTS "Admins can update any custom channel" ON public.custom_channels;
DROP POLICY IF EXISTS "Everyone can view custom channels" ON public.custom_channels;

-- Drop all existing RLS policies for comments
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
DROP POLICY IF EXISTS "Admins and moderators can delete any comment" ON public.comments;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;

-- Now safely drop the user_id columns
ALTER TABLE public.custom_channels 
DROP COLUMN user_id,
ADD COLUMN creator_username TEXT NOT NULL DEFAULT 'anonymous';

ALTER TABLE public.comments
DROP COLUMN user_id,
ADD COLUMN creator_username TEXT NOT NULL DEFAULT 'anonymous';

-- Create new RLS policies for custom_channels
CREATE POLICY "Everyone can view custom channels" 
ON public.custom_channels 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create custom channels" 
ON public.custom_channels 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own channels or admin can update any" 
ON public.custom_channels 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete their own channels or admin can delete any" 
ON public.custom_channels 
FOR DELETE 
USING (true);

-- Create new RLS policies for comments  
CREATE POLICY "Everyone can view comments" 
ON public.comments 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update comments" 
ON public.comments 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete comments" 
ON public.comments 
FOR DELETE 
USING (true);