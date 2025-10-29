# 🚀 Guía del Backend Node.js/Express

Este proyecto ahora incluye un backend completo en Node.js con Express que se conecta directamente a PostgreSQL local.

---

## 📁 Estructura del Backend

```
server/
├── config/
│   └── database.ts          # Configuración de PostgreSQL
├── middleware/
│   └── auth.ts              # Autenticación JWT
├── routes/
│   ├── auth.ts              # Login, registro, sesión
│   ├── sedes.ts             # CRUD de sedes
│   ├── serviceEntries.ts    # CRUD de service entries
│   ├── quoteEntries.ts      # CRUD de quote entries
│   ├── pendingItems.ts      # CRUD de pending items
│   ├── resources.ts         # CRUD de resources
│   └── assignments.ts       # CRUD de assignments
└── index.ts                 # Servidor principal
```

---

## ⚙️ Configuración

### 1. Crear archivo de variables de entorno

Crea un archivo `server/.env` con:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calendario_servicios
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aqui

# Server Configuration
PORT=3000

# JWT Secret (cambiar en producción)
JWT_SECRET=tu-secret-key-muy-segura-aqui
```

### 2. Instalar dependencias

```bash
npm install
```

Las dependencias ya están instaladas, pero si necesitas reinstalar:

```bash
npm install express pg cors dotenv jsonwebtoken bcryptjs
npm install --save-dev @types/express @types/pg @types/cors @types/jsonwebtoken @types/bcryptjs @types/node nodemon ts-node
```

---

## 🚀 Ejecutar el Backend

### Desarrollo (con auto-reload)

```bash
npm run dev:server
```

El servidor estará disponible en: http://localhost:3000

### Manualmente

```bash
npx ts-node --esm server/index.ts
```

---

## 📡 Endpoints Disponibles

### Autenticación

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/me` - Obtener usuario actual (requiere token)

### Sedes

- `GET /api/sedes` - Listar sedes
  - Query params: `activa` (true/false)
- `GET /api/sedes/:id` - Obtener sede por ID
- `POST /api/sedes` - Crear sede
- `PUT /api/sedes/:id` - Actualizar sede
- `DELETE /api/sedes/:id` - Eliminar sede

### Service Entries

- `GET /api/service-entries` - Listar entradas
  - Query params: `sede_id`, `estado`
- `GET /api/service-entries/:id` - Obtener entrada por ID
- `POST /api/service-entries` - Crear entrada
- `PUT /api/service-entries/:id` - Actualizar entrada
- `DELETE /api/service-entries/:id` - Eliminar entrada

### Quote Entries

- `GET /api/quote-entries` - Listar cotizaciones
  - Query params: `sede_id`, `estado`
- `GET /api/quote-entries/:id` - Obtener cotización por ID
- `POST /api/quote-entries` - Crear cotización
- `PUT /api/quote-entries/:id` - Actualizar cotización
- `DELETE /api/quote-entries/:id` - Eliminar cotización

### Pending Items

- `GET /api/pending-items` - Listar items
  - Query params: `sede_id`, `estado`
- `GET /api/pending-items/:id` - Obtener item por ID
- `POST /api/pending-items` - Crear item
- `PUT /api/pending-items/:id` - Actualizar item
- `DELETE /api/pending-items/:id` - Eliminar item

### Resources

- `GET /api/resources` - Listar recursos
  - Query params: `sede_id`, `type`
- `GET /api/resources/:id` - Obtener recurso por ID
- `POST /api/resources` - Crear recurso
- `PUT /api/resources/:id` - Actualizar recurso
- `DELETE /api/resources/:id` - Eliminar recurso

### Assignments

- `GET /api/assignments` - Listar asignaciones
- `POST /api/assignments` - Crear asignación
- `DELETE /api/assignments/:id` - Eliminar asignación

---

## 🔐 Autenticación

Todas las rutas (excepto `/api/auth/login` y `/api/auth/register`) requieren un token JWT.

### Uso del Token

En el frontend, incluye el token en el header:

```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## ✅ Verificación

### Health Check

```bash
curl http://localhost:3000/health
```

Debería responder:
```json
{
  "status": "ok",
  "message": "Backend está funcionando"
}
```

### Probar Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"tu_contraseña"}'
```

---

## 🔧 Troubleshooting

### Error: "Cannot find module 'express'"

```bash
npm install
```

### Error: "Cannot connect to database"

1. Verifica que PostgreSQL esté ejecutándose
2. Verifica las credenciales en `server/.env`
3. Verifica que la base de datos `calendario_servicios` exista

### Error: "Port 3000 already in use"

Cambia el puerto en `server/.env`:
```env
PORT=3001
```

---

## 📝 Notas Importantes

1. **Seguridad**: Cambia `JWT_SECRET` en producción
2. **Contraseñas**: Se hashean con bcrypt antes de guardarse
3. **Validación**: Se validan campos requeridos antes de insertar/actualizar
4. **Errores**: Todos los errores se capturan y se devuelven con códigos HTTP apropiados

---

## 🎯 Próximos Pasos

1. Actualizar el frontend para usar estos endpoints en lugar de Supabase
2. Agregar más validaciones si es necesario
3. Implementar rate limiting para producción
4. Agregar logs más detallados

