-- FIX: "No Bootstrap Process for First Admin User"
-- Allow authenticated users to self-assign the 'doctor' role.
-- This eliminates the chicken-and-egg problem where only admins can insert roles
-- but no admin exists yet.
-- The trigger (handle_new_user_role) handles auto-assignment on signup,
-- but this policy ensures the system works even without the trigger.

DROP POLICY IF EXISTS "Users can self-assign doctor role" ON public.user_roles;
CREATE POLICY "Users can self-assign doctor role"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = 'doctor'
);
