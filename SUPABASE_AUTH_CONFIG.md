# 🔐 Configuración de Autenticación de Supabase

## Problema: El registro no funciona

Necesitas configurar 2 cosas en Supabase:

---

## 1. Deshabilitar Confirmación de Email (Para Desarrollo)

### Pasos:

1. Ve a tu Dashboard de Supabase:
   ```
   https://supabase.com/dashboard/project/wagqzvlhbwginkyvdidb
   ```

2. En el menú lateral, busca **Authentication**

3. Click en **Settings** (bajo Authentication)

4. Busca la sección **"Email Auth"**

5. **DESACTIVA** (toggle OFF) estas opciones:
   - ❌ **"Enable email confirmations"**
   - ❌ **"Enable email confirmations for existing users"**

6. Click en **Save** en la parte inferior

**¿Por qué?** 
- En desarrollo, no quieres esperar emails de confirmación
- Los usuarios se crearán inmediatamente

---

## 2. Ejecutar el Trigger SQL

### Necesitas ejecutar este SQL en Supabase SQL Editor:

1. Ve a:
   ```
   https://supabase.com/dashboard/project/wagqzvlhbwginkyvdidb/sql/new
   ```

2. Copia y pega este código completo:

```sql
-- Eliminar políticas conflictivas
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Crear función para el trigger
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

-- Crear trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Política para permitir al sistema insertar
DROP POLICY IF EXISTS "System can insert user profiles" ON users;
CREATE POLICY "System can insert user profiles"
  ON users FOR INSERT
  WITH CHECK (true);

-- Verificar
SELECT 'Trigger y políticas configuradas!' as resultado;
```

3. Click en **"Run"** o presiona **Ctrl+Enter**

4. Deberías ver: `Trigger y políticas configuradas!`

---

## 3. Verificar URL del Sitio

1. En **Authentication** → **URL Configuration**

2. Asegúrate que tienes:
   - **Site URL**: `http://localhost:5173`

3. En **Redirect URLs**, agrega:
   - `http://localhost:5173/**`

4. Click en **Save**

---

## ✅ Checklist

Marca cada uno cuando lo completes:

- [ ] Email confirmations deshabilitadas
- [ ] Trigger SQL ejecutado
- [ ] Site URL configurada
- [ ] Navegador refrescado
- [ ] Intentar registro de nuevo

---

## 🧪 Después de Configurar

1. **Refresca tu navegador** (F5)
2. Intenta registrarte:
   - Username: `admin`
   - Email: `admin@partequipos.com`
   - Password: `admin123`
   - Role: `Administrator`
3. Click en "Sign Up"

---

## 🔍 Verificar en Base de Datos

Después de registrarte, verifica en Supabase:

### Ver usuarios en auth.users:
```sql
SELECT id, email, created_at 
FROM auth.users;
```

### Ver perfiles en users:
```sql
SELECT id, username, email, role 
FROM users;
```

Deberías ver tu usuario en ambas tablas.

---

## 🐛 Si Aún No Funciona

Abre la consola del navegador (F12) y busca errores rojos.
Cópiame exactamente qué dice.

