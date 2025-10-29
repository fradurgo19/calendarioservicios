export type UserRole = 'Administrator' | 'User' | 'Sales';

export interface Sede {
  id: string;
  nombre: string;
  codigo: string;
  ciudad?: string;
  direccion?: string;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  sede_id?: string;
  created_at: string;
}

export type ViewMode = 'month' | 'week' | 'day';

export type ServiceType = 'Service' | 'Preparation';
export type EquipmentState = 'New' | 'Used';
export type ServiceStatus = 'abierto' | 'cerrado';

export interface ServiceEntry {
  id: string;
  site: string;
  zone: string;
  ott: string;
  client: string;
  advisor: string;
  type: ServiceType;
  equipment_state: EquipmentState;
  equipment?: string;
  notas?: string;
  estado: ServiceStatus;
  sede_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type ResourceType = 'technician' | 'administrator' | 'phase';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  available: boolean;
  descripcion?: string;
  sede_id?: string;
  created_at?: string;
}

export interface Assignment {
  id: string;
  service_entry_id: string;
  resource_id: string;
  date: string;
  created_at: string;
}

export interface QuoteEntry {
  id: string;
  zone: string;
  equipment: string;
  client: string;
  notes: string;
  sede_id?: string;
  estado?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteAssignment {
  id: string;
  quote_entry_id: string;
  date: string;
  status: string;
  created_at: string;
}

export interface PendingItem {
  id: string;
  item: string;
  date: string;
  assigned_to: string;
  due_date: string;
  observations: string;
  sede_id?: string;
  estado?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarCell {
  date: string;
  assignments: Assignment[];
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export interface DragItem {
  resourceId: string;
  resourceName: string;
  resourceType: ResourceType;
}
