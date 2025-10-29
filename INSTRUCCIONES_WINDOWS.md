# 🪟 Instrucciones Específicas para Windows

Guía paso a paso para configurar y ejecutar el proyecto en Windows.

---

## 🎯 Inicio Rápido en Windows

### 1. Verificar Requisitos

Abre **PowerShell** o **Windows Terminal** y verifica:

```powershell
# Verificar Node.js (debe ser versión 18 o superior)
node --version

# Verificar npm
npm --version

# Si no tienes Node.js, descárgalo desde:
# https://nodejs.org/ (versión LTS)
```

### 2. Navegar al Proyecto

```powershell
# Navegar a la carpeta del proyecto
cd "C:\Users\Frank Duran\OneDrive - Partequipos S.A.S\Escritorio\CalendarioServicio\project"

# Verificar que estás en la carpeta correcta
Get-Location
```

### 3. Instalar Dependencias (Ya hecho ✅)

```powershell
# Las dependencias ya están instaladas, pero si necesitas reinstalar:
npm install
```

### 4. Crear Archivo de Configuración

```powershell
# Crear archivo .env.local
New-Item -Path .env.local -ItemType File

# Abrir con Notepad
notepad .env.local
```

En el Notepad, pega esto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_aqui
```

**Guarda y cierra** (Ctrl+S, luego cierra)

### 5. Obtener Credenciales de Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Inicia sesión o crea una cuenta
3. Click en **"New Project"**
4. Configura:
   - **Name**: `calendario-servicios-dev`
   - **Database Password**: (genera una segura)
   - **Region**: US East (o la más cercana)
5. Espera 2-3 minutos mientras se crea
6. Ve a **Settings** (icono ⚙️) > **API**
7. Copia **Project URL** y **anon public key**

### 6. Actualizar .env.local

```powershell
# Abrir de nuevo el archivo
notepad .env.local
```

Pega tus credenciales reales:

```env
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Guarda** (Ctrl+S)

### 7. Configurar Base de Datos

1. En Supabase Dashboard, ve a **SQL Editor**
2. Abre el archivo `DATABASE_SCHEMA.md` de este proyecto
3. Copia el primer bloque SQL (CREATE TABLE users...)
4. Pégalo en SQL Editor
5. Click **Run** (o F5)
6. Repite con todos los bloques SQL hasta terminar
7. Al final, ejecuta los INSERT de resources

### 8. Iniciar Servidor de Desarrollo

```powershell
# Asegúrate de estar en la carpeta del proyecto
cd "C:\Users\Frank Duran\OneDrive - Partequipos S.A.S\Escritorio\CalendarioServicio\project"

# Iniciar el servidor
npm run dev
```

Deberías ver algo como:

```
VITE v5.4.2  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### 9. Abrir en Navegador

```powershell
# Abrir automáticamente en Chrome
Start-Process "chrome.exe" "http://localhost:5173"

# O abrir en Edge
Start-Process "msedge.exe" "http://localhost:5173"

# O simplemente pega en cualquier navegador:
# http://localhost:5173
```

### 10. Crear Usuario

1. En la aplicación, click **"Registrarse"**
2. Completa el formulario
3. Click **"Registrarse"**
4. ¡Listo! Ya puedes usar la aplicación

---

## 🔧 Comandos Útiles en PowerShell

### Gestión del Proyecto

```powershell
# Ver estructura de carpetas
tree /F

# Ver archivos ocultos
Get-ChildItem -Force

# Limpiar cache de npm
Remove-Item -Recurse -Force node_modules
npm install

# Ver procesos de Node.js corriendo
Get-Process -Name node

# Matar proceso Node.js si se quedó colgado
Stop-Process -Name node -Force
```

### Git en Windows

```powershell
# Inicializar repositorio
git init

# Ver estado
git status

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "feat: configuración inicial"

# Ver historial
git log --oneline

# Crear rama
git checkout -b feature/nueva-funcionalidad

# Subir a GitHub (después de crear repo en GitHub)
git remote add origin https://github.com/tu-usuario/tu-repo.git
git branch -M main
git push -u origin main
```

### Variables de Entorno

```powershell
# Ver variables de entorno
Get-Content .env.local

# Verificar que existe
Test-Path .env.local

# Crear backup
Copy-Item .env.local .env.backup
```

---

## 🌐 Despliegue desde Windows

### Usando Vercel CLI

```powershell
# Instalar Vercel CLI globalmente
npm install -g vercel

# Verificar instalación
vercel --version

# Login en Vercel
vercel login
# Esto abrirá tu navegador para autenticarte

# Desplegar a preview
vercel

# Desplegar a producción
vercel --prod

# Ver logs
vercel logs
```

### Usando Git + Vercel Dashboard

```powershell
# 1. Asegúrate de tener Git instalado
git --version

# Si no tienes Git, descárgalo de:
# https://git-scm.com/download/win

# 2. Crear repositorio en GitHub
# Ve a https://github.com/new

# 3. Subir código
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/calendario-servicios.git
git push -u origin main

# 4. Ve a Vercel Dashboard (https://vercel.com)
# 5. Import repository
# 6. Configura variables de entorno
# 7. Deploy
```

---

## 🐛 Solución de Problemas en Windows

### Error: "npm no se reconoce como comando"

**Causa**: Node.js no instalado o no en PATH

**Solución**:
1. Instala Node.js desde https://nodejs.org/
2. Reinicia PowerShell
3. Verifica: `node --version`

### Error: "No se puede ejecutar scripts en este sistema"

**Causa**: Política de ejecución de PowerShell

**Solución**:
```powershell
# Ejecutar como Administrador
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Confirmar con 'Y'
```

### Error: "Puerto 5173 ya en uso"

**Causa**: Otro proceso usando el puerto

**Solución**:
```powershell
# Encontrar proceso en puerto 5173
netstat -ano | findstr :5173

