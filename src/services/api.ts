const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Función para obtener el token del localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Función para hacer peticiones autenticadas
const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response;
};

// API de autenticación
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  },

  register: async (username: string, email: string, password: string, role: string) => {
    const response = await fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, role }),
    });
    return response.json();
  },

  getMe: async () => {
    const response = await fetchWithAuth('/auth/me');
    return response.json();
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// API genérica para CRUD
export const createApiClient = (resource: string) => {
  const baseEndpoint = `/${resource}`;

  return {
    // Listar todos (con filtros opcionales)
    list: async (params?: Record<string, string>) => {
      const queryString = params
        ? '?' + new URLSearchParams(params).toString()
        : '';
      const response = await fetchWithAuth(`${baseEndpoint}${queryString}`);
      return response.json();
    },

    // Obtener por ID
    get: async (id: string) => {
      const response = await fetchWithAuth(`${baseEndpoint}/${id}`);
      return response.json();
    },

    // Crear
    create: async (data: any) => {
      const response = await fetchWithAuth(baseEndpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    },

    // Actualizar
    update: async (id: string, data: any) => {
      const response = await fetchWithAuth(`${baseEndpoint}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.json();
    },

    // Eliminar
    delete: async (id: string) => {
      const response = await fetchWithAuth(`${baseEndpoint}/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    },
  };
};

// Exportar clientes específicos
export const sedesApi = createApiClient('sedes');
export const serviceEntriesApi = createApiClient('service-entries');
export const quoteEntriesApi = createApiClient('quote-entries');
export const pendingItemsApi = createApiClient('pending-items');
export const resourcesApi = createApiClient('resources');
export const assignmentsApi = createApiClient('assignments');
export const quoteAssignmentsApi = createApiClient('quote-assignments');

