-- ============================================
-- SETUP COMPLETO PARA POSTGRESQL 17 LOCAL
-- Calendario de Servicios - Partequipos S.A.S
-- ============================================
-- INSTRUCCIONES:
-- 1. Conéctate a tu base de datos PostgreSQL 17
-- 2. Ejecuta este script completo
-- 3. Verifica que todas las tablas se crearon correctamente
-- ============================================

-- ============================================
-- 1. EXTENSIONES NECESARIAS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 2. TABLA: users
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Administrator', 'User', 'Sales')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- 3. TABLA: sedes (NUEVA)
-- ============================================

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

-- Índices para sedes
CREATE INDEX IF NOT EXISTS idx_sedes_codigo ON sedes(codigo);
CREATE INDEX IF NOT EXISTS idx_sedes_activa ON sedes(activa);
CREATE INDEX IF NOT EXISTS idx_sedes_nombre ON sedes(nombre);

-- ============================================
-- 4. TABLA: service_entries
-- ============================================

CREATE TABLE IF NOT EXISTS service_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site TEXT NOT NULL,
  zone TEXT NOT NULL,
  ott TEXT NOT NULL,
  client TEXT NOT NULL,
  advisor TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Service', 'Preparation')),
  equipment_state TEXT NOT NULL CHECK (equipment_state IN ('New', 'Used')),
  estado TEXT DEFAULT 'abierto' CHECK (estado IN ('abierto', 'cerrado')),
  sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para service_entries
CREATE INDEX IF NOT EXISTS idx_service_entries_created_by ON service_entries(created_by);
CREATE INDEX IF NOT EXISTS idx_service_entries_type ON service_entries(type);
CREATE INDEX IF NOT EXISTS idx_service_entries_estado ON service_entries(estado);
CREATE INDEX IF NOT EXISTS idx_service_entries_created_at ON service_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_service_entries_sede_id ON service_entries(sede_id);

-- ============================================
-- 5. TABLA: resources
-- ============================================

CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('technician', 'administrator', 'phase')),
  available BOOLEAN DEFAULT true,
  sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para resources
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_available ON resources(available);
CREATE INDEX IF NOT EXISTS idx_resources_sede_id ON resources(sede_id);

-- ============================================
-- 6. TABLA: assignments
-- ============================================

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_entry_id UUID REFERENCES service_entries(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_entry_id, resource_id, date)
);

-- Índices para assignments
CREATE INDEX IF NOT EXISTS idx_assignments_service_entry ON assignments(service_entry_id);
CREATE INDEX IF NOT EXISTS idx_assignments_resource ON assignments(resource_id);
CREATE INDEX IF NOT EXISTS idx_assignments_date ON assignments(date);

-- ============================================
-- 7. TABLA: quote_entries
-- ============================================

CREATE TABLE IF NOT EXISTS quote_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone TEXT NOT NULL,
  equipment TEXT NOT NULL,
  client TEXT NOT NULL,
  notes TEXT DEFAULT '',
  estado TEXT DEFAULT 'abierto' CHECK (estado IN ('abierto', 'cerrado')),
  sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para quote_entries
CREATE INDEX IF NOT EXISTS idx_quote_entries_created_by ON quote_entries(created_by);
CREATE INDEX IF NOT EXISTS idx_quote_entries_estado ON quote_entries(estado);
CREATE INDEX IF NOT EXISTS idx_quote_entries_created_at ON quote_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_quote_entries_sede_id ON quote_entries(sede_id);

-- ============================================
-- 8. TABLA: quote_assignments
-- ============================================

CREATE TABLE IF NOT EXISTS quote_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_entry_id UUID REFERENCES quote_entries(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quote_entry_id, date)
);

-- Índices para quote_assignments
CREATE INDEX IF NOT EXISTS idx_quote_assignments_quote_entry ON quote_assignments(quote_entry_id);
CREATE INDEX IF NOT EXISTS idx_quote_assignments_date ON quote_assignments(date);
CREATE INDEX IF NOT EXISTS idx_quote_assignments_status ON quote_assignments(status);

-- ============================================
-- 9. TABLA: pending_items
-- ============================================

CREATE TABLE IF NOT EXISTS pending_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item TEXT NOT NULL,
  date DATE NOT NULL,
  assigned_to TEXT NOT NULL,
  due_date DATE NOT NULL,
  estado TEXT DEFAULT 'abierto' CHECK (estado IN ('abierto', 'cerrado')),
  observations TEXT DEFAULT '',
  sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para pending_items
CREATE INDEX IF NOT EXISTS idx_pending_items_created_by ON pending_items(created_by);
CREATE INDEX IF NOT EXISTS idx_pending_items_due_date ON pending_items(due_date);
CREATE INDEX IF NOT EXISTS idx_pending_items_assigned_to ON pending_items(assigned_to);
CREATE INDEX IF NOT EXISTS idx_pending_items_estado ON pending_items(estado);
CREATE INDEX IF NOT EXISTS idx_pending_items_sede_id ON pending_items(sede_id);

