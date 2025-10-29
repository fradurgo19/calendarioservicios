# 📚 Guía Paso a Paso: Crear Base de Datos PostgreSQL Local

Esta guía te llevará paso a paso para crear y configurar la base de datos PostgreSQL 17 local para el proyecto Calendario de Servicios.

---

## 📋 Prerrequisitos

- PostgreSQL 17 instalado
- Cliente SQL instalado (puedes usar uno de estos):
  - **psql** (línea de comandos, viene con PostgreSQL)
  - **pgAdmin 4** (interfaz gráfica recomendada)
  - **DBeaver** (interfaz gráfica multiplataforma)
  - **PostgreSQL Shell** (si instalaste PostgreSQL Desktop)

---

## 🚀 Paso 1: Verificar Instalación de PostgreSQL

### Opción A: Usando Línea de Comandos (psql)

1. Abre **PowerShell** o **Command Prompt** (CMD)
2. Ej:


```bash
psql --version
```
3. Deberías ver algo como: `psql (PostgreSQL) 17.x`

### Opción B: Usando pgAdmin

1. Abre **pgAdmin 4** desde el menú de inicio
2. Si se abre correctamente, PostgreSQL está instalado

---

## 🗄️ Paso 2: Crear la Base de Datos

> **📌 Importante:** La base de datos se crea **dentro del servidor PostgreSQL**, no es un archivo o directorio que tú elijas. PostgreSQL maneja automáticamente dónde almacenar los archivos físicos (generalmente en `C:\Program Files\PostgreSQL\17\data`).

### Opción A: Crear BD usando psql

1. Abre PowerShell o CMD (puedes estar en cualquier directorio)
2. Conéctate al servidor PostgreSQL (usa tu contraseña del postgres):

```bash
psql -U postgres
```

3. Si pide contraseña, ingresa la contraseña que configuraste durante la instalación

4. Una vez conectado, ejecuta:

```sql
-- Crear la base de datos
CREATE DATABASE calendario_servicios;

-- Verificar que se creó
\l

-- Salir de psql
\q
```

### Opción B: Crear BD usando pgAdmin 4

1. Abre **pgAdmin 4**
2. Expande **Servers** en el panel izquierdo
3. Expande **PostgreSQL 17**
4. Click derecho en **Databases** → **Create** → **Database...**
5. En la ventana que se abre:
   - **Database name**: `calendario_servicios`
   - **Owner**: `postgres` (por defecto)
6. Click en **Save**

---

## 📝 Paso 3: Preparar el Script SQL

