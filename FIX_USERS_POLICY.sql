-- ============================================
-- FIX: Permitir a usuarios crear su propio perfil
-- ============================================
-- Ejecuta esto en Supabase SQL Editor

-- Agregar política para que usuarios puedan crear su propio perfil
CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Verificar que la política se creó
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'users';

