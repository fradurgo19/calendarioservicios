-- ============================================
-- AGREGAR TABLA: sedes A POSTGRESQL LOCAL
-- Calendario de Servicios - Partequipos S.A.S
-- ============================================
-- INSTRUCCIONES:
-- 1. Conéctate a tu base de datos PostgreSQL 17 local
-- 2. Ejecuta este script
-- 3. Verifica que la tabla sedes se creó correctamente
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
CREATE INDEX IF NOT EXISTS idx_sedes_nombre ON sedes(nombre);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sedes_updated_at ON sedes;
CREATE TRIGGER update_sedes_updated_at 
  BEFORE UPDATE ON sedes
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

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

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

SELECT 'Tabla sedes y columnas sede_id agregadas correctamente!' as mensaje;

