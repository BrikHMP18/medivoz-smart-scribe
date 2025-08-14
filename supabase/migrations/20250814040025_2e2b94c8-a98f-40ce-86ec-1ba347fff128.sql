-- Migration: Fix Medical Data Security Vulnerabilities
-- Step 1: Add doctor_id columns to all medical tables (nullable for existing data)

-- Add doctor_id to pacientes table
ALTER TABLE public.pacientes 
ADD COLUMN IF NOT EXISTS doctor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add doctor_id to sesiones table  
ALTER TABLE public.sesiones 
ADD COLUMN IF NOT EXISTS doctor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add doctor_id to fichas_medicas table
ALTER TABLE public.fichas_medicas 
ADD COLUMN IF NOT EXISTS doctor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Step 2: Drop all existing overly permissive RLS policies

-- Drop pacientes policies
DROP POLICY IF EXISTS "Allow authenticated users full access to patients" ON public.pacientes;

-- Drop sesiones policies  
DROP POLICY IF EXISTS "Allow authenticated users full access to sessions" ON public.sesiones;

-- Drop conflicting fichas_medicas policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.fichas_medicas;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.fichas_medicas;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.fichas_medicas;
DROP POLICY IF EXISTS "delete_own_records" ON public.fichas_medicas;
DROP POLICY IF EXISTS "insert_own_records" ON public.fichas_medicas;
DROP POLICY IF EXISTS "select_own_records" ON public.fichas_medicas; 
DROP POLICY IF EXISTS "update_own_records" ON public.fichas_medicas;

-- Step 3: Create secure RLS policies for pacientes
CREATE POLICY "Doctors can view their own patients" 
ON public.pacientes 
FOR SELECT 
USING (auth.uid() = doctor_id OR doctor_id IS NULL);

CREATE POLICY "Doctors can create patients for themselves" 
ON public.pacientes 
FOR INSERT 
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update their own patients" 
ON public.pacientes 
FOR UPDATE 
USING (auth.uid() = doctor_id OR doctor_id IS NULL)
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can delete their own patients" 
ON public.pacientes 
FOR DELETE 
USING (auth.uid() = doctor_id OR doctor_id IS NULL);

-- Step 4: Create secure RLS policies for sesiones
CREATE POLICY "Doctors can view their own sessions" 
ON public.sesiones 
FOR SELECT 
USING (auth.uid() = doctor_id OR doctor_id IS NULL);

CREATE POLICY "Doctors can create sessions for themselves" 
ON public.sesiones 
FOR INSERT 
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update their own sessions" 
ON public.sesiones 
FOR UPDATE 
USING (auth.uid() = doctor_id OR doctor_id IS NULL)
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can delete their own sessions" 
ON public.sesiones 
FOR DELETE 
USING (auth.uid() = doctor_id OR doctor_id IS NULL);

-- Step 5: Create secure RLS policies for fichas_medicas  
CREATE POLICY "Doctors can view their own medical records" 
ON public.fichas_medicas 
FOR SELECT 
USING (auth.uid() = doctor_id OR doctor_id IS NULL);

CREATE POLICY "Doctors can create medical records for themselves" 
ON public.fichas_medicas 
FOR INSERT 
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update their own medical records" 
ON public.fichas_medicas 
FOR UPDATE 
USING (auth.uid() = doctor_id OR doctor_id IS NULL)
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can delete their own medical records" 
ON public.fichas_medicas 
FOR DELETE 
USING (auth.uid() = doctor_id OR doctor_id IS NULL);