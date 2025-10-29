# ⚡ Quick Start - Inicio Rápido

Guía rápida para poner en marcha el proyecto en **5 minutos**.

## 🎯 Para Desarrollo Local

### 1. Instalar (1 minuto)

```bash
cd project
npm install
```

### 2. Configurar Variables (2 minutos)

Crea archivo `.env.local`:

```bash
# Windows (PowerShell)
New-Item .env.local

# Mac/Linux
touch .env.local
```

Edítalo y agrega:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_aqui
```

### 3. Configurar Base de Datos (1 minuto)

1. Ve a [supabase.com](https://supabase.com)
2. Crea un proyecto
3. SQL Editor → copia/pega cada bloque de `DATABASE_SCHEMA.md`
4. Run

### 4. Correr (30 segundos)

```bash
npm run dev
```

Abre: http://localhost:5173

### 5. Crear Usuario (30 segundos)

1. Click en "Registrarse"
2. Completa el formulario
3. ¡Listo!

---

## 🚀 Para Producción en Vercel

### 1. Push a GitHub (1 minuto)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main
```

### 2. Conectar Vercel (2 minutos)

1. Ve a [vercel.com](https://vercel.com)
2. Import repository
3. Agrega variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

### 3. Actualizar Supabase (1 minuto)

En Supabase → Authentication → URL Configuration:
- Site URL: `https://tu-proyecto.vercel.app`
- Redirect URLs: `https://tu-proyecto.vercel.app/**`

---

## 📱 Próximos Pasos

Después del setup:

1. **Crear usuario admin**:
   ```sql
   UPDATE users SET role = 'Administrator' 
   WHERE email = 'tu-email@example.com';
   ```

2. **Verificar datos seed**:
   ```sql
   SELECT COUNT(*) FROM resources;
   -- Debería retornar 23 (4 técnicos + 3 admins + 16 fases)
   ```

3. **Probar funcionalidades**:
   - ✅ Login/Logout
   - ✅ Crear servicio
   - ✅ Asignar recursos (drag & drop)
   - ✅ Ver cotizaciones
   - ✅ Gestionar pendientes

---

## 🆘 Problemas Comunes

### "Missing Supabase environment variables"
→ Verifica tu archivo `.env.local`

### No puedo hacer login
→ Verifica que creaste el usuario en Supabase Auth

### La página está en blanco
→ Abre DevTools Console (F12) y reporta el error

### Build falla en Vercel
→ Ejecuta localmente: `npm run build:check`

---

## 📚 Documentación Completa

- **Setup detallado**: `README.md`
- **Guía de despliegue**: `DEPLOY_GUIDE.md`
- **Variables de entorno**: `ENV_SETUP.md`
- **Schema de BD**: `DATABASE_SCHEMA.md`

---

## 🎉 ¡Eso es todo!

Ahora tienes el proyecto corriendo. Si necesitas ayuda, lee la documentación completa en `README.md`.

