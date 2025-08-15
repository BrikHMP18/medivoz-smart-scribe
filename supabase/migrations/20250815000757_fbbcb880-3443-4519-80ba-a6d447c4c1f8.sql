-- Fix Security Vulnerability: Remove public access to medical records
-- Step 1: Assign orphaned records to first available user
DO $$
DECLARE
    first_user_id uuid;
    orphaned_records_count integer;
BEGIN
    -- Get the first user from auth.users to assign orphaned records
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    
    -- If we have a user, assign all orphaned records to them
    IF first_user_id IS NOT NULL THEN
        -- Count and update orphaned medical records
        SELECT COUNT(*) INTO orphaned_records_count FROM fichas_medicas WHERE doctor_id IS NULL;
        UPDATE fichas_medicas SET doctor_id = first_user_id WHERE doctor_id IS NULL;
        
        -- Update orphaned patients
        UPDATE pacientes SET doctor_id = first_user_id WHERE doctor_id IS NULL;
        
        -- Update orphaned sessions
        UPDATE sesiones SET doctor_id = first_user_id WHERE doctor_id IS NULL;
        
        RAISE NOTICE 'Assigned % orphaned medical records to user %', orphaned_records_count, first_user_id;
    ELSE
        RAISE NOTICE 'No users found - cannot assign orphaned records';
    END IF;
END $$;

-- Step 2: Drop existing policies if they exist (using IF EXISTS)
DROP POLICY IF EXISTS "Doctors can view their own medical records" ON fichas_medicas;
DROP POLICY IF EXISTS "Doctors can create medical records for themselves" ON fichas_medicas;
DROP POLICY IF EXISTS "Doctors can update their own medical records" ON fichas_medicas;
DROP POLICY IF EXISTS "Doctors can delete their own medical records" ON fichas_medicas;
DROP POLICY IF EXISTS "Doctors can view only their medical records" ON fichas_medicas;
DROP POLICY IF EXISTS "Doctors can update only their medical records" ON fichas_medicas;
DROP POLICY IF EXISTS "Doctors can delete only their medical records" ON fichas_medicas;

DROP POLICY IF EXISTS "Doctors can view their own patients" ON pacientes;
DROP POLICY IF EXISTS "Doctors can create patients for themselves" ON pacientes;
DROP POLICY IF EXISTS "Doctors can update their own patients" ON pacientes;
DROP POLICY IF EXISTS "Doctors can delete their own patients" ON pacientes;
DROP POLICY IF EXISTS "Doctors can view only their patients" ON pacientes;
DROP POLICY IF EXISTS "Doctors can update only their patients" ON pacientes;
DROP POLICY IF EXISTS "Doctors can delete only their patients" ON pacientes;

DROP POLICY IF EXISTS "Doctors can view their own sessions" ON sesiones;
DROP POLICY IF EXISTS "Doctors can create sessions for themselves" ON sesiones;
DROP POLICY IF EXISTS "Doctors can update their own sessions" ON sesiones;
DROP POLICY IF EXISTS "Doctors can delete their own sessions" ON sesiones;
DROP POLICY IF EXISTS "Doctors can view only their sessions" ON sesiones;
DROP POLICY IF EXISTS "Doctors can update only their sessions" ON sesiones;
DROP POLICY IF EXISTS "Doctors can delete only their sessions" ON sesiones;

-- Step 3: Create SECURE RLS policies (NO NULL ACCESS ALLOWED)
-- Medical Records - Secure Policies
CREATE POLICY "secure_fichas_medicas_select" 
ON fichas_medicas FOR SELECT 
USING (auth.uid() = doctor_id);

CREATE POLICY "secure_fichas_medicas_insert" 
ON fichas_medicas FOR INSERT 
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "secure_fichas_medicas_update" 
ON fichas_medicas FOR UPDATE 
USING (auth.uid() = doctor_id) 
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "secure_fichas_medicas_delete" 
ON fichas_medicas FOR DELETE 
USING (auth.uid() = doctor_id);

-- Patients - Secure Policies
CREATE POLICY "secure_pacientes_select" 
ON pacientes FOR SELECT 
USING (auth.uid() = doctor_id);

CREATE POLICY "secure_pacientes_insert" 
ON pacientes FOR INSERT 
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "secure_pacientes_update" 
ON pacientes FOR UPDATE 
USING (auth.uid() = doctor_id) 
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "secure_pacientes_delete" 
ON pacientes FOR DELETE 
USING (auth.uid() = doctor_id);

-- Sessions - Secure Policies
CREATE POLICY "secure_sesiones_select" 
ON sesiones FOR SELECT 
USING (auth.uid() = doctor_id);

CREATE POLICY "secure_sesiones_insert" 
ON sesiones FOR INSERT 
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "secure_sesiones_update" 
ON sesiones FOR UPDATE 
USING (auth.uid() = doctor_id) 
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "secure_sesiones_delete" 
ON sesiones FOR DELETE 
USING (auth.uid() = doctor_id);

-- Step 4: Make doctor_id NOT NULL to prevent future null assignments
-- Check if we can safely make them NOT NULL (all records should have doctor_id now)
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM fichas_medicas WHERE doctor_id IS NULL) = 0 THEN
        ALTER TABLE fichas_medicas ALTER COLUMN doctor_id SET NOT NULL;
        RAISE NOTICE 'Made fichas_medicas.doctor_id NOT NULL';
    END IF;
    
    IF (SELECT COUNT(*) FROM pacientes WHERE doctor_id IS NULL) = 0 THEN
        ALTER TABLE pacientes ALTER COLUMN doctor_id SET NOT NULL;
        RAISE NOTICE 'Made pacientes.doctor_id NOT NULL';
    END IF;
    
    IF (SELECT COUNT(*) FROM sesiones WHERE doctor_id IS NULL) = 0 THEN
        ALTER TABLE sesiones ALTER COLUMN doctor_id SET NOT NULL;
        RAISE NOTICE 'Made sesiones.doctor_id NOT NULL';
    END IF;
END $$;