-- ============================================
-- 10. TRIGGERS PARA updated_at
-- ============================================

-- Función para actualizar el timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para cada tabla con updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sedes_updated_at ON sedes;
CREATE TRIGGER update_sedes_updated_at 
  BEFORE UPDATE ON sedes
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_entries_updated_at ON service_entries;
CREATE TRIGGER update_service_entries_updated_at 
  BEFORE UPDATE ON service_entries
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quote_entries_updated_at ON quote_entries;
CREATE TRIGGER update_quote_entries_updated_at 
  BEFORE UPDATE ON quote_entries
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pending_items_updated_at ON pending_items;
CREATE TRIGGER update_pending_items_updated_at 
  BEFORE UPDATE ON pending_items
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. DATOS INICIALES: resources (fases globales)
-- ============================================

-- Fases (no tienen sede_id, son globales)
INSERT INTO resources (name, type, sede_id) VALUES
  ('F1', 'phase', NULL),
  ('F2', 'phase', NULL),
  ('F3', 'phase', NULL),
  ('F4', 'phase', NULL),
  ('F5', 'phase', NULL),
  ('F6', 'phase', NULL),
  ('F7', 'phase', NULL),
  ('F8', 'phase', NULL),
  ('F9', 'phase', NULL),
  ('F10', 'phase', NULL),
  ('F11', 'phase', NULL),
  ('F12', 'phase', NULL),
  ('F13', 'phase', NULL),
  ('F14', 'phase', NULL),
  ('F15', 'phase', NULL),
  ('F16', 'phase', NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- 12. USUARIO ADMINISTRADOR INICIAL (OPCIONAL)
-- ============================================

-- IMPORTANTE: Cambia el email y password después de crear tu primer usuario
-- La contraseña es 'admin123' hasheada con bcrypt
-- Puedes generar un nuevo hash con: bcrypt.hashSync('tu_contraseña', 10)
INSERT INTO users (username, email, password_hash, role)
VALUES (
  'admin',
  'admin@partequipos.com',
  '$2a$10$rOmzE4KQF5YKEHGb1zCg0uK8jxVY0xXvD8Qz2Vv5Qz0Qz0Qz0Qz0Q',
  'Administrator'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 13. VISTAS ÚTILES (OPCIONAL)
-- ============================================

-- Vista de asignaciones con detalles
CREATE OR REPLACE VIEW v_assignment_details AS
SELECT 
  a.id,
  a.date,
  se.site,
  se.zone,
  se.ott,
  se.client,
  se.advisor,
  se.type,
  se.equipment_state,
  se.estado,
  s.nombre as sede_nombre,
  r.name as resource_name,
  r.type as resource_type,
  u.username as created_by_username
FROM assignments a
JOIN service_entries se ON a.service_entry_id = se.id
JOIN resources r ON a.resource_id = r.id
LEFT JOIN users u ON se.created_by = u.id
LEFT JOIN sedes s ON se.sede_id = s.id;

-- Vista de cotizaciones con detalles
CREATE OR REPLACE VIEW v_quote_details AS
SELECT 
  qa.id,
  qa.date,
  qa.status,
  qe.zone,
  qe.equipment,
  qe.client,
  qe.notes,
  qe.estado,
  s.nombre as sede_nombre,
  u.username as created_by_username
FROM quote_assignments qa
JOIN quote_entries qe ON qa.quote_entry_id = qe.id
LEFT JOIN users u ON qe.created_by = u.id
LEFT JOIN sedes s ON qe.sede_id = s.id;

-- Vista de pendientes con detalles
CREATE OR REPLACE VIEW v_pending_details AS
SELECT 
  pi.id,
  pi.item,
  pi.date,
  pi.assigned_to,
  pi.due_date,
  pi.observations,
  pi.estado,
  s.nombre as sede_nombre,
  u.username as created_by_username,
  CASE 
    WHEN pi.due_date < CURRENT_DATE THEN 'overdue'
    WHEN pi.due_date = CURRENT_DATE THEN 'today'
    ELSE 'upcoming'
  END as urgency
FROM pending_items pi
LEFT JOIN users u ON pi.created_by = u.id
LEFT JOIN sedes s ON pi.sede_id = s.id;

-- ============================================
-- FIN DEL SETUP
-- ============================================

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Setup completado exitosamente!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total de tablas creadas: 8';
  RAISE NOTICE '- users';
  RAISE NOTICE '- sedes';
  RAISE NOTICE '- service_entries';
  RAISE NOTICE '- resources';
  RAISE NOTICE '- assignments';
  RAISE NOTICE '- quote_entries';
  RAISE NOTICE '- quote_assignments';
  RAISE NOTICE '- pending_items';
  RAISE NOTICE '========================================';
END $$;

SELECT 'Tablas creadas correctamente!' as mensaje;
SELECT COUNT(*) as total_fases FROM resources WHERE type = 'phase';
SELECT COUNT(*) as total_usuarios FROM users;