# Ver el PID y matar el proceso
Stop-Process -Id XXXX -Force

# O cambiar puerto
$env:PORT=3000; npm run dev
```

### Error: "Missing Supabase environment variables"

**Causa**: Archivo .env.local no existe o está mal

**Solución**:
```powershell
# Verificar que existe
Test-Path .env.local

# Ver contenido
Get-Content .env.local

# Si no existe, créalo
New-Item .env.local -ItemType File
notepad .env.local
```

### Error: "EACCES: permission denied"

**Causa**: Permisos de carpeta

**Solución**:
```powershell
# Ejecutar como Administrador o cambiar permisos
# Click derecho en PowerShell > "Ejecutar como administrador"

# O mover proyecto a carpeta sin espacios/caracteres especiales
# Ejemplo: C:\Dev\calendario-servicios
```

### Aplicación no carga en navegador

**Solución**:
```powershell
# 1. Verificar que el servidor está corriendo
# Deberías ver "Local: http://localhost:5173/"

# 2. Verificar firewall de Windows
# Buscar "Firewall de Windows" > Permitir aplicación
# Agregar Node.js si no está

# 3. Probar con otra dirección
# http://127.0.0.1:5173

# 4. Limpiar cache del navegador
# Chrome: Ctrl+Shift+Del > Clear cache
```

---

## 📝 Editor de Código Recomendado

### Visual Studio Code

```powershell
# Instalar VS Code
# Descargar de: https://code.visualstudio.com/

# Abrir proyecto en VS Code
code .

# Extensiones recomendadas:
# - ESLint
# - Prettier
# - Tailwind CSS IntelliSense
# - TypeScript Vue Plugin (Volar)
```

### Configuración de VS Code

Crea `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## 🔥 Firewall de Windows

Si el proyecto no es accesible:

1. Buscar **"Firewall de Windows Defender"**
2. Click **"Permitir una aplicación..."**
3. Click **"Cambiar configuración"**
4. Click **"Permitir otra aplicación..."**
5. Buscar `node.exe` (usualmente en `C:\Program Files\nodejs\node.exe`)
6. Agregar y permitir en redes privadas

---

## 🎨 Tema de Windows (Batch Script)

Ya existe un script en el proyecto: `cambiar_tema_batch.bat`

```powershell
# Tema oscuro
.\cambiar_tema_batch.bat oscuro

# Tema claro
.\cambiar_tema_batch.bat claro

# Ver estado actual
.\cambiar_tema_batch.bat estado
```

---

## 🚀 Atajos de PowerShell Útiles

```powershell
# Navegar rápido a carpetas comunes
cd $HOME\Desktop
cd $HOME\Documents
cd $env:USERPROFILE

# Limpiar pantalla
cls

# Ver historial de comandos
Get-History

# Buscar en historial
Get-History | Where-Object {$_.CommandLine -like "*npm*"}

# Crear alias permanente
Set-Alias np notepad
# Agregar al perfil: notepad $PROFILE
```

---

## 📋 Checklist Windows

- [ ] Node.js 18+ instalado
- [ ] Git instalado (opcional pero recomendado)
- [ ] PowerShell / Windows Terminal
- [ ] VS Code instalado
- [ ] Proyecto descargado/clonado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo .env.local creado
- [ ] Credenciales de Supabase obtenidas
- [ ] Base de datos configurada
- [ ] Servidor corriendo (`npm run dev`)
- [ ] Aplicación abre en navegador
- [ ] Usuario de prueba creado

---

## 💡 Tips para Windows

1. **Usa Windows Terminal** en lugar de CMD para mejor experiencia
2. **WSL2** (Windows Subsystem for Linux) es opcional pero útil
3. **Git Bash** es una buena alternativa a PowerShell
4. **Configura .gitignore** para archivos de Windows (Thumbs.db, etc.)
5. **Usa paths relativos** siempre que sea posible
6. **OneDrive** puede causar problemas con node_modules, considera mover el proyecto

### Mover Proyecto fuera de OneDrive

```powershell
# Crear carpeta en C:
New-Item -Path "C:\Dev" -ItemType Directory

# Copiar proyecto
Copy-Item -Recurse "C:\Users\Frank Duran\OneDrive - Partequipos S.A.S\Escritorio\CalendarioServicio\project" "C:\Dev\calendario-servicios"

# Navegar
cd C:\Dev\calendario-servicios

# Reinstalar dependencias
Remove-Item -Recurse node_modules
npm install
```

---

## 🎓 Recursos para Desarrollo en Windows

- [Node.js Windows Guidelines](https://nodejs.org/en/docs/guides)
- [PowerShell Documentation](https://docs.microsoft.com/en-us/powershell/)
- [VS Code on Windows](https://code.visualstudio.com/docs/setup/windows)
- [Git for Windows](https://git-scm.com/download/win)
- [Windows Terminal](https://aka.ms/terminal)

---

**¡Listo para desarrollar en Windows! 🪟💻**

Si tienes problemas, consulta la sección de troubleshooting o las otras guías del proyecto.

