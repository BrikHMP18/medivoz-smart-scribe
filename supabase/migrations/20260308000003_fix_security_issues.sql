-- ============================================================
-- FIX: Conflicting Security Rules Could Block Legitimate Doctor Access
-- Remove the complex has_role() policies that conflict with simple ones.
-- The simple policies (auth.uid() = doctor_id) are correct and sufficient.
-- ============================================================

-- Drop conflicting SELECT policies on sesiones
DROP POLICY IF EXISTS "Doctors can view their own sessions" ON public.sesiones;
-- Drop conflicting INSERT policies on sesiones
DROP POLICY IF EXISTS "Doctors can create sessions" ON public.sesiones;
-- Drop conflicting UPDATE policies on sesiones
DROP POLICY IF EXISTS "Doctors can update their own sessions" ON public.sesiones;
-- Drop conflicting DELETE policies on sesiones
DROP POLICY IF EXISTS "Doctors can delete their own sessions" ON public.sesiones;

-- Drop conflicting SELECT policies on fichas_medicas
DROP POLICY IF EXISTS "Doctors can view their own medical records" ON public.fichas_medicas;
-- Drop conflicting INSERT policies on fichas_medicas
DROP POLICY IF EXISTS "Doctors can create medical records" ON public.fichas_medicas;
-- Drop conflicting UPDATE policies on fichas_medicas
DROP POLICY IF EXISTS "Doctors can update their own medical records" ON public.fichas_medicas;
-- Drop conflicting DELETE policies on fichas_medicas
DROP POLICY IF EXISTS "Doctors can delete their own medical records" ON public.fichas_medicas;

-- The remaining simple policies are:
--   "Doctores ven sus sesiones"        SELECT  auth.uid() = doctor_id
--   "Doctores crean sesiones"          INSERT  auth.uid() = doctor_id
--   "Doctores actualizan sesiones"     UPDATE  auth.uid() = doctor_id
--   "Doctores ven sus fichas"          SELECT  auth.uid() = doctor_id
--   "Doctores crean fichas"            INSERT  auth.uid() = doctor_id
--   "Doctores actualizan fichas"       UPDATE  auth.uid() = doctor_id

-- Add missing DELETE policy for sesiones (simple)
DROP POLICY IF EXISTS "Doctores eliminan sus sesiones" ON public.sesiones;
CREATE POLICY "Doctores eliminan sus sesiones"
ON public.sesiones FOR DELETE TO authenticated
USING (auth.uid() = doctor_id);

-- Add missing DELETE policy for fichas_medicas (simple)
DROP POLICY IF EXISTS "Doctores eliminan sus fichas" ON public.fichas_medicas;
CREATE POLICY "Doctores eliminan sus fichas"
ON public.fichas_medicas FOR DELETE TO authenticated
USING (auth.uid() = doctor_id);

-- ============================================================
-- FIX: User Profiles Cannot Be Deleted When Needed
-- ============================================================
DROP POLICY IF EXISTS "Usuarios eliminan su perfil" ON public.profiles;
CREATE POLICY "Usuarios eliminan su perfil"
ON public.profiles FOR DELETE TO authenticated
USING (auth.uid() = id);

-- ============================================================
-- FIX: No Bootstrap Process for First Admin User
-- Assign 'doctor' role automatically on signup via trigger.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'doctor')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger: assign doctor role on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Backfill: assign doctor role to any existing users who don't have one
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'doctor'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles WHERE role = 'doctor')
ON CONFLICT (user_id, role) DO NOTHING;
