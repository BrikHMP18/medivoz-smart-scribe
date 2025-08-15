-- Fix Security Vulnerability: Remove public access to medical records
-- Step 1: Get the first user ID to assign orphaned records to
DO $$
DECLARE
    first_user_id uuid;
BEGIN
    -- Get the first user from auth.users to assign orphaned records
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    
    -- If we have a user, assign all orphaned medical records to them
    IF first_user_id IS NOT NULL THEN
        -- Update orphaned medical records
        UPDATE fichas_medicas 
        SET doctor_id = first_user_id 
        WHERE doctor_id IS NULL;
        
        -- Update orphaned patients
        UPDATE pacientes 
        SET doctor_id = first_user_id 
        WHERE doctor_id IS NULL;
        
        -- Update orphaned sessions
        UPDATE sesiones 
        SET doctor_id = first_user_id 
        WHERE doctor_id IS NULL;
        
        RAISE NOTICE 'Assigned % orphaned records to user %', 
                     (SELECT COUNT(*) FROM fichas_medicas WHERE doctor_id = first_user_id), 
                     first_user_id;
    END IF;
END $$;

-- Step 2: Drop all existing permissive RLS policies
DROP POLICY IF EXISTS "Doctors can view their own medical records" ON fichas_medicas;
DROP POLICY IF EXISTS "Doctors can create medical records for themselves" ON fichas_medicas;
DROP POLICY IF EXISTS "Doctors can update their own medical records" ON fichas_medicas;
DROP POLICY IF EXISTS "Doctors can delete their own medical records" ON fichas_medicas;

DROP POLICY IF EXISTS "Doctors can view their own patients" ON pacientes;
DROP POLICY IF EXISTS "Doctors can create patients for themselves" ON pacientes;
DROP POLICY IF EXISTS "Doctors can update their own patients" ON pacientes;
DROP POLICY IF EXISTS "Doctors can delete their own patients" ON pacientes;

DROP POLICY IF EXISTS "Doctors can view their own sessions" ON sesiones;
DROP POLICY IF EXISTS "Doctors can create sessions for themselves" ON sesiones;
DROP POLICY IF EXISTS "Doctors can update their own sessions" ON sesiones;
DROP POLICY IF EXISTS "Doctors can delete their own sessions" ON sesiones;

-- Step 3: Create SECURE RLS policies without NULL conditions
-- Medical Records Policies (NO NULL ACCESS)
CREATE POLICY "Doctors can view only their medical records" 
ON fichas_medicas FOR SELECT 
USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can create medical records for themselves" 
ON fichas_medicas FOR INSERT 
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update only their medical records" 
ON fichas_medicas FOR UPDATE 
USING (auth.uid() = doctor_id) 
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can delete only their medical records" 
ON fichas_medicas FOR DELETE 
USING (auth.uid() = doctor_id);

-- Patients Policies (NO NULL ACCESS)
CREATE POLICY "Doctors can view only their patients" 
ON pacientes FOR SELECT 
USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can create patients for themselves" 
ON pacientes FOR INSERT 
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update only their patients" 
ON pacientes FOR UPDATE 
USING (auth.uid() = doctor_id) 
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can delete only their patients" 
ON pacientes FOR DELETE 
USING (auth.uid() = doctor_id);

-- Sessions Policies (NO NULL ACCESS)
CREATE POLICY "Doctors can view only their sessions" 
ON sesiones FOR SELECT 
USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can create sessions for themselves" 
ON sesiones FOR INSERT 
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update only their sessions" 
ON sesiones FOR UPDATE 
USING (auth.uid() = doctor_id) 
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can delete only their sessions" 
ON sesiones FOR DELETE 
USING (auth.uid() = doctor_id);

-- Step 4: Make doctor_id NOT NULL to prevent future vulnerabilities
ALTER TABLE fichas_medicas ALTER COLUMN doctor_id SET NOT NULL;
ALTER TABLE pacientes ALTER COLUMN doctor_id SET NOT NULL;
ALTER TABLE sesiones ALTER COLUMN doctor_id SET NOT NULL;