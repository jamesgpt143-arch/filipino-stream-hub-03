-- Insert admin user role for jamesbenavides617@gmail.com
-- First we need to find or create the user with that email
-- Since we can't directly insert into auth.users, we'll create a function that will be called when that user signs up

-- Create a function to automatically assign admin role to specific email
CREATE OR REPLACE FUNCTION public.handle_admin_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if the user's email is the admin email
  IF NEW.email = 'jamesbenavides617@gmail.com' THEN
    -- Insert admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to automatically assign admin role on signup
DROP TRIGGER IF EXISTS on_auth_user_admin_check ON auth.users;
CREATE TRIGGER on_auth_user_admin_check
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_admin_user();