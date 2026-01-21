-- Create role enum
CREATE TYPE public.app_role AS ENUM ('doctor', 'admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Only admins can insert roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can delete roles
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Drop existing policies on pacientes
DROP POLICY IF EXISTS "secure_pacientes_select" ON public.pacientes;
DROP POLICY IF EXISTS "secure_pacientes_insert" ON public.pacientes;
DROP POLICY IF EXISTS "secure_pacientes_update" ON public.pacientes;
DROP POLICY IF EXISTS "secure_pacientes_delete" ON public.pacientes;

-- Create new policies for pacientes that verify doctor role
CREATE POLICY "Doctors can view their own patients"
ON public.pacientes
FOR SELECT
USING (
  auth.uid() = doctor_id AND public.has_role(auth.uid(), 'doctor')
);

CREATE POLICY "Doctors can create patients"
ON public.pacientes
FOR INSERT
WITH CHECK (
  auth.uid() = doctor_id AND public.has_role(auth.uid(), 'doctor')
);

CREATE POLICY "Doctors can update their own patients"
ON public.pacientes
FOR UPDATE
USING (
  auth.uid() = doctor_id AND public.has_role(auth.uid(), 'doctor')
)
WITH CHECK (
  auth.uid() = doctor_id AND public.has_role(auth.uid(), 'doctor')
);

CREATE POLICY "Doctors can delete their own patients"
ON public.pacientes
FOR DELETE
USING (
  auth.uid() = doctor_id AND public.has_role(auth.uid(), 'doctor')
);

-- Drop existing policies on fichas_medicas
DROP POLICY IF EXISTS "secure_fichas_medicas_select" ON public.fichas_medicas;
DROP POLICY IF EXISTS "secure_fichas_medicas_insert" ON public.fichas_medicas;
DROP POLICY IF EXISTS "secure_fichas_medicas_update" ON public.fichas_medicas;
DROP POLICY IF EXISTS "secure_fichas_medicas_delete" ON public.fichas_medicas;

-- Create new policies for fichas_medicas
CREATE POLICY "Doctors can view their own medical records"
ON public.fichas_medicas
FOR SELECT
USING (
  auth.uid() = doctor_id AND public.has_role(auth.uid(), 'doctor')
);

CREATE POLICY "Doctors can create medical records"
ON public.fichas_medicas
FOR INSERT
WITH CHECK (
  auth.uid() = doctor_id AND public.has_role(auth.uid(), 'doctor')
);

CREATE POLICY "Doctors can update their own medical records"
ON public.fichas_medicas
FOR UPDATE
USING (
  auth.uid() = doctor_id AND public.has_role(auth.uid(), 'doctor')
)
WITH CHECK (
  auth.uid() = doctor_id AND public.has_role(auth.uid(), 'doctor')
);

CREATE POLICY "Doctors can delete their own medical records"
ON public.fichas_medicas
FOR DELETE
USING (
  auth.uid() = doctor_id AND public.has_role(auth.uid(), 'doctor')
);

-- Drop existing policies on sesiones
DROP POLICY IF EXISTS "secure_sesiones_select" ON public.sesiones;
DROP POLICY IF EXISTS "secure_sesiones_insert" ON public.sesiones;
DROP POLICY IF EXISTS "secure_sesiones_update" ON public.sesiones;
DROP POLICY IF EXISTS "secure_sesiones_delete" ON public.sesiones;

-- Create new policies for sesiones
CREATE POLICY "Doctors can view their own sessions"
ON public.sesiones
FOR SELECT
USING (
  auth.uid() = doctor_id AND public.has_role(auth.uid(), 'doctor')
);

CREATE POLICY "Doctors can create sessions"
ON public.sesiones
FOR INSERT
WITH CHECK (
  auth.uid() = doctor_id AND public.has_role(auth.uid(), 'doctor')
);

CREATE POLICY "Doctors can update their own sessions"
ON public.sesiones
FOR UPDATE
USING (
  auth.uid() = doctor_id AND public.has_role(auth.uid(), 'doctor')
)
WITH CHECK (
  auth.uid() = doctor_id AND public.has_role(auth.uid(), 'doctor')
);

CREATE POLICY "Doctors can delete their own sessions"
ON public.sesiones
FOR DELETE
USING (
  auth.uid() = doctor_id AND public.has_role(auth.uid(), 'doctor')
);