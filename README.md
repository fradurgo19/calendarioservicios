# 📅 Calendario de Servicios - Partequipos S.A.S

Sistema de gestión de calendario para servicios técnicos, cotizaciones y tareas pendientes. Desarrollado con React, TypeScript, Supabase y TailwindCSS.

## 🚀 Características

- **Calendario de Servicios**: Gestiona servicios y preparaciones con asignación de recursos (técnicos, administradores, fases)
- **Calendario de Cotizaciones**: Administra cotizaciones programadas por fecha
- **Gestión de Pendientes**: Sistema de tareas pendientes con fechas de vencimiento
- **Autenticación**: Sistema de login con roles (Administrator, User, Sales)
- **Drag & Drop**: Interfaz intuitiva para asignar recursos
- **Responsive**: Diseño adaptable a móviles y tablets

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta en Supabase o Neon Database
- Git

## 🛠️ Instalación Local

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd project
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

### 4. Configurar la base de datos

#### Opción A: Usando Supabase

1. Ve a [Supabase](https://supabase.com) y crea un nuevo proyecto
2. En el SQL Editor, ejecuta el archivo `DATABASE_SCHEMA.md` (copia y pega cada bloque SQL)
3. Habilita la autenticación por email en Settings > Authentication
4. Copia tu URL y Anon Key desde Settings > API

#### Opción B: Usando Neon (Recomendado para producción)

1. Ve a [Neon](https://neon.tech) y crea un nuevo proyecto
2. En la consola SQL, ejecuta el archivo `SETUP_NEON.sql` completo
3. Configura Supabase para usar Neon como backend:
   - Crea un proyecto en Supabase
   - Conecta tu database de Neon
   - Copia las credenciales

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 6. Crear usuario administrador

Usa el siguiente SQL para crear tu primer usuario administrador:

```sql
INSERT INTO users (username, email, password_hash, role)
VALUES (
  'admin',
  'tu-email@partequipos.com',
  'hash_de_tu_contraseña',
  'Administrator'
);
```

**Nota**: Necesitarás hashear la contraseña usando bcrypt antes de insertarla.

## 🌐 Despliegue en Vercel

### Preparación

1. **Asegúrate de tener tu base de datos configurada** (Supabase o Neon)
2. **Verifica que el archivo `vercel.json` existe** en la raíz del proyecto (ya está incluido)

### Despliegue

#### Opción 1: Usando el CLI de Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login en Vercel
vercel login

# Desplegar
vercel

# Configurar variables de entorno en Vercel
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Desplegar a producción
vercel --prod
```

#### Opción 2: Usando la interfaz de Vercel

1. Ve a [Vercel](https://vercel.com) y conecta tu repositorio de GitHub
2. Importa el proyecto
3. Configura las variables de entorno:
   - `VITE_SUPABASE_URL`: Tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY`: Tu Anon Key de Supabase
4. Deploy automático está habilitado

### Variables de Entorno en Vercel

En el dashboard de Vercel, ve a Settings > Environment Variables y añade:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima de Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## 📁 Estructura del Proyecto

```
project/
├── src/
│   ├── atoms/           # Componentes básicos reutilizables
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Loading.tsx
│   │   └── Select.tsx
│   ├── molecules/       # Componentes compuestos
│   │   ├── DraggableResource.tsx
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ViewModeSelector.tsx
│   ├── organisms/       # Componentes complejos
│   │   ├── CalendarHeader.tsx
│   │   ├── Navigation.tsx
│   │   ├── PendingItemsTable.tsx
│   │   ├── ResourceSidebar.tsx
│   │   └── ServiceCalendarGrid.tsx
│   ├── pages/           # Páginas principales
│   │   ├── LoginPage.tsx
│   │   ├── PendingPage.tsx
│   │   ├── QuotesPage.tsx
│   │   └── ServicesPage.tsx
│   ├── context/         # Context API
│   │   └── AuthContext.tsx
│   ├── components/      # Componentes auxiliares
│   │   └── ProtectedRoute.tsx
│   ├── services/        # Servicios y utilidades
│   │   ├── supabase.ts
│   │   └── dateUtils.ts
│   ├── types/           # Tipos TypeScript
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── DATABASE_SCHEMA.md   # Esquema de BD para Supabase
├── SETUP_NEON.sql       # Setup completo para Neon
├── vercel.json          # Configuración de Vercel
├── package.json
└── README.md
```

## 🔒 Seguridad

- Las variables de entorno NUNCA deben commitearse al repositorio
- El archivo `.env.local` está en `.gitignore` por seguridad
- Usa Row Level Security (RLS) en Supabase para proteger los datos
- Las políticas RLS están definidas en `DATABASE_SCHEMA.md`

## 🎨 Tecnologías Utilizadas

- **Frontend**:
  - React 18
  - TypeScript
  - Vite
  - TailwindCSS
  - React Router DOM
  - React Query (@tanstack/react-query)
  - Hello Pangea DnD (Drag & Drop)
  - Lucide React (Iconos)
  - date-fns

- **Backend**:
  - Supabase (Auth + Database)
  - PostgreSQL (Neon)

- **Deployment**:
  - Vercel

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linter
npm run lint

# Type checking
npm run typecheck
```

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"

**Solución**: Verifica que tu archivo `.env.local` existe y contiene las variables correctas.

### Error de autenticación

**Solución**: 
1. Verifica que el email existe en la tabla `users`
2. Revisa las políticas RLS en Supabase
3. Verifica que el ANON_KEY es correcto

### El calendario no carga los datos

**Solución**:
1. Abre la consola del navegador para ver errores
2. Verifica la conexión a Supabase
3. Revisa que las tablas tienen los datos seed (resources)

### Error en despliegue de Vercel

**Solución**:
1. Verifica que las variables de entorno estén configuradas en Vercel
2. Revisa los logs de build en el dashboard de Vercel
3. Asegúrate de que `vercel.json` está en la raíz

## 👥 Roles y Permisos

- **Administrator**: Acceso completo, puede gestionar recursos y todos los datos
- **User**: Puede crear y editar sus propios servicios y cotizaciones
- **Sales**: Puede gestionar cotizaciones y servicios

## 🔄 Workflow de Desarrollo

1. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Haz commits descriptivos: `git commit -m "feat: añadir filtro por fecha"`
3. Push a tu rama: `git push origin feature/nueva-funcionalidad`
4. Crea un Pull Request en GitHub
5. Una vez aprobado y merged a `main`, Vercel desplegará automáticamente

## 📞 Soporte

Para reportar bugs o solicitar features, crea un issue en el repositorio.

## 📄 Licencia

Este proyecto es propiedad de **Partequipos S.A.S**. Todos los derechos reservados.

---

**Desarrollado con ❤️ por el equipo de Partequipos S.A.S**

