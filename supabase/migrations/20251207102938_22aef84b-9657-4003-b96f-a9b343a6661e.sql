-- Add widevine_url column to custom_channels table for Widevine DRM support
ALTER TABLE public.custom_channels 
ADD COLUMN widevine_url text DEFAULT NULL;