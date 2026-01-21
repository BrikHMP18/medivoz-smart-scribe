-- Update RLS policies to add cross-table validation
-- This ensures doctors can only access records for patients explicitly assigned to them

-- Drop existing policies for pacientes
DROP POLICY IF EXISTS "Doctors can view their own patients" ON public.pacientes;
DROP POLICY IF EXISTS "Doctors can create patients" ON public.pacientes;
DROP POLICY IF EXISTS "Doctors can update their own patients" ON public.pacientes;
DROP POLICY IF EXISTS "Doctors can delete their own patients" ON public.pacientes;

-- Create new policies with explicit role and ownership checks
CREATE POLICY "Doctors can view their own patients" 
ON public.pacientes 
FOR SELECT 
USING (
  auth.uid() = doctor_id 
  AND public.has_role(auth.uid(), 'doctor'::app_role)
);

CREATE POLICY "Doctors can create patients" 
ON public.pacientes 
FOR INSERT 
WITH CHECK (
  public.has_role(auth.uid(), 'doctor'::app_role)
);

CREATE POLICY "Doctors can update their own patients" 
ON public.pacientes 
FOR UPDATE 
USING (
  auth.uid() = doctor_id 
  AND public.has_role(auth.uid(), 'doctor'::app_role)
)
WITH CHECK (
  auth.uid() = doctor_id 
  AND public.has_role(auth.uid(), 'doctor'::app_role)
);

CREATE POLICY "Doctors can delete their own patients" 
ON public.pacientes 
FOR DELETE 
USING (
  auth.uid() = doctor_id 
  AND public.has_role(auth.uid(), 'doctor'::app_role)
);

-- Update fichas_medicas policies with cross-table patient validation
DROP POLICY IF EXISTS "Doctors can view their own medical records" ON public.fichas_medicas;
DROP POLICY IF EXISTS "Doctors can create medical records" ON public.fichas_medicas;
DROP POLICY IF EXISTS "Doctors can update their own medical records" ON public.fichas_medicas;
DROP POLICY IF EXISTS "Doctors can delete their own medical records" ON public.fichas_medicas;

CREATE POLICY "Doctors can view their own medical records" 
ON public.fichas_medicas 
FOR SELECT 
USING (
  auth.uid() = doctor_id 
  AND public.has_role(auth.uid(), 'doctor'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.pacientes 
    WHERE pacientes.id = fichas_medicas.paciente_id 
    AND pacientes.doctor_id = auth.uid()
  )
);

CREATE POLICY "Doctors can create medical records" 
ON public.fichas_medicas 
FOR INSERT 
WITH CHECK (
  public.has_role(auth.uid(), 'doctor'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.pacientes 
    WHERE pacientes.id = paciente_id 
    AND pacientes.doctor_id = auth.uid()
  )
);

CREATE POLICY "Doctors can update their own medical records" 
ON public.fichas_medicas 
FOR UPDATE 
USING (
  auth.uid() = doctor_id 
  AND public.has_role(auth.uid(), 'doctor'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.pacientes 
    WHERE pacientes.id = fichas_medicas.paciente_id 
    AND pacientes.doctor_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = doctor_id 
  AND public.has_role(auth.uid(), 'doctor'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.pacientes 
    WHERE pacientes.id = fichas_medicas.paciente_id 
    AND pacientes.doctor_id = auth.uid()
  )
);

CREATE POLICY "Doctors can delete their own medical records" 
ON public.fichas_medicas 
FOR DELETE 
USING (
  auth.uid() = doctor_id 
  AND public.has_role(auth.uid(), 'doctor'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.pacientes 
    WHERE pacientes.id = fichas_medicas.paciente_id 
    AND pacientes.doctor_id = auth.uid()
  )
);

-- Update sesiones policies with cross-table patient validation
DROP POLICY IF EXISTS "Doctors can view their own sessions" ON public.sesiones;
DROP POLICY IF EXISTS "Doctors can create sessions" ON public.sesiones;
DROP POLICY IF EXISTS "Doctors can update their own sessions" ON public.sesiones;
DROP POLICY IF EXISTS "Doctors can delete their own sessions" ON public.sesiones;

CREATE POLICY "Doctors can view their own sessions" 
ON public.sesiones 
FOR SELECT 
USING (
  auth.uid() = doctor_id 
  AND public.has_role(auth.uid(), 'doctor'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.pacientes 
    WHERE pacientes.id = sesiones.paciente_id 
    AND pacientes.doctor_id = auth.uid()
  )
);

CREATE POLICY "Doctors can create sessions" 
ON public.sesiones 
FOR INSERT 
WITH CHECK (
  public.has_role(auth.uid(), 'doctor'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.pacientes 
    WHERE pacientes.id = paciente_id 
    AND pacientes.doctor_id = auth.uid()
  )
);

CREATE POLICY "Doctors can update their own sessions" 
ON public.sesiones 
FOR UPDATE 
USING (
  auth.uid() = doctor_id 
  AND public.has_role(auth.uid(), 'doctor'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.pacientes 
    WHERE pacientes.id = sesiones.paciente_id 
    AND pacientes.doctor_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = doctor_id 
  AND public.has_role(auth.uid(), 'doctor'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.pacientes 
    WHERE pacientes.id = sesiones.paciente_id 
    AND pacientes.doctor_id = auth.uid()
  )
);

CREATE POLICY "Doctors can delete their own sessions" 
ON public.sesiones 
FOR DELETE 
USING (
  auth.uid() = doctor_id 
  AND public.has_role(auth.uid(), 'doctor'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.pacientes 
    WHERE pacientes.id = sesiones.paciente_id 
    AND pacientes.doctor_id = auth.uid()
  )
);