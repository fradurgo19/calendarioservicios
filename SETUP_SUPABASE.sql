-- ============================================
-- SETUP SUPABASE - Calendario de Servicios
-- ============================================
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard > SQL Editor
-- 2. Copia TODO este archivo
-- 3. Pégalo en el editor
-- 4. Click en "Run" o presiona Ctrl+Enter
-- ============================================

-- 1. TABLA: users
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Administrator', 'User', 'Sales')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. TABLA: service_entries
CREATE TABLE service_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site TEXT NOT NULL,
  zone TEXT NOT NULL,
  ott TEXT NOT NULL,
  client TEXT NOT NULL,
  advisor TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Service', 'Preparation')),
  equipment_state TEXT NOT NULL CHECK (equipment_state IN ('New', 'Used')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE service_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read service entries"
  ON service_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create service entries"
  ON service_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own service entries"
  ON service_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- 3. TABLA: resources
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('technician', 'administrator', 'phase')),
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read resources"
  ON resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Administrators can manage resources"
  ON resources FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'Administrator'
    )
  );

-- 4. TABLA: assignments
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_entry_id UUID REFERENCES service_entries(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_entry_id, resource_id, date)
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read assignments"
  ON assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create assignments"
  ON assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete assignments"
  ON assignments FOR DELETE
  TO authenticated
  USING (true);

-- 5. TABLA: quote_entries
CREATE TABLE quote_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone TEXT NOT NULL,
  equipment TEXT NOT NULL,
  client TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quote_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read quote entries"
  ON quote_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create quote entries"
  ON quote_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own quote entries"
  ON quote_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- 6. TABLA: quote_assignments
CREATE TABLE quote_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_entry_id UUID REFERENCES quote_entries(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quote_entry_id, date)
);

ALTER TABLE quote_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read quote assignments"
  ON quote_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create quote assignments"
  ON quote_assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 7. TABLA: pending_items
CREATE TABLE pending_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item TEXT NOT NULL,
  date DATE NOT NULL,
  assigned_to TEXT NOT NULL,
  due_date DATE NOT NULL,
  observations TEXT DEFAULT '',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pending_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read pending items"
  ON pending_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create pending items"
  ON pending_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own pending items"
  ON pending_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own pending items"
  ON pending_items FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- 8. DATOS INICIALES: resources (técnicos, administradores, fases)
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
  ('F16', 'phase');

-- ============================================
-- SETUP COMPLETADO
-- ============================================
-- Verifica que todo se creó correctamente:
SELECT 'Setup completado!' as mensaje;
SELECT COUNT(*) as total_resources FROM resources;

