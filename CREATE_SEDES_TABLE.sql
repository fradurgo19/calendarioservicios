-- ============================================
-- CREAR TABLA: sedes
-- Calendario de Servicios - Partequipos S.A.S
-- ============================================
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard > SQL Editor
-- 2. Copia TODO este archivo
-- 3. Pégalo en el editor
-- 4. Click en "Run" o presiona Ctrl+Enter
-- ============================================

-- TABLA: sedes
CREATE TABLE IF NOT EXISTS sedes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  ciudad TEXT,
  direccion TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_sedes_codigo ON sedes(codigo);
CREATE INDEX IF NOT EXISTS idx_sedes_activa ON sedes(activa);

-- Habilitar Row Level Security
ALTER TABLE sedes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para sedes
-- Todos los usuarios autenticados pueden leer sedes
CREATE POLICY "Authenticated users can read sedes"
  ON sedes FOR SELECT
  TO authenticated
  USING (true);

-- Todos los usuarios autenticados pueden crear sedes (para facilitar la configuración inicial)
CREATE POLICY "Authenticated users can insert sedes"
  ON sedes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Solo administradores pueden actualizar y eliminar sedes
CREATE POLICY "Administrators can update sedes"
  ON sedes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'Administrator'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'Administrator'
    )
  );

CREATE POLICY "Administrators can delete sedes"
  ON sedes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'Administrator'
    )
  );

-- ============================================
-- AGREGAR COLUMNA sede_id A LAS TABLAS EXISTENTES
-- ============================================

-- Agregar sede_id a service_entries si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'service_entries' AND column_name = 'sede_id'
  ) THEN
    ALTER TABLE service_entries ADD COLUMN sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_service_entries_sede_id ON service_entries(sede_id);
  END IF;
END $$;

-- Agregar sede_id a quote_entries si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quote_entries' AND column_name = 'sede_id'
  ) THEN
    ALTER TABLE quote_entries ADD COLUMN sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_quote_entries_sede_id ON quote_entries(sede_id);
  END IF;
END $$;

-- Agregar sede_id a pending_items si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pending_items' AND column_name = 'sede_id'
  ) THEN
    ALTER TABLE pending_items ADD COLUMN sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_pending_items_sede_id ON pending_items(sede_id);
  END IF;
END $$;

-- Agregar sede_id a resources si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'resources' AND column_name = 'sede_id'
  ) THEN
    ALTER TABLE resources ADD COLUMN sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_resources_sede_id ON resources(sede_id);
  END IF;
END $$;

