-- Create agent_type enum
CREATE TYPE public.agent_type AS ENUM ('Transcriptor', 'Extractor');

-- Create agent_status enum
CREATE TYPE public.agent_status AS ENUM ('activo', 'inactivo');

-- Create agents table
CREATE TABLE public.agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  tipo agent_type NOT NULL DEFAULT 'Transcriptor',
  estado agent_status NOT NULL DEFAULT 'activo',
  prompt TEXT,
  documentos TEXT[] DEFAULT '{}',
  dependencias TEXT[] DEFAULT '{}',
  configuracion JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- RLS policies: doctors can only access their own agents
CREATE POLICY "Doctors can view their own agents"
ON public.agents FOR SELECT
USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can create their own agents"
ON public.agents FOR INSERT
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update their own agents"
ON public.agents FOR UPDATE
USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can delete their own agents"
ON public.agents FOR DELETE
USING (auth.uid() = doctor_id);
