# Configuración del Backend - Guía Rápida

## 1. Crear archivo de variables de entorno

Crea un archivo `server/.env` con el siguiente contenido:

```env
# Configuración de Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calendario_servicios
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aqui

# Puerto del servidor
PORT=3000

# JWT Secret (debe ser una cadena aleatoria segura en producción)
JWT_SECRET=tu_secret_jwt_muy_seguro_aqui_cambiar_en_produccion
```

**⚠️ IMPORTANTE:** Reemplaza `tu_contraseña_aqui` con la contraseña real de tu base de datos PostgreSQL.

## 2. Instalar dependencias (si aún no lo has hecho)

```bash
npm install
```

## 3. Iniciar el servidor backend

```bash
npm run dev:server
```

El servidor debería iniciarse en `http://localhost:3000`

## 4. Verificar que funciona

Abre tu navegador o usa curl/Postman para probar el endpoint de health check:

```
GET http://localhost:3000/health
```

Deberías recibir:
```json
{
  "status": "ok",
  "message": "Backend está funcionando"
}
```

## 5. Configurar el frontend

Asegúrate de que el archivo `.env` en la raíz del proyecto tenga:

```env
VITE_API_URL=http://localhost:3000/api
```

## 6. Probar autenticación

### Login:
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "tu_contraseña"
}
```

## Troubleshooting

### Error: "connect ECONNREFUSED"
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `server/.env`

### Error: "relation does not exist"
- Asegúrate de haber ejecutado los scripts SQL para crear las tablas
- Verifica que estás usando la base de datos correcta (`calendario_servicios`)

### Error: "Cannot find module"
- Ejecuta `npm install` para instalar las dependencias
- Verifica que `node_modules` existe

