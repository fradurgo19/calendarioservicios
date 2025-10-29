# 🔐 Configuración de Variables de Entorno

Este documento explica cómo configurar las variables de entorno para el proyecto en diferentes ambientes.

## 📋 Variables Requeridas

El proyecto requiere las siguientes variables de entorno:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL del proyecto de Supabase | `https://abcdefgh.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima (pública) de Supabase | `eyJhbGciOiJIUzI1...` |

> ⚠️ **Importante**: El prefijo `VITE_` es necesario para que Vite exponga estas variables al frontend.

---

## 🏠 Desarrollo Local

### Opción 1: Archivo .env.local (Recomendado)

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase Configuration - DESARROLLO
VITE_SUPABASE_URL=https://tu-proyecto-dev.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_desarrollo
```

### Opción 2: Archivo .env

También puedes usar `.env` pero `.env.local` tiene prioridad y no debería commitearse.

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

### Verificar Variables Locales

Para verificar que las variables están cargadas:

```bash
# Inicia el servidor de desarrollo
npm run dev

# Si hay un error de "Missing Supabase environment variables"
# significa que las variables no están configuradas correctamente
```

---

## 🌐 Vercel (Producción)

### Configurar en Vercel Dashboard

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **Settings**
3. Click en **Environment Variables**
4. Agrega cada variable:

#### Variable 1: VITE_SUPABASE_URL

- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://tu-proyecto-prod.supabase.co`
- **Environment**: Selecciona todos (Production, Preview, Development)
- Click **Save**

#### Variable 2: VITE_SUPABASE_ANON_KEY

- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (tu clave completa)
- **Environment**: Selecciona todos (Production, Preview, Development)
- Click **Save**

### Configurar usando Vercel CLI

Alternativamente, puedes usar la CLI:

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Agregar variables
vercel env add VITE_SUPABASE_URL production
# Pega tu URL cuando te lo pida

vercel env add VITE_SUPABASE_ANON_KEY production
# Pega tu ANON_KEY cuando te lo pida

# Para preview/development
vercel env add VITE_SUPABASE_URL preview
vercel env add VITE_SUPABASE_ANON_KEY preview
```

### Verificar Variables en Vercel

Después de configurar:

1. Ve a **Settings** > **Environment Variables**
2. Deberías ver ambas variables listadas
3. Click en **Redeploy** para aplicar los cambios

---

## 🔍 Obtener las Credenciales de Supabase

### Paso 1: Acceder al Dashboard

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto

### Paso 2: Obtener URL

1. Ve a **Settings** (⚙️ en el sidebar)
2. Click en **API**
3. Copia **Project URL**
   - Ejemplo: `https://abcdefghijk.supabase.co`
   - Esta es tu `VITE_SUPABASE_URL`

### Paso 3: Obtener Anon Key

1. En la misma página (**Settings** > **API**)
2. Busca la sección **Project API keys**
3. Copia **anon public**
   - Ejemplo: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDAwMDAwMDAsImV4cCI6MTk1NTU3NjAwMH0...`
   - Esta es tu `VITE_SUPABASE_ANON_KEY`

> 💡 **Nota**: La clave `anon` es segura para usar en el frontend porque está limitada por Row Level Security (RLS).

---

## 🔐 Seguridad de Variables de Entorno

### ✅ Buenas Prácticas

1. **NUNCA** commitees archivos `.env` o `.env.local` al repositorio
2. **SIEMPRE** usa `.env.example` para documentar variables sin valores reales
3. **USA** `.env.local` para desarrollo local (ya está en `.gitignore`)
4. **ROTA** las claves si se exponen accidentalmente
5. **USA** diferentes proyectos de Supabase para desarrollo y producción

### ⚠️ Claves Expuestas

Si accidentalmente commiteas tus claves:

1. **Inmediatamente** rota la `ANON_KEY` en Supabase
2. Limpia el historial de Git:
   ```bash
   # Usando git filter-branch (peligroso, hacer backup)
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch .env" \
   --prune-empty --tag-name-filter cat -- --all
   
   # O usando BFG Repo Cleaner (recomendado)
   bfg --delete-files .env
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```
3. Actualiza las variables en Vercel
4. Fuerza push (con cuidado):
   ```bash
   git push origin --force --all
   ```

### 🔒 Verificar que .env está en .gitignore

```bash
# Verificar que .env está ignorado
cat .gitignore | grep .env

