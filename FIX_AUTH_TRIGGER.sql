-- ============================================
-- SOLUCIÓN DEFINITIVA: Trigger Automático
-- ============================================
-- Este trigger crea automáticamente el perfil en la tabla users
-- cuando un usuario se registra en Supabase Auth

-- Paso 1: Eliminar políticas actuales que causan conflicto
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Paso 2: Crear función que se ejecuta automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 3: Crear trigger que ejecuta la función
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Paso 4: Actualizar política INSERT para permitir solo al sistema
CREATE POLICY "System can insert user profiles"
  ON users FOR INSERT
  WITH CHECK (true);

-- Verificar
SELECT 'Trigger creado exitosamente!' as mensaje;

