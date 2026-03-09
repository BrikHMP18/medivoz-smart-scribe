-- Create function to automatically set doctor_id on patient insert
CREATE OR REPLACE FUNCTION public.set_patient_doctor_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Always set doctor_id to the authenticated user
  NEW.doctor_id = auth.uid();
  
  -- Verify user has doctor role
  IF NOT public.has_role(auth.uid(), 'doctor'::app_role) THEN
    RAISE EXCEPTION 'Only users with doctor role can create patient records';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for INSERT operations on pacientes
DROP TRIGGER IF EXISTS set_patient_doctor_id_trigger ON public.pacientes;
CREATE TRIGGER set_patient_doctor_id_trigger
  BEFORE INSERT ON public.pacientes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_patient_doctor_id();

-- Create function to prevent doctor_id changes on update
CREATE OR REPLACE FUNCTION public.prevent_doctor_id_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent changing doctor_id
  IF NEW.doctor_id IS DISTINCT FROM OLD.doctor_id THEN
    RAISE EXCEPTION 'Cannot change doctor_id of an existing patient';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for UPDATE operations on pacientes
DROP TRIGGER IF EXISTS prevent_doctor_id_change_trigger ON public.pacientes;
CREATE TRIGGER prevent_doctor_id_change_trigger
  BEFORE UPDATE ON public.pacientes
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_doctor_id_change();

-- Apply same protection to fichas_medicas table
CREATE OR REPLACE FUNCTION public.set_ficha_doctor_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Always set doctor_id to the authenticated user
  NEW.doctor_id = auth.uid();
  
  -- Verify user has doctor role
  IF NOT public.has_role(auth.uid(), 'doctor'::app_role) THEN
    RAISE EXCEPTION 'Only users with doctor role can create medical records';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_ficha_doctor_id_trigger ON public.fichas_medicas;
CREATE TRIGGER set_ficha_doctor_id_trigger
  BEFORE INSERT ON public.fichas_medicas
  FOR EACH ROW
  EXECUTE FUNCTION public.set_ficha_doctor_id();

DROP TRIGGER IF EXISTS prevent_ficha_doctor_id_change_trigger ON public.fichas_medicas;
CREATE TRIGGER prevent_ficha_doctor_id_change_trigger
  BEFORE UPDATE ON public.fichas_medicas
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_doctor_id_change();

-- Apply same protection to sesiones table
CREATE OR REPLACE FUNCTION public.set_session_doctor_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Always set doctor_id to the authenticated user
  NEW.doctor_id = auth.uid();
  
  -- Verify user has doctor role
  IF NOT public.has_role(auth.uid(), 'doctor'::app_role) THEN
    RAISE EXCEPTION 'Only users with doctor role can create sessions';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_session_doctor_id_trigger ON public.sesiones;
CREATE TRIGGER set_session_doctor_id_trigger
  BEFORE INSERT ON public.sesiones
  FOR EACH ROW
  EXECUTE FUNCTION public.set_session_doctor_id();

DROP TRIGGER IF EXISTS prevent_session_doctor_id_change_trigger ON public.sesiones;
CREATE TRIGGER prevent_session_doctor_id_change_trigger
  BEFORE UPDATE ON public.sesiones
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_doctor_id_change();