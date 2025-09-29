-- Enable realtime for visits table
ALTER TABLE public.visits REPLICA IDENTITY FULL;

-- Add visits table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.visits;