# 🔧 Configurar Aplicación para PostgreSQL Local

La aplicación actualmente usa Supabase. Para conectarla a PostgreSQL local, necesitamos instalar y configurar **PostgREST**, que es lo que usa Supabase internamente y expone una API REST sobre PostgreSQL.

---

## 📋 Opciones de Conexión

### Opción 1: PostgREST Local (Recomendada) ⭐

PostgREST crea una API REST sobre PostgreSQL, compatible con el cliente de Supabase.

---

## 🚀 Opción 1: Instalar y Configurar PostgREST

### Paso 1: Descargar PostgREST

1. Ve a: https://github.com/PostgREST/postgrest/releases
2. Descarga la versión para Windows (ej: `postgrest-v12.x.x-windows-x64.zip`)
3. Descomprime el archivo en una carpeta (ej: `C:\PostgREST\`)
4. Renombra el ejecutable a `postgrest.exe` si es necesario

### Paso 2: Crear Archivo de Configuración

Crea un archivo `postgrest.conf` en la misma carpeta donde está `postgrest.exe`:

```ini
# PostgREST Configuration para PostgreSQL Local
db-uri = "postgresql://postgres:TU_CONTRASEÑA@localhost:5432/calendario_servicios"
db-schema = "public"
db-anon-role = "postgres"
server-host = "127.0.0.1"
server-port = 3001
```

**⚠️ IMPORTANTE:** Reemplaza `TU_CONTRASEÑA` con tu contraseña real de PostgreSQL.

### Paso 3: Crear Usuario/Rol Anónimo (Opcional pero Recomendado)

Para mayor seguridad, crea un rol específico para PostgREST:

```sql
-- Conéctate a PostgreSQL
psql -U postgres -d calendario_servicios

-- Crear rol anónimo
CREATE ROLE anon;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Dar permisos también para tablas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT USAGE, SELECT ON SEQUENCES TO anon;

-- Salir
\q
```

Luego actualiza `postgrest.conf`:

```ini
db-uri = "postgresql://postgres:TU_CONTRASEÑA@localhost:5432/calendario_servicios"
db-schema = "public"
db-anon-role = "anon"
server-host = "127.0.0.1"
server-port = 3001
```

### Paso 4: Ejecutar PostgREST

1. Abre PowerShell o CMD en la carpeta donde está `postgrest.exe`
2. Ejecuta:

```bash
.\postgrest.exe postgrest.conf
```

Deberías ver algo como:
```
Listening on port 3001
```

**Mantén esta ventana abierta** mientras uses la aplicación.

### Paso 5: Configurar Variables de Entorno

1. Crea un archivo `.env.local` en la raíz del proyecto:

```env
# PostgreSQL Local con PostgREST
VITE_SUPABASE_URL=http://localhost:3001
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

Esta clave es una clave dummy que acepta PostgREST cuando no hay autenticación JWT configurada.

2. **Reinicia el servidor de desarrollo** de Vite (Ctrl+C y luego `npm run dev`)

---

## ✅ Verificar que Funciona

1. **PostgREST debe estar ejecutándose** (ventana abierta)
2. Abre tu navegador en: http://localhost:3001
3. Deberías ver un JSON con información de las tablas disponibles
4. Prueba acceder a: http://localhost:3001/sedes
5. Deberías ver las sedes (vacío si no has creado ninguna)

---

## 🎯 Opción 2: Script para Iniciar PostgREST Automáticamente

Crea un archivo `iniciar-postgrest.bat` en la carpeta del proyecto:

```batch
@echo off
echo Iniciando PostgREST...
echo.
cd /d "C:\PostgREST"
start "PostgREST" cmd /k "postgrest.exe postgrest.conf"
echo PostgREST iniciado en http://localhost:3001
echo.
pause
```

---

## 🔧 Solución de Problemas

### Error: "could not connect to server"
- Verifica que PostgreSQL esté ejecutándose
- Verifica la contraseña en `postgrest.conf`
- Verifica el nombre de la base de datos

### Error: "permission denied"
- Verifica que el usuario `postgres` tenga permisos en la base de datos
- O usa el rol `anon` como se explicó arriba

### La aplicación sigue intentando conectarse a Supabase
- Verifica que `.env.local` exista y tenga las variables correctas
- Reinicia el servidor de desarrollo (`npm run dev`)
- Limpia la caché del navegador (Ctrl+Shift+R)

### PostgREST no responde
- Verifica que PostgREST esté ejecutándose
- Verifica que el puerto 3001 no esté siendo usado por otro programa
- Revisa los logs de PostgREST en la ventana donde lo ejecutaste

---

## 📝 Resumen Rápido

1. ✅ Descarga PostgREST
2. ✅ Crea `postgrest.conf` con la configuración
3. ✅ (Opcional) Crea rol `anon` en PostgreSQL
4. ✅ Ejecuta PostgREST (`.\postgrest.exe postgrest.conf`)
5. ✅ Crea `.env.local` con `VITE_SUPABASE_URL=http://localhost:3001`
6. ✅ Reinicia el servidor de desarrollo
7. ✅ ¡Listo! La aplicación debería conectarse a PostgreSQL local

---

## 🚀 Alternativa Más Simple: Usar Supabase CLI Local

Si prefieres una solución más simple que no requiera configuración manual:

### Instalar Supabase CLI

```bash
# Con npm
npm install -g supabase

# O con chocolatey (Windows)
choco install supabase
```

### Inicializar Supabase Local

```bash
# En la carpeta del proyecto
supabase init
supabase start
```

Esto iniciará Supabase local en Docker, pero apuntará a tu PostgreSQL local. Sin embargo, esto requiere Docker instalado.

---

¿Necesitas ayuda con alguna de estas opciones?

