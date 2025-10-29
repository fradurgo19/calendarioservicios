-- ============================================
-- MIGRACIÓN: Sistema de Sedes (Branches)
-- Calendario de Servicios - Partequipos S.A.S
-- ============================================

-- 1. CREAR TABLA DE SEDES
CREATE TABLE IF NOT EXISTS sedes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT UNIQUE NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  ciudad TEXT,
  direccion TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Políticas RLS para sedes
ALTER TABLE sedes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden leer sedes"
  ON sedes FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Administradores pueden gestionar sedes"
  ON sedes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'Administrator'
    )
  );

-- 2. AGREGAR COLUMNA SEDE A USERS
ALTER TABLE users ADD COLUMN IF NOT EXISTS sede_id UUID REFERENCES sedes(id);
CREATE INDEX IF NOT EXISTS idx_users_sede ON users(sede_id);

-- 3. AGREGAR COLUMNA SEDE A RESOURCES
ALTER TABLE resources ADD COLUMN IF NOT EXISTS sede_id UUID REFERENCES sedes(id);
CREATE INDEX IF NOT EXISTS idx_resources_sede ON resources(sede_id);

-- Hacer editable el nombre de recursos (para editar fases)
ALTER TABLE resources ADD COLUMN IF NOT EXISTS descripcion TEXT;

-- 4. AGREGAR COLUMNAS A SERVICE_ENTRIES
ALTER TABLE service_entries ADD COLUMN IF NOT EXISTS sede_id UUID REFERENCES sedes(id);
ALTER TABLE service_entries ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'abierto' CHECK (estado IN ('abierto', 'cerrado'));
ALTER TABLE service_entries ADD COLUMN IF NOT EXISTS notas TEXT;
ALTER TABLE service_entries ADD COLUMN IF NOT EXISTS equipment TEXT;

CREATE INDEX IF NOT EXISTS idx_service_entries_sede ON service_entries(sede_id);
CREATE INDEX IF NOT EXISTS idx_service_entries_estado ON service_entries(estado);

-- 5. AGREGAR COLUMNA SEDE Y ESTADO A QUOTE_ENTRIES
ALTER TABLE quote_entries ADD COLUMN IF NOT EXISTS sede_id UUID REFERENCES sedes(id);
ALTER TABLE quote_entries ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'abierto' CHECK (estado IN ('abierto', 'cerrado'));
CREATE INDEX IF NOT EXISTS idx_quote_entries_sede ON quote_entries(sede_id);
CREATE INDEX IF NOT EXISTS idx_quote_entries_estado ON quote_entries(estado);

-- 6. AGREGAR COLUMNAS SEDE Y ESTADO A PENDING_ITEMS
ALTER TABLE pending_items ADD COLUMN IF NOT EXISTS sede_id UUID REFERENCES sedes(id);
ALTER TABLE pending_items ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'abierto' CHECK (estado IN ('abierto', 'cerrado'));
CREATE INDEX IF NOT EXISTS idx_pending_items_sede ON pending_items(sede_id);
CREATE INDEX IF NOT EXISTS idx_pending_items_estado ON pending_items(estado);

-- 7. TRIGGER PARA UPDATE_AT EN SEDES
CREATE TRIGGER update_sedes_updated_at BEFORE UPDATE ON sedes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. DATOS INICIALES - SEDES
INSERT INTO sedes (nombre, codigo, ciudad) VALUES
  ('Barranquilla', 'BAQ', 'Barranquilla'),
  ('Bogotá', 'BOG', 'Bogotá'),
  ('Cali', 'CALI', 'Cali'),
  ('Guarne', 'GUARNE', 'Guarne')
ON CONFLICT (codigo) DO NOTHING;

-- 9. ACTUALIZAR RECURSOS EXISTENTES PARA ASIGNARLOS A BOGOTÁ POR DEFECTO
UPDATE resources 
SET sede_id = (SELECT id FROM sedes WHERE codigo = 'BOG' LIMIT 1)
WHERE sede_id IS NULL;

-- 10. CREAR VISTA DE SERVICIOS ACTIVOS POR SEDE
CREATE OR REPLACE VIEW v_servicios_activos AS
SELECT 
  se.*,
  s.nombre as sede_nombre,
  s.codigo as sede_codigo,
  u.username as creador
FROM service_entries se
LEFT JOIN sedes s ON se.sede_id = s.id
LEFT JOIN users u ON se.created_by = u.id
WHERE se.estado = 'abierto'
ORDER BY se.created_at DESC;

-- 11. CREAR VISTA DE HISTORIAL DE SERVICIOS POR SEDE
CREATE OR REPLACE VIEW v_servicios_historial AS
SELECT 
  se.*,
  s.nombre as sede_nombre,
  s.codigo as sede_codigo,
  u.username as creador
FROM service_entries se
LEFT JOIN sedes s ON se.sede_id = s.id
LEFT JOIN users u ON se.created_by = u.id
WHERE se.estado = 'cerrado'
ORDER BY se.updated_at DESC;

-- 12. CREAR VISTA DE RECURSOS POR SEDE
CREATE OR REPLACE VIEW v_recursos_por_sede AS
SELECT 
  r.*,
  s.nombre as sede_nombre,
  s.codigo as sede_codigo
FROM resources r
LEFT JOIN sedes s ON r.sede_id = s.id
ORDER BY s.nombre, r.type, r.name;

-- 13. FUNCIÓN PARA OBTENER ESTADÍSTICAS POR SEDE
CREATE OR REPLACE FUNCTION get_stats_by_sede(sede_uuid UUID)
RETURNS TABLE (
  servicios_abiertos BIGINT,
  servicios_cerrados BIGINT,
  cotizaciones BIGINT,
  pendientes BIGINT,
  tecnicos BIGINT,
  administradores BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM service_entries WHERE sede_id = sede_uuid AND estado = 'abierto'),
    (SELECT COUNT(*) FROM service_entries WHERE sede_id = sede_uuid AND estado = 'cerrado'),
    (SELECT COUNT(*) FROM quote_entries WHERE sede_id = sede_uuid),
    (SELECT COUNT(*) FROM pending_items WHERE sede_id = sede_uuid),
    (SELECT COUNT(*) FROM resources WHERE sede_id = sede_uuid AND type = 'technician'),
    (SELECT COUNT(*) FROM resources WHERE sede_id = sede_uuid AND type = 'administrator');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 'Migración completada exitosamente!' as mensaje;

-- Ver sedes creadas
SELECT * FROM sedes ORDER BY nombre;

-- Ver recursos con sede asignada
SELECT r.name, r.type, s.nombre as sede
FROM resources r
LEFT JOIN sedes s ON r.sede_id = s.id
ORDER BY s.nombre, r.type, r.name;

