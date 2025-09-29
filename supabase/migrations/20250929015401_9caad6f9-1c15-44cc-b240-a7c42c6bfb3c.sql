-- Allow everyone to view custom channels (make them public)
DROP POLICY IF EXISTS "Users can view their own custom channels" ON public.custom_channels;

CREATE POLICY "Everyone can view custom channels" 
ON public.custom_channels 
FOR SELECT 
USING (true);