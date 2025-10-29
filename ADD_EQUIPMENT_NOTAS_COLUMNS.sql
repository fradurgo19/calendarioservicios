-- Agregar columnas equipment y notas a service_entries si no existen

ALTER TABLE service_entries 
ADD COLUMN IF NOT EXISTS equipment TEXT,
ADD COLUMN IF NOT EXISTS notas TEXT;

