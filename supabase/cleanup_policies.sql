-- Limpiar políticas duplicadas en la tabla pacientes

ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors can view their own patients" ON public.pacientes;
DROP POLICY IF EXISTS "Doctors can create patients" ON public.pacientes;
DROP POLICY IF EXISTS "Doctors can update their own patients" ON public.pacientes;
DROP POLICY IF EXISTS "Doctors can delete their own patients" ON public.pacientes;

-- Confirmar que solo queden las políticas en español
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'pacientes';


