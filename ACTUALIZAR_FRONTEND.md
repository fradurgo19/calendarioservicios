# 📝 Guía para Actualizar el Frontend

He creado el servicio API (`src/services/api.ts`) y actualizado `AuthContext`, `SedeContext`, y `SedesManagementPage`. 

Faltan actualizar estas páginas que aún usan Supabase:

## ✅ Ya Actualizadas:
- ✅ `src/context/AuthContext.tsx` - Usa JWT ahora
- ✅ `src/context/SedeContext.tsx` - Usa nueva API
- ✅ `src/pages/SedesManagementPage.tsx` - Usa nueva API
- ✅ `src/pages/SedeSelectionPage.tsx` - Usa nueva API

## 🔄 Pendientes de Actualizar:

### 1. `src/pages/ServicesPage.tsx`
Reemplazar:
```typescript
import { supabase } from '../services/supabase';
```

Por:
```typescript
import { sedesApi, serviceEntriesApi, resourcesApi, assignmentsApi } from '../services/api';
```

Y cambiar todas las queries de Supabase por las nuevas APIs:
- `supabase.from('sedes')` → `sedesApi.list()`
- `supabase.from('service_entries')` → `serviceEntriesApi.list({ sede_id, estado })`
- `supabase.from('resources')` → `resourcesApi.list({ sede_id, type })`
- `supabase.from('assignments')` → `assignmentsApi.list()`

### 2. `src/pages/PendingPage.tsx`
Reemplazar:
```typescript
import { supabase } from '../services/supabase';
```

Por:
```typescript
import { pendingItemsApi } from '../services/api';
```

### 3. `src/pages/QuotesPage.tsx`
Reemplazar:
```typescript
import { supabase } from '../services/supabase';
```

Por:
```typescript
import { sedesApi, quoteEntriesApi } from '../services/api';
```

### 4 conoces. `src/pages/ResourcesManagementPage.tsx`
Reemplazar:
```typescript
import { supabase } from '../services/supabase';
```

Por:
```typescript
import { resourcesApi, sedesApi } from '../services/api';
```

### 5. `src/organisms/PendingItemsTable.tsx`
Reemplazar:
```typescript
import { supabase } from '../services/supabase';
```

Por:
```typescript
import { pendingItemsApi, sedesApi } from '../services/api';
```

---

## 🔧 Patrón de Conversión:

### Antes (Supabase):
```typescript
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('column', value)
  .order('name');
if (error) throw error;
return data;
```

### Después (Nueva API):
```typescript
const data = await tableApi.list({ column: value });
return data;
```

### Para Crear:
```typescript
// Antes
await supabase.from('table').insert([data]).select().single();

// Después
await tableApi.create(data);
```

### Para Actualizar:
```typescript
// Antes
await supabase.from('table').update(data).eq('id', id);

// Después
await tableApi.update(id, data);
```

### Para Eliminar:
```typescript
// Antes
await supabase.from('table').delete().eq('id', id);

// Después
await tableApi.delete(id);
```

---

## ⚙️ Variables de Entorno

Actualiza `.env.local` para incluir la URL del backend:
```env
VITE_API_URL=http://localhost:3000/api
```

---

¿Quieres que continúe actualizando el resto de las páginas ahora?

