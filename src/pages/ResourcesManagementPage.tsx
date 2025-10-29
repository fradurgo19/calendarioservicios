import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigation } from '../organisms/Navigation';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Card } from '../atoms/Card';
import { Loading } from '../atoms/Loading';
import { Resource, ResourceType, Sede } from '../types';
import { sedesApi, resourcesApi } from '../services/api';
import { useSede } from '../context/SedeContext';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export const ResourcesManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { selectedSedeId } = useSede();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'technician' as ResourceType,
    sede_id: '',
  });

  // Consultas
  const { data: sedes = [], isLoading: sedesLoading } = useQuery({
    queryKey: ['sedes'],
    queryFn: async () => {
      const data = await sedesApi.list();
      return data as Sede[];
    },
  });

  const { data: resources = [], isLoading: resourcesLoading } = useQuery({
    queryKey: ['resources', selectedSedeId],
    queryFn: async () => {
      const data = await resourcesApi.list();
      // Filtrar: incluir recursos de la sede o fases (globales)
      if (selectedSedeId) {
        return data.filter((r: Resource) => r.sede_id === selectedSedeId || r.type === 'phase') as Resource[];
      }
      return data as Resource[];
    },
  });

  // Mutaciones
  const addResourceMutation = useMutation({
    mutationFn: async (resource: typeof formData) => {
      const insertData: Partial<Resource> & { name: string; type: ResourceType; available: boolean } = {
        name: resource.name,
        type: resource.type,
        available: true,
      };
      
      // Solo agregar sede_id para técnicos y administradores, no para fases
      if (resource.type !== 'phase' && resource.sede_id) {
        insertData.sede_id = resource.sede_id;
      }
      
      return await resourcesApi.create(insertData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      resetForm();
    },
  });

  const updateResourceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Resource> }) => {
      // Filtrar solo los campos permitidos
      const updateData: Record<string, unknown> = {
        name: data.name,
        type: data.type,
      };
      
      // Solo agregar available si existe
      if (data.available !== undefined) {
        updateData.available = data.available;
      }
      
      // Manejar sede_id según el tipo
      const resourceType = data.type;
      if (resourceType === 'phase') {
        // Las fases siempre tienen sede_id = null
        updateData.sede_id = null;
      } else if (data.sede_id !== undefined) {
        // Para otros tipos (technician o administrator), enviar sede_id (puede ser null si está vacío)
        updateData.sede_id = data.sede_id || null;
      }
      
      return await resourcesApi.update(id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      setEditingId(null);
      setIsAdding(false);
      resetForm();
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async (id: string) => {
      return await resourcesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'technician',
      sede_id: selectedSedeId || '',
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateResourceMutation.mutate({ id: editingId, data: formData });
    } else {
      addResourceMutation.mutate(formData);
    }
  };

  const handleEdit = (resource: Resource) => {
    setFormData({
      name: resource.name,
      type: resource.type,
      // Las fases no tienen sede, así que usar cadena vacía para ellas
      sede_id: resource.type === 'phase' ? '' : (resource.sede_id || selectedSedeId || ''),
    });
    setEditingId(resource.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este recurso?')) {
      deleteResourceMutation.mutate(id);
    }
  };

  const groupedResources = {
    technician: resources.filter(r => r.type === 'technician'),
    administrator: resources.filter(r => r.type === 'administrator'),
    phase: resources.filter(r => r.type === 'phase'),
  };

  if (sedesLoading || resourcesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <Loading text="Cargando recursos..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Recursos</h1>
          <p className="text-gray-600">Administra técnicos, administradores y fases por sede</p>
        </div>

        {/* Información de Sede */}
        <div className="mb-6 flex items-center justify-between">
          {selectedSedeId && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Sede seleccionada:</span>
              <span className="text-sm font-semibold text-blue-600">
                {sedes.find(s => s.id === selectedSedeId)?.nombre || 'N/A'}
              </span>
            </div>
          )}
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Recurso
          </Button>
        </div>

        {/* Formulario de Agregar/Editar */}
        {isAdding && (
          <Card className="mb-6 p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Editar Recurso' : 'Nuevo Recurso'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: TBOG5, ADBOG4, F17"
                  required
                />
                <Select
                  label="Tipo"
                  value={formData.type}
                  onChange={(e) => {
                    const newType = e.target.value as ResourceType;
                    // Si cambia a fase, limpiar sede_id
                    setFormData({ 
                      ...formData, 
                      type: newType,
                      sede_id: newType === 'phase' ? '' : (selectedSedeId || '')
                    });
                  }}
                  options={[
                    { value: 'technician', label: 'Técnico' },
                    { value: 'administrator', label: 'Administrador' },
                    { value: 'phase', label: 'Fase' },
                  ]}
                />
                {formData.type !== 'phase' && (
                  <Select
                    label="Sede"
                    value={formData.sede_id}
                    onChange={(e) => setFormData({ ...formData, sede_id: e.target.value })}
                    options={[
                      { value: '', label: 'Seleccionar Sede' },
                      ...sedes.filter(s => s.activa).map(s => ({
                        value: s.id,
                        label: `${s.nombre} (${s.codigo})`,
                      })),
                    ]}
                    required
                  />
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" isLoading={addResourceMutation.isPending || updateResourceMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Guardar Cambios' : 'Agregar'}
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Lista de Recursos por Tipo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Técnicos */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-700">
              Técnicos ({groupedResources.technician.length})
            </h3>
            <div className="space-y-2">
              {groupedResources.technician.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{resource.name}</p>
                    {resource.sede_id && (
                      <p className="text-xs text-gray-500 mt-1">
                        Sede: {sedes.find(s => s.id === resource.sede_id)?.nombre || resource.sede_id}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(resource)}
                      className="p-2 text-blue-600 hover:bg-blue-200 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="p-2 text-red-600 hover:bg-red-200 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {groupedResources.technician.length === 0 && (
                <p className="text-gray-500 text-sm">No hay técnicos registrados</p>
              )}
            </div>
          </Card>

          {/* Administradores */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-700">
              Administradores ({groupedResources.administrator.length})
            </h3>
            <div className="space-y-2">
              {groupedResources.administrator.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{resource.name}</p>
                    {resource.sede_id && (
                      <p className="text-xs text-gray-500 mt-1">
                        Sede: {sedes.find(s => s.id === resource.sede_id)?.nombre || resource.sede_id}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(resource)}
                      className="p-2 text-green-600 hover:bg-green-200 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="p-2 text-red-600 hover:bg-red-200 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {groupedResources.administrator.length === 0 && (
                <p className="text-gray-500 text-sm">No hay administradores registrados</p>
              )}
            </div>
          </Card>

          {/* Fases */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-purple-700">
              Fases ({groupedResources.phase.length})
            </h3>
            <div className="space-y-2">
              {groupedResources.phase.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{resource.name}</p>
                    {resource.sede_id && (
                      <p className="text-xs text-gray-500 mt-1">
                        Sede: {sedes.find(s => s.id === resource.sede_id)?.nombre || resource.sede_id}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(resource)}
                      className="p-2 text-purple-600 hover:bg-purple-200 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="p-2 text-red-600 hover:bg-red-200 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {groupedResources.phase.length === 0 && (
                <p className="text-gray-500 text-sm">No hay fases registradas</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

