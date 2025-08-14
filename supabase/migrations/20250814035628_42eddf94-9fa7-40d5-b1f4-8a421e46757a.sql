-- Add doctor_id column to link patients to their healthcare providers
ALTER TABLE public.pacientes 
ADD COLUMN doctor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Set default doctor_id for existing records (you may need to update this manually)
-- For now, we'll leave existing records without a doctor_id, but new records will require one
ALTER TABLE public.pacientes 
ALTER COLUMN doctor_id SET NOT NULL;

-- Drop the overly permissive RLS policy
DROP POLICY IF EXISTS "Allow authenticated users full access to patients" ON public.pacientes;

-- Create secure RLS policies
CREATE POLICY "Healthcare providers can view their own patients" 
ON public.pacientes 
FOR SELECT 
USING (auth.uid() = doctor_id);

CREATE POLICY "Healthcare providers can create patients for themselves" 
ON public.pacientes 
FOR INSERT 
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Healthcare providers can update their own patients" 
ON public.pacientes 
FOR UPDATE 
USING (auth.uid() = doctor_id)
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Healthcare providers can delete their own patients" 
ON public.pacientes 
FOR DELETE 
USING (auth.uid() = doctor_id);

-- Also fix the fichas_medicas policies which were incorrectly using paciente_id instead of doctor/user relationship
-- First, add doctor_id to fichas_medicas for proper access control
ALTER TABLE public.fichas_medicas 
ADD COLUMN doctor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing records to have doctor_id from their associated patient
UPDATE public.fichas_medicas 
SET doctor_id = p.doctor_id 
FROM public.pacientes p 
WHERE p.id = fichas_medicas.paciente_id;

-- Make doctor_id required
ALTER TABLE public.fichas_medicas 
ALTER COLUMN doctor_id SET NOT NULL;

-- Drop the incorrect RLS policies on fichas_medicas
DROP POLICY IF EXISTS "delete_own_records" ON public.fichas_medicas;
DROP POLICY IF EXISTS "insert_own_records" ON public.fichas_medicas;
DROP POLICY IF EXISTS "select_own_records" ON public.fichas_medicas;
DROP POLICY IF EXISTS "update_own_records" ON public.fichas_medicas;

-- Create correct RLS policies for fichas_medicas
CREATE POLICY "Healthcare providers can view their patients' medical records" 
ON public.fichas_medicas 
FOR SELECT 
USING (auth.uid() = doctor_id);

CREATE POLICY "Healthcare providers can create medical records for their patients" 
ON public.fichas_medicas 
FOR INSERT 
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Healthcare providers can update their patients' medical records" 
ON public.fichas_medicas 
FOR UPDATE 
USING (auth.uid() = doctor_id)
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Healthcare providers can delete their patients' medical records" 
ON public.fichas_medicas 
FOR DELETE 
USING (auth.uid() = doctor_id);