1. Abre el archivo `SETUP_POSTGRES_LOCAL.sql` en tu editor de texto favorito
2. Revisa que el script esté completo (debe tener todas las secciones)
3. Guárdalo en una ubicación fácil de encontrar (por ejemplo: `C:\Scripts\`)

---

## ⚡ Paso 4: Ejecutar el Script SQL

### Opción A: Ejecutar usando psql (Recomendado)

1. Abre PowerShell o CMD
2. **IMPORTANTE:** Navega primero al directorio donde está el script SQL:

```bash
cd "C:\Users\Frank Duran\OneDrive - Partequipos S.A.S\Escritorio\CalendarioServicio\project"
```

3. Verifica que el archivo esté ahí:

```bash
dir SETUP_POSTGRES_LOCAL.sql
```

4. Ahora sí, ejecuta el script:

```bash
psql -U postgres -d calendario_servicios -f SETUP_POSTGRES_LOCAL.sql
```

4. Ingresa tu contraseña cuando se solicite
5. Espera a que termine la ejecución (verás mensajes de "CREATE TABLE", "CREATE INDEX", etc.)

**Si todo salió bien, verás:**
```
NOTICE: ========================================
NOTICE: Setup completado exitosamente!
...
Tablas creadas correctamente!
total_fases | total_usuarios
------------+---------------
         16 |             1
```

### Opción B: Ejecutar usando pgAdmin 4

1. Abre **pgAdmin 4**
2. Expande **Servers** → **PostgreSQL 17** → **Databases** → **calendario_servicios**
3. Click derecho en **calendario_servicios** → **Query Tool...**
4. En el editor de consultas, abre el archivo:
   - Click en el icono de carpeta 📁 en la barra de herramientas
   - Navega a `SETUP_POSTGRES_LOCAL.sql`
   - Selecciónalo y ábrelo
5. Verifica que el script completo esté en el editor
6. Click en el botón **Execute/Refresh** (⚡) o presiona `F5`
7. Espera a que termine la ejecución
8. Revisa el panel de mensajes en la parte inferior (debe decir "Query returned successfully")

### Opción C: Ejecutar usando DBeaver

1. Abre **DBeaver**
2. Conéctate a tu base de datos PostgreSQL:
   - Click derecho en **Databases** → **New Database Connection**
   - Selecciona **PostgreSQL**
   - Configura:
     - **Host**: `localhost`
     - **Port**: `5432`
     - **Database**: `calendario_servicios`
     - **Username**: `postgres`
     - **Password**: (tu contraseña)
   - Click **Test Connection** → Si funciona, click **Finish**
3. Click derecho en la conexión → **SQL Editor** → **Open SQL Script**
4. Selecciona `SETUP_POSTGRES_LOCAL.sql`
5. Verifica que el script esté completo
6. Click en el botón **Execute SQL Script** (⚡) o presiona `Ctrl+Enter`
7. Espera a que termine la ejecución

---

## ✅ Paso 5: Verificar que Todo Funcionó

### Opción A: Verificar usando psql

1. Conéctate a la base de datos:

```bash
psql -U postgres -d calendario_servicios
```

2. Verifica las tablas creadas:

```sql
-- Listar todas las tablas
\dt

-- Deberías ver 8 tablas:
-- assignments, pending_items, quote_assignments, quote_entries,
-- resources, sedes, service_entries, users

-- Verificar que la tabla sedes existe
SELECT * FROM sedes;

-- Verificar recursos (fases) creados
SELECT COUNT(*) as total_fases FROM resources WHERE type = 'phase';

-- Verificar usuario admin creado
SELECT username, email, role FROM users;
```

3. Salir:

```sql
\q
```

### Opción B: Verificar usando pgAdmin 4

1. En pgAdmin 4, expande **calendario_servicios** → **Schemas** → **public** → **Tables**
2. Deberías ver 8 tablas:
   - assignments
   - pending_items
   - quote_assignments
   - quote_entries
   - resources
   - sedes
   - service_entries
   - users

3. Click derecho en **sedes** → **View/Edit Data** → **All Rows**
   - Debe estar vacía (sin errores)

4. Click derecho en **resources** → **View/Edit Data** → **All Rows**
   - Debe mostrar 16 filas (F1, F2, ..., F16)

5. Click derecho en **users** → **View/Edit Data** → **All Rows**
   - Debe mostrar 1 fila (usuario admin)

---

## 🔧 Paso 6: Configurar Conexión en la Aplicación

1. Abre el archivo de configuración de Supabase en tu proyecto
2. Busca el archivo donde está la configuración de la conexión (probablemente en `src/services/supabase.ts` o similar)
3. Actualiza las credenciales para que apunten a tu PostgreSQL local:

```typescript
// Ejemplo de configuración (ajusta según tu setup)
const supabaseUrl = 'http://localhost:54321' // Solo si usas Supabase local
// O si usas directamente PostgreSQL:
// Necesitarás cambiar la conexión a usar directamente el cliente de PostgreSQL
```

**Nota:** Si la aplicación usa Supabase client, puedes:
- Usar Supabase local (docker) o
- Cambiar a usar un cliente PostgreSQL directo (pg) para desarrollo local

---

## 🐛 Solución de Problemas Comunes

### Error: "psql: command not found"
**Solución:**
- Agrega PostgreSQL al PATH:
  1. Busca la carpeta `bin` de PostgreSQL (ej: `C:\Program Files\PostgreSQL\17\bin`)
  2. Agrega esa ruta a las Variables de Entorno del sistema

### Error: "password authentication failed"
**Solución:**
- Verifica que estés usando el usuario `postgres` con la contraseña correcta
- Si olvidaste la contraseña:
  1. Edita `pg_hba.conf` (ubicado en la carpeta de datos de PostgreSQL)
  2. Cambia `md5` a `trust` temporalmente
  3. Reinicia PostgreSQL
  4. Cambia la contraseña: `ALTER USER postgres PASSWORD 'nueva_contraseña';`
  5. Vuelve a cambiar `trust` a `md5` en `pg_hba.conf`

### Error: "database already exists"
**Solución:**
- La base de datos ya existe. Puedes:
  - Usarla directamente, o
  - Eliminarla: `DROP DATABASE calendario_servicios;` y volver a crearla

### Error: "relation already exists"
**Solución:**
- Las tablas ya existen. El script usa `CREATE TABLE IF NOT EXISTS`, pero si hay errores, puedes:
  - Eliminar las tablas manualmente, o
  - Usar `DROP TABLE IF EXISTS nombre_tabla CASCADE;` antes de crear

### Error al ejecutar el script completo
**Solución:**
- Ejecuta el script por secciones:
  1. Primero las extensiones
  2. Luego las tablas una por una
  3. Finalmente los triggers y datos iniciales

---

## 📊 Verificación Final

Ejecuta estas consultas para verificar que todo está correcto:

```sql
-- Conectarte
psql -U postgres -d calendario_servicios

-- 1. Ver todas las tablas
\dt

-- 2. Ver estructura de la tabla sedes
\d sedes

-- 3. Verificar columnas sede_id en otras tablas
SELECT column_name, table_name 
FROM information_schema.columns 
WHERE column_name = 'sede_id';

-- 4. Verificar datos iniciales
SELECT 'Recursos (Fases)' as tipo, COUNT(*) as total FROM resources WHERE type = 'phase'
UNION ALL
SELECT 'Usuarios' as tipo, COUNT(*) as total FROM users;

-- 5. Verificar triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE event_object_schema = 'public';
```

---

## ✨ ¡Listo!

Tu base de datos está lista. Ahora puedes:
1. Iniciar tu aplicación React
2. La aplicación debería conectarse a la base de datos
3. Puedes crear sedes desde la interfaz web
4. Todos los nuevos registros se asociarán con la sede seleccionada

---

## 📞 Próximos Pasos

1. **Crear tu primera sede:**
   - Abre la aplicación en el navegador
   - Ve a la página de Gestión de Sedes (`/sedes`)
   - Crea tu primera sede (ej: "Barranquilla", código "BAQ")

2. **Iniciar a usar la aplicación:**
   - Selecciona una sede al iniciar
   - Crea servicios, cotizaciones y pendientes
   - Todo quedará asociado a la sede seleccionada

---

**¿Necesitas ayuda?** Revisa los logs de PostgreSQL para más detalles sobre cualquier error.

