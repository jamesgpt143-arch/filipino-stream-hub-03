-- Add reply functionality to comments table
ALTER TABLE public.comments 
ADD COLUMN reply_to uuid REFERENCES public.comments(id) ON DELETE CASCADE;

-- Create index for better performance when fetching replies
CREATE INDEX idx_comments_reply_to ON public.comments(reply_to);

-- Update RLS policies to allow users to delete their own comments
-- (This policy already exists, just ensuring it's correct)
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

CREATE POLICY "Users can delete their own comments" 
ON public.comments 
FOR DELETE 
USING (auth.uid() = user_id);