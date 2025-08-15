-- Fix function search path mutable warning
-- Update handle_new_user function to have immutable search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, specialty)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'), 
    COALESCE(NEW.raw_user_meta_data->>'specialty', 'General')
  );
  RETURN NEW;
END;
$function$;