# Debería mostrar:
# .env
# *.local

# Verificar que no está trackeado
git status --ignored | grep .env
```

---

## 🧪 Testing de Variables

### Script de Verificación

Puedes crear un script para verificar que las variables están cargadas:

```typescript
// src/config/env.ts
export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

// Validación
if (!config.supabaseUrl || !config.supabaseAnonKey) {
  console.error('Environment variables:', {
    VITE_SUPABASE_URL: config.supabaseUrl ? '✅ Set' : '❌ Missing',
    VITE_SUPABASE_ANON_KEY: config.supabaseAnonKey ? '✅ Set' : '❌ Missing',
  });
  throw new Error('Missing required environment variables');
}

console.log('✅ All environment variables loaded successfully');
```

---

## 📝 Plantilla .env.example

El archivo `.env.example` debe verse así:

```env
# Supabase Configuration
# Obtén estas credenciales de: https://supabase.com/dashboard
# Settings > API

# Project URL (ej: https://abcdefgh.supabase.co)
VITE_SUPABASE_URL=

# anon (public) key (ej: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)
VITE_SUPABASE_ANON_KEY=

# Instrucciones:
# 1. Copia este archivo como .env.local
# 2. Llena los valores con tus credenciales de Supabase
# 3. NUNCA commitees .env.local al repositorio
```

---

## 🌍 Múltiples Ambientes

Si necesitas diferentes ambientes:

### Desarrollo

```env
# .env.development
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev_anon_key
```

### Staging

```env
# .env.staging
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=staging_anon_key
```

### Producción

```env
# .env.production
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod_anon_key
```

### Scripts para Cada Ambiente

```json
// package.json
{
  "scripts": {
    "dev": "vite --mode development",
    "build:staging": "vite build --mode staging",
    "build:prod": "vite build --mode production"
  }
}
```

---

## 🔄 Rotación de Claves

Para rotar claves de Supabase:

1. Ve a **Settings** > **API** en Supabase Dashboard
2. No puedes rotar la `anon` key directamente
3. Deberías crear un **nuevo proyecto** para producción
4. O contactar soporte de Supabase para asistencia

Para mejor seguridad:
- Usa proyectos separados para dev/staging/prod
- Implementa rate limiting
- Monitorea el uso de API
- Habilita RLS en todas las tablas

---

## 📞 Troubleshooting

### Error: "Missing Supabase environment variables"

**Solución**:
```bash
# 1. Verifica que el archivo .env.local existe
ls -la | grep .env

# 2. Verifica el contenido (sin mostrar las claves)
cat .env.local | grep VITE_SUPABASE

# 3. Reinicia el servidor de desarrollo
# Ctrl+C para detener
npm run dev
```

### Las variables no se actualizan

**Solución**:
```bash
# 1. Detén el servidor (Ctrl+C)
# 2. Limpia el cache
rm -rf node_modules/.vite

# 3. Reinicia
npm run dev
```

### Error en Vercel después de agregar variables

**Solución**:
1. Ve a Vercel Dashboard
2. Deployments
3. Click en los tres puntos del último deploy
4. Click en **Redeploy**

---

## ✅ Checklist de Configuración

- [ ] Archivo `.env.local` creado
- [ ] Variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` configuradas
- [ ] Credenciales obtenidas de Supabase Dashboard
- [ ] `.env.local` está en `.gitignore`
- [ ] Servidor de desarrollo funciona sin errores
- [ ] Variables configuradas en Vercel (si aplica)
- [ ] Deploy en Vercel exitoso
- [ ] Aplicación funciona en producción

---

**¿Necesitas ayuda?** Revisa la [documentación de Vite sobre variables de entorno](https://vitejs.dev/guide/env-and-mode.html).

