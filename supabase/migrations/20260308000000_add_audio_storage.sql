-- Add audio_url column to sesiones table
ALTER TABLE public.sesiones
ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Create the audio-recordings storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-recordings', 'audio-recordings', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for audio-recordings bucket
-- Doctors can upload audio to their own folder
CREATE POLICY "Doctors can upload their own audio"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'audio-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Doctors can read their own audio
CREATE POLICY "Doctors can read their own audio"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'audio-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Doctors can update their own audio
CREATE POLICY "Doctors can update their own audio"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'audio-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Doctors can delete their own audio
CREATE POLICY "Doctors can delete their own audio"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'audio-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
