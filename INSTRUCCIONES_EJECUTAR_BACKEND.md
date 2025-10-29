# 📍 Instrucciones para Ejecutar el Backend

## ⚠️ IMPORTANTE: Ubicación Correcta

**Debes ejecutar el comando desde la RAIZ del proyecto**, no desde la carpeta `server/`.

La ruta correcta es:
```
C:\Users\Frank Duran\OneDrive - Partequipos S.A.S\Escritorio\CalendarioServicio\project
```

## 📝 Pasos:

### 1. Navegar a la raíz del proyecto

En PowerShell:
```powershell
cd "C:\Users\Frank Duran\OneDrive - Partequipos S.A.S\Escritorio\CalendarioServicio\project"
```

O simplemente abre una terminal en la carpeta `project` (no en `project\server`).

### 2. Verificar que estás en la ubicación correcta

Deberías ver el archivo `package.json`:
```powershell
ls package.json
```

### 3. Agregar contraseña a server/.env (si aún no lo has hecho)

Edita el archivo `server/.env` y agrega tu contraseña de PostgreSQL:
```env
DB_PASSWORD=tu_contraseña_aqui
```

### 4. Ejecutar el servidor

```powershell
npm run dev:server
```

### 5. Verificar que funciona

Deberías ver:
```
🚀 Servidor corriendo en http://localhost:3000
📡 Health check: http://localhost:3000/health
```

Luego prueba en el navegador: http://localhost:3000/health

## 🔧 Si ves errores:

### Error: "Cannot find module"
- Asegúrate de estar en la raíz del proyecto (donde está `package.json`)
- NO estés en la carpeta `server/`

### Error: "Cannot connect to database"
- Verifica que PostgreSQL esté ejecutándose
- Verifica que la contraseña en `server/.env` sea correcta
- Verifica que la base de datos `calendario_servicios` exista

