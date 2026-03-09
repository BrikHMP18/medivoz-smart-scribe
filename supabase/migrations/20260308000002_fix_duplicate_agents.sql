-- Remove duplicate agents (keep the oldest one per doctor+nombre)
DELETE FROM agents
WHERE id NOT IN (
  SELECT DISTINCT ON (doctor_id, nombre) id
  FROM agents
  ORDER BY doctor_id, nombre, created_at ASC
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE agents ADD CONSTRAINT agents_doctor_nombre_unique UNIQUE (doctor_id, nombre);
