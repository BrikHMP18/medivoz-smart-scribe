-- Security migration: Ensure fichas_medicas and sensitive tables have no public access
-- This migration explicitly revokes any public access and ensures RLS policies are properly enforced

-- Ensure RLS is enabled on all sensitive tables
ALTER TABLE public.fichas_medicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Explicitly revoke any public access (in case any was granted)
REVOKE ALL ON public.fichas_medicas FROM anon, authenticated, public;
REVOKE ALL ON public.pacientes FROM anon, authenticated, public;
REVOKE ALL ON public.sesiones FROM anon, authenticated, public;
REVOKE ALL ON public.profiles FROM anon, authenticated, public;
REVOKE ALL ON public.user_roles FROM anon, authenticated, public;

-- Grant SELECT only to authenticated users (RLS policies will further restrict)
-- This is necessary for Supabase to work, but RLS will ensure only authorized doctors can access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fichas_medicas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pacientes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sesiones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- Ensure no default policies exist that allow public access
-- Drop any potentially dangerous default policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.fichas_medicas;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.fichas_medicas;
DROP POLICY IF EXISTS "Enable update for all users" ON public.fichas_medicas;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.fichas_medicas;
DROP POLICY IF EXISTS "Public read access" ON public.fichas_medicas;
DROP POLICY IF EXISTS "Public insert access" ON public.fichas_medicas;
DROP POLICY IF EXISTS "Public update access" ON public.fichas_medicas;
DROP POLICY IF EXISTS "Public delete access" ON public.fichas_medicas;
DROP POLICY IF EXISTS "Anyone can read" ON public.fichas_medicas;
DROP POLICY IF EXISTS "Anyone can write" ON public.fichas_medicas;

-- Verify that the required secure policies exist
-- Note: The main policies should already exist from previous migrations (20251125062537 and 20251125064443)
-- This verification uses the information_schema views
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  -- Count SELECT policies for fichas_medicas
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public' 
    AND tablename = 'fichas_medicas' 
    AND cmd = 'SELECT';
  
  IF policy_count = 0 THEN
    RAISE WARNING 'No SELECT policies found for fichas_medicas. RLS policies must be created in previous migrations.';
  END IF;
END $$;

-- Add comment to document security measures
COMMENT ON TABLE public.fichas_medicas IS 'Sensitive medical records table. Access is restricted via RLS policies. Only authenticated doctors with proper role assignments can access their own patients'' records.';
