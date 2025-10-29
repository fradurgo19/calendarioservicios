import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigation } from '../organisms/Navigation';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Card } from '../atoms/Card';
import { Loading } from '../atoms/Loading';
import { Sede } from '../types';
import { sedesApi } from '../services/api';
import { Plus, Edit2, Trash2, Save, X, Building2 } from 'lucide-react';

export const SedesManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    ciudad: '',
    direccion: '',
    activa: true,
  });

  const { data: sedes = [], isLoading, error: queryError } = useQuery({
    queryKey: ['sedes'],
    queryFn: async () => {
      try {
        const data = await sedesApi.list();
        return data as Sede[];
      } catch (err) {
        console.error('Error loading sedes:', err);
        return [];
      }
    },
  });

  const addSedeMutation = useMutation({
    mutationFn: async (sede: typeof formData) => {
      return await sedesApi.create(sede);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sedes'] });
      resetForm();
    },
  });

  const updateSedeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Sede> }) => {
      return await sedesApi.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sedes'] });
      resetForm();
    },
  });

  const deleteSedeMutation = useMutation({
    mutationFn: async (id: string) => {
      return await sedesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sedes'] });
    },
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      codigo: '',
      ciudad: '',
      direccion: '',
      activa: true,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateSedeMutation.mutate({ id: editingId, data: formData });
    } else {
      addSedeMutation.mutate(formData);
    }
  };

  const handleEdit = (sede: Sede) => {
    setFormData({
      nombre: sede.nombre,
      codigo: sede.codigo,
      ciudad: sede.ciudad || '',
      direccion: sede.direccion || '',
      activa: sede.activa,
    });
    setEditingId(sede.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta sede? Esta acción no se puede deshacer.')) {
      deleteSedeMutation.mutate(id);
    }
  };

  const handleToggleActiva = (sede: Sede) => {
    updateSedeMutation.mutate({
      id: sede.id,
      data: { activa: !sede.activa },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <Loading text="Cargando sedes..." />
        </div>
      </div>
    );
  }

  // Si hay error de que la tabla no existe, mostrar instrucciones
  const tableNotFound = queryError && (
    (queryError as { code?: string }).code === 'PGRST205' || 
    (queryError as { code?: string }).code === '42P01' ||
    (queryError as { message?: string })?.message?.includes('does not exist')
  );

  if (tableNotFound) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="bg-yellow-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Building2 className="w-10 h-10 text-yellow-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Tabla de Sedes No Existe
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Necesitas crear la tabla <code className="bg-gray-100 px-2 py-1 rounded">sedes</code> en tu base de datos PostgreSQL local primero.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                📋 Instrucciones para crear la tabla:
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li>Conéctate a tu base de datos <strong>PostgreSQL 17 local</strong></li>
                <li>Abre el archivo <code className="bg-white px-2 py-1 rounded text-sm">SETUP_POSTGRES_LOCAL.sql</code> o <code className="bg-white px-2 py-1 rounded text-sm">CREATE_SEDES_TABLE_LOCAL.sql</code> de este proyecto</li>
                <li>Copia todo el contenido del archivo</li>
                <li>Ejecuta el script SQL en tu cliente de PostgreSQL (psql, pgAdmin, DBeaver, etc.)</li>
                <li>Verifica que la tabla <code>sedes</code> se haya creado correctamente</li>
                <li>Recarga esta página</li>
              </ol>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Nota:</strong> El script <code>SETUP_POSTGRES_LOCAL.sql</code> crea todas las tablas necesarias. Si solo necesitas la tabla sedes, usa <code>CREATE_SEDES_TABLE_LOCAL.sql</code> que también agregará las columnas <code>sede_id</code> a las tablas existentes.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Sedes</h1>
          </div>
          <p className="text-gray-600">Administra las sedes disponibles en el sistema</p>
        </div>

        <div className="mb-6 flex justify-end">
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Sede
          </Button>
        </div>

        {/* Formulario de Agregar/Editar */}
        {isAdding && (
          <Card className="mb-6 p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Editar Sede' : 'Nueva Sede'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre de la Sede *"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Barranquilla"
                  required
                />
                <Input
                  label="Código *"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                  placeholder="Ej: BAQ"
                  required
                />
                <Input
                  label="Ciudad"
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  placeholder="Ej: Barranquilla, Atlántico"
                />
                <Input
                  label="Dirección"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Dirección completa"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activa"
                  checked={formData.activa}
                  onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="activa" className="text-sm font-medium text-gray-700">
                  Sede activa
                </label>
              </div>
              {(addSedeMutation.isError || updateSedeMutation.isError) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">
                    <strong>Error:</strong>{' '}
                    {addSedeMutation.error instanceof Error
                      ? addSedeMutation.error.message
                      : updateSedeMutation.error instanceof Error
                      ? updateSedeMutation.error.message
                      : 'Error desconocido al guardar la sede'}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Button type="submit" isLoading={addSedeMutation.isPending || updateSedeMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Guardar Cambios' : 'Crear Sede'}
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Lista de Sedes */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Sedes Registradas ({sedes.length})</h3>
          {sedes.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No hay sedes registradas</p>
              <p className="text-gray-400 text-sm">Crea tu primera sede para comenzar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ciudad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dirección</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sedes.map((sede) => (
                    <tr key={sede.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{sede.nombre}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                          {sede.codigo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{sede.ciudad || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{sede.direccion || '-'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActiva(sede)}
                          className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                            sede.activa
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {sede.activa ? 'Activa' : 'Inactiva'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(sede)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sede.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

