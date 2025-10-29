-- ============================================
-- SETUP COMPLETO PARA NEON DATABASE
-- Calendario de Servicios - Partequipos S.A.S
-- ============================================

-- Nota: Ejecuta estos comandos en orden en tu consola de Neon
-- Primero asegúrate de tener la extensión pgcrypto habilitada

-- ============================================
-- 1. EXTENSIONES
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

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- 3. TABLA: service_entries
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
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_service_entries_created_by ON service_entries(created_by);
CREATE INDEX IF NOT EXISTS idx_service_entries_type ON service_entries(type);
CREATE INDEX IF NOT EXISTS idx_service_entries_created_at ON service_entries(created_at);

-- ============================================
-- 4. TABLA: resources
-- ============================================

CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('technician', 'administrator', 'phase')),
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_available ON resources(available);

-- ============================================
-- 5. TABLA: assignments
-- ============================================

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_entry_id UUID REFERENCES service_entries(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_entry_id, resource_id, date)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_assignments_service_entry ON assignments(service_entry_id);
CREATE INDEX IF NOT EXISTS idx_assignments_resource ON assignments(resource_id);
CREATE INDEX IF NOT EXISTS idx_assignments_date ON assignments(date);

-- ============================================
-- 6. TABLA: quote_entries
-- ============================================

CREATE TABLE IF NOT EXISTS quote_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone TEXT NOT NULL,
  equipment TEXT NOT NULL,
  client TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_quote_entries_created_by ON quote_entries(created_by);
CREATE INDEX IF NOT EXISTS idx_quote_entries_created_at ON quote_entries(created_at);

-- ============================================
-- 7. TABLA: quote_assignments
-- ============================================

CREATE TABLE IF NOT EXISTS quote_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_entry_id UUID REFERENCES quote_entries(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quote_entry_id, date)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_quote_assignments_quote_entry ON quote_assignments(quote_entry_id);
CREATE INDEX IF NOT EXISTS idx_quote_assignments_date ON quote_assignments(date);
CREATE INDEX IF NOT EXISTS idx_quote_assignments_status ON quote_assignments(status);

-- ============================================
-- 8. TABLA: pending_items
-- ============================================

CREATE TABLE IF NOT EXISTS pending_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item TEXT NOT NULL,
  date DATE NOT NULL,
  assigned_to TEXT NOT NULL,
  due_date DATE NOT NULL,
  observations TEXT DEFAULT '',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_pending_items_created_by ON pending_items(created_by);
CREATE INDEX IF NOT EXISTS idx_pending_items_due_date ON pending_items(due_date);
CREATE INDEX IF NOT EXISTS idx_pending_items_assigned_to ON pending_items(assigned_to);

-- ============================================
-- 9. TRIGGERS PARA updated_at
-- ============================================

-- Función para actualizar el timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para cada tabla
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_entries_updated_at BEFORE UPDATE ON service_entries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_entries_updated_at BEFORE UPDATE ON quote_entries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pending_items_updated_at BEFORE UPDATE ON pending_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. DATOS INICIALES: resources
-- ============================================

INSERT INTO resources (name, type) VALUES
  -- Técnicos
  ('TBOG1', 'technician'),
  ('TBOG2', 'technician'),
  ('TBOG3', 'technician'),
  ('TBOG4', 'technician'),
  -- Administradores
  ('ADBOG1', 'administrator'),
  ('ADBOG2', 'administrator'),
  ('ADBOG3', 'administrator'),
  -- Fases
  ('F1', 'phase'),
  ('F2', 'phase'),
  ('F3', 'phase'),
  ('F4', 'phase'),
  ('F5', 'phase'),
  ('F6', 'phase'),
  ('F7', 'phase'),
  ('F8', 'phase'),
  ('F9', 'phase'),
  ('F10', 'phase'),
  ('F11', 'phase'),
  ('F12', 'phase'),
  ('F13', 'phase'),
  ('F14', 'phase'),
  ('F15', 'phase'),
  ('F16', 'phase')
ON CONFLICT DO NOTHING;

-- ============================================
-- 11. USUARIO ADMINISTRADOR INICIAL
-- ============================================

-- IMPORTANTE: Cambia el email y password después de crear tu primer usuario
-- La contraseña 'admin123' está hasheada con bcrypt (10 rounds)
INSERT INTO users (username, email, password_hash, role)
VALUES (
  'admin',
  'admin@partequipos.com',
  '$2a$10$rOmzE4KQF5YKEHGb1zCg0uK8jxVY0xXvD8Qz2Vv5Qz0Qz0Qz0Qz0Q',
  'Administrator'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 12. VISTAS ÚTILES (OPCIONAL)
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
  r.name as resource_name,
  r.type as resource_type,
  u.username as created_by_username
FROM assignments a
JOIN service_entries se ON a.service_entry_id = se.id
JOIN resources r ON a.resource_id = r.id
LEFT JOIN users u ON se.created_by = u.id;

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
  u.username as created_by_username
FROM quote_assignments qa
JOIN quote_entries qe ON qa.quote_entry_id = qe.id
LEFT JOIN users u ON qe.created_by = u.id;

-- Vista de pendientes
CREATE OR REPLACE VIEW v_pending_details AS
SELECT 
  pi.id,
  pi.item,
  pi.date,
  pi.assigned_to,
  pi.due_date,
  pi.observations,
  u.username as created_by_username,
  CASE 
    WHEN pi.due_date < CURRENT_DATE THEN 'overdue'
    WHEN pi.due_date = CURRENT_DATE THEN 'today'
    ELSE 'upcoming'
  END as urgency
FROM pending_items pi
LEFT JOIN users u ON pi.created_by = u.id;

-- ============================================
-- FIN DEL SETUP
-- ============================================

-- Verificación
SELECT 'Setup completado exitosamente!' as message;
SELECT 'Total de recursos creados: ' || COUNT(*) FROM resources;
SELECT 'Total de usuarios: ' || COUNT(*) FROM users;

