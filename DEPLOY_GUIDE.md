# 🚀 Guía de Despliegue - Calendario de Servicios

Esta guía te llevará paso a paso desde el desarrollo local hasta la producción en Vercel con base de datos en Neon.

## 📑 Tabla de Contenidos

1. [Configuración Local](#1-configuración-local)
2. [Configuración de Base de Datos en Neon](#2-configuración-de-base-de-datos-en-neon)
3. [Configuración de Supabase con Neon](#3-configuración-de-supabase-con-neon)
4. [Despliegue en Vercel](#4-despliegue-en-vercel)
5. [Verificación Post-Despliegue](#5-verificación-post-despliegue)

---

## 1. Configuración Local

### Paso 1.1: Instalar Dependencias

```bash
cd project
npm install
```

### Paso 1.2: Verificar Instalación

```bash
npm run typecheck
npm run lint
```

Si hay errores, corrígelos antes de continuar.

### Paso 1.3: Crear Archivo .env.local

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto-dev.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_desarrollo
```

---

## 2. Configuración de Base de Datos en Neon

### Paso 2.1: Crear Proyecto en Neon

1. Ve a [https://neon.tech](https://neon.tech)
2. Crea una cuenta si no la tienes
3. Click en "Create Project"
4. Configura:
   - **Project name**: `calendario-servicios-prod`
   - **Region**: Selecciona la más cercana (ej: US East)
   - **PostgreSQL Version**: 15 o superior

### Paso 2.2: Ejecutar Setup SQL

1. En tu proyecto de Neon, ve a **SQL Editor**
2. Abre el archivo `SETUP_NEON.sql` de este repositorio
3. Copia todo el contenido
4. Pégalo en el SQL Editor de Neon
5. Click en "Run" o presiona Ctrl+Enter
6. Espera a que se ejecute (debería tomar ~10 segundos)

### Paso 2.3: Verificar Tablas Creadas

Ejecuta este query en Neon para verificar:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deberías ver estas tablas:
- assignments
- pending_items
- quote_assignments
- quote_entries
- resources
- service_entries
- users

### Paso 2.4: Guardar Connection String

1. En tu proyecto de Neon, ve a **Dashboard**
2. Copia el **Connection String**
3. Debería verse así: `postgresql://user:password@ep-xxxxx.region.aws.neon.tech/dbname`
4. Guárdalo en un lugar seguro (lo necesitarás para Supabase)

---

## 3. Configuración de Supabase con Neon

### Opción A: Usar Solo Neon (Recomendado para producción)

Si solo quieres usar Neon sin Supabase Auth:

1. **Instalar un adaptador de autenticación personalizado**
2. **Modificar `src/services/supabase.ts`** para usar la conexión directa a Neon
3. **Implementar JWT tokens manualmente**

> ⚠️ **Nota**: Esta opción requiere más configuración. Se recomienda Opción B para simplicidad.

### Opción B: Supabase + Neon (Recomendado)

#### Paso 3.1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click en "New Project"
3. Configura:
   - **Organization**: Selecciona o crea una
   - **Name**: `calendario-servicios`
   - **Database Password**: Genera una segura
   - **Region**: La misma que elegiste en Neon
   - **Pricing Plan**: Free (para empezar)

#### Paso 3.2: Conectar Neon a Supabase

1. En Supabase, ve a **Settings** > **Database**
2. Encuentra la sección **Connection String**
3. **NO uses la de Supabase**, en su lugar:
   - Ve a **Settings** > **Database** > **Connection Pooling**
   - Habilita "Use connection pooling"
   - Configura el modo como "Transaction"
   
4. Necesitarás configurar Supabase para usar Neon:
   - Copia el connection string de Neon
   - Contacta soporte de Supabase o usa la API de gestión

> 💡 **Alternativa Simplificada**: Por ahora, usa la base de datos que viene con Supabase, y luego migra a Neon cuando escales.

#### Paso 3.3: Ejecutar Schema en Supabase

1. En Supabase, ve a **SQL Editor**
2. Abre el archivo `DATABASE_SCHEMA.md` de este repositorio
3. Copia cada bloque SQL y ejecútalo en orden
4. Verifica que todas las tablas se crearon

#### Paso 3.4: Habilitar Autenticación

1. Ve a **Authentication** > **Settings**
2. Habilita **Email Auth**
3. Configura la **Site URL**: `http://localhost:5173` (cambiarás esto después)
4. Agrega **Redirect URLs**: 
   - `http://localhost:5173/**`
   - `https://tu-dominio.vercel.app/**` (después del deploy)

#### Paso 3.5: Obtener Credenciales

1. Ve a **Settings** > **API**
2. Copia:
   - **Project URL**: Esta será tu `VITE_SUPABASE_URL`
   - **anon public**: Esta será tu `VITE_SUPABASE_ANON_KEY`

#### Paso 3.6: Actualizar .env.local

Actualiza tu archivo `.env.local`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Paso 3.7: Probar Localmente

```bash
npm run dev
```

1. Abre http://localhost:5173
2. Ve a la página de registro
3. Crea un usuario de prueba
4. Verifica que puedes iniciar sesión

---

## 4. Despliegue en Vercel

### Paso 4.1: Preparar Git Repository

```bash
# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Commit
git commit -m "feat: setup inicial para producción"

# Crear repositorio en GitHub y subir
git remote add origin https://github.com/tu-usuario/calendario-servicios.git
git branch -M main
git push -u origin main
```

### Paso 4.2: Conectar Vercel a GitHub

1. Ve a [https://vercel.com](https://vercel.com)
2. Inicia sesión con GitHub
3. Click en **Add New** > **Project**
4. Busca tu repositorio `calendario-servicios`
5. Click en **Import**

### Paso 4.3: Configurar Variables de Entorno

En la pantalla de configuración de Vercel:

1. Expande **Environment Variables**
2. Agrega las siguientes variables:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://tu-proyecto.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `tu_anon_key` | Production, Preview, Development |

3. Click en **Deploy**

### Paso 4.4: Esperar el Build

El build debería tomar 2-3 minutos. Vercel ejecutará:

```bash
npm install
npm run build
```

### Paso 4.5: Obtener URL de Producción

Una vez completado el deploy:

1. Vercel mostrará tu URL: `https://tu-proyecto.vercel.app`
2. Click en "Visit" para ver tu app en producción

---

## 5. Verificación Post-Despliegue

### Paso 5.1: Actualizar URLs en Supabase

1. Ve a tu proyecto en Supabase
2. **Authentication** > **URL Configuration**
3. Actualiza:
   - **Site URL**: `https://tu-proyecto.vercel.app`
   - **Redirect URLs**: Agrega `https://tu-proyecto.vercel.app/**`

### Paso 5.2: Probar la Aplicación

1. Ve a `https://tu-proyecto.vercel.app`
2. Verifica que el login funciona
3. Crea un usuario de prueba
4. Prueba crear una entrada de servicio
5. Prueba el drag & drop de recursos
6. Verifica las otras páginas (Cotizaciones, Pendientes)

### Paso 5.3: Crear Usuario Administrador

Ejecuta este SQL en Supabase:

```sql
-- Primero, crea el usuario en Supabase Auth
-- Luego actualiza su rol en la tabla users
UPDATE users 
SET role = 'Administrator' 
WHERE email = 'tu-email@partequipos.com';
```

O desde el panel de Supabase Auth, puedes crear usuarios manualmente.

### Paso 5.4: Monitoreo

1. **Vercel Analytics**: Ve a tu proyecto > Analytics
2. **Supabase Logs**: Monitorea queries en Database > Logs
3. **Error Tracking**: Revisa los logs de Vercel si hay errores

---

## 🔄 Flujo de Trabajo Continuo

### Desarrollo

```bash
# Crear rama para nueva feature
git checkout -b feature/nueva-funcionalidad

# Hacer cambios
# ... editar código ...

# Commit
git add .
git commit -m "feat: descripción del cambio"

# Push
git push origin feature/nueva-funcionalidad
```

### Deploy Automático

1. Crea un Pull Request en GitHub
2. Vercel creará un **Preview Deploy** automáticamente
3. Revisa el preview
4. Merge el PR a `main`
5. Vercel desplegará automáticamente a producción

### Rollback

Si algo sale mal:

```bash
# En Vercel Dashboard
# 1. Ve a Deployments
# 2. Encuentra el deployment anterior que funcionaba
# 3. Click en los tres puntos
# 4. Click en "Promote to Production"
```

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Build local para probar
npm run build
npm run preview

# Verificar antes de commit
npm run build:check

# Deploy a preview (requiere Vercel CLI)
npm run deploy:preview

# Deploy a producción (requiere Vercel CLI)
npm run deploy:vercel
```

---

## 🐛 Troubleshooting Común

### Error: "Missing Supabase environment variables"

**Causa**: Variables de entorno no configuradas en Vercel

**Solución**:
1. Ve a Vercel > Settings > Environment Variables
2. Verifica que ambas variables están presentes
3. Redespliega: Deployments > tres puntos > Redeploy

### Error 500 en producción

**Causa**: Error de conexión a base de datos o política RLS

**Solución**:
1. Verifica logs en Vercel
2. Verifica que las tablas existen en Supabase
3. Verifica las políticas RLS en Supabase

### Build falla en Vercel

**Causa**: Errores de TypeScript o ESLint

**Solución**:
```bash
# Local
npm run typecheck
npm run lint

# Corrige los errores
# Commit y push
```

### Usuarios no pueden registrarse

**Causa**: Configuración de Auth en Supabase

**Solución**:
1. Verifica que Email Auth está habilitado
2. Verifica las Redirect URLs
3. Revisa los logs en Supabase > Authentication > Logs

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs en Vercel: `vercel logs`
2. Revisa los logs en Supabase: Dashboard > Logs
3. Busca en la documentación oficial:
   - [Vercel Docs](https://vercel.com/docs)
   - [Supabase Docs](https://supabase.com/docs)
   - [Neon Docs](https://neon.tech/docs)

---

## ✅ Checklist de Despliegue

Usa este checklist para asegurarte de que todo está configurado:

- [ ] Neon proyecto creado
- [ ] Base de datos setup ejecutado en Neon
- [ ] Supabase proyecto creado
- [ ] Schema ejecutado en Supabase
- [ ] Autenticación habilitada en Supabase
- [ ] Variables de entorno configuradas localmente (.env.local)
- [ ] Aplicación funciona en local (`npm run dev`)
- [ ] Código subido a GitHub
- [ ] Proyecto importado en Vercel
- [ ] Variables de entorno configuradas en Vercel
- [ ] Deploy exitoso en Vercel
- [ ] URLs actualizadas en Supabase
- [ ] Aplicación probada en producción
- [ ] Usuario administrador creado
- [ ] Datos seed cargados (resources)

---

**¡Felicidades!** 🎉 Tu aplicación está en producción.

