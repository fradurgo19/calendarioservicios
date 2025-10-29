import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigation } from '../organisms/Navigation';
import { CalendarHeader } from '../organisms/CalendarHeader';
import { ResourceSidebar } from '../organisms/ResourceSidebar';
import { ServiceCalendarGrid } from '../organisms/ServiceCalendarGrid';
import { MonthCalendarView } from '../organisms/MonthCalendarView';
import { SedeSelector } from '../molecules/SedeSelector';
import { Loading } from '../atoms/Loading';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { ViewMode, ServiceType, EquipmentState, Sede, ServiceStatus, Assignment, ServiceEntry } from '../types';
import { sedesApi, serviceEntriesApi, resourcesApi, assignmentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSede } from '../context/SedeContext';
import { Plus, Archive, List, Edit2, X } from 'lucide-react';
import { addDays, addMonths, subDays, subMonths } from 'date-fns';

export const ServicesPage: React.FC = () => {
  const { user } = useAuth();
  const { selectedSedeId } = useSede();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [showHistorial, setShowHistorial] = useState(false);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<ServiceEntry | null>(null);
  const [newEntry, setNewEntry] = useState({
    site: '',
    zone: '',
    ott: '',
    client: '',
    advisor: '',
    type: 'Service' as ServiceType,
    equipment_state: 'New' as EquipmentState,
    equipment: '',
    notas: '',
    sede_id: '',
  });

  const { data: sedes = [] } = useQuery({
    queryKey: ['sedes'],
    queryFn: async () => {
      const data = await sedesApi.list();
      return data as Sede[];
    },
  });

  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['service-entries', selectedSedeId, showHistorial],
    queryFn: async () => {
      const params: Record<string, string> = {
        estado: showHistorial ? 'cerrado' : 'abierto',
      };
      if (selectedSedeId) {
        params.sede_id = selectedSedeId;
      }
      console.log('Fetching service entries with params:', params);
      const data = await serviceEntriesApi.list(params);
      console.log('Service entries received:', data);
      return data;
    },
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const data = await assignmentsApi.list();
      return data;
    },
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['resources', selectedSedeId],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (selectedSedeId) {
        params.sede_id = selectedSedeId;
      }
      const data = await resourcesApi.list(params);
      return data;
    },
  });

  const addEntryMutation = useMutation({
    mutationFn: async (entry: any) => {
      return await serviceEntriesApi.create(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-entries'] });
      setIsAddingEntry(false);
      setNewEntry({
        site: '',
        zone: '',
        ott: '',
        client: '',
        advisor: '',
        type: 'Service',
        equipment_state: 'New',
        equipment: '',
        notas: '',
        sede_id: selectedSedeId || '',
      });
    },
  });

  const updateEntryStatusMutation = useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: ServiceStatus }) => {
      return await serviceEntriesApi.update(id, { estado });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-entries'] });
    },
  });

  const updateEntryFullMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ServiceEntry> }) => {
      return await serviceEntriesApi.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-entries'] });
      setEditingId(null);
      setIsAddingEntry(false);
    },
  });

  const addAssignmentMutation = useMutation({
    mutationFn: async (assignment: { service_entry_id: string; resource_id: string; date: string }) => {
      console.log('Creating assignment:', assignment);
      try {
        const result = await assignmentsApi.create(assignment);
        console.log('Assignment created successfully:', result);
        return result;
      } catch (error) {
        console.error('Error creating assignment:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Assignment mutation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
    onError: (error) => {
      console.error('Assignment mutation error:', error);
    },
  });

  const removeAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      console.log('Deleting assignment:', assignmentId);
      try {
        const result = await assignmentsApi.delete(assignmentId);
        console.log('Assignment deleted successfully:', result);
        return result;
      } catch (error) {
        console.error('Error deleting assignment:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Assignment deletion successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
    onError: (error) => {
      console.error('Assignment deletion error:', error);
    },
  });

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    console.log('handleDragEnd called:', { source, destination, draggableId });

    if (!destination) {
      console.log('No destination, returning');
      return;
    }
    
    if (source.droppableId === destination.droppableId) {
      console.log('Same droppableId, returning');
      return;
    }

    if (destination.droppableId.startsWith('month-cell-')) {
      const date = destination.droppableId.replace('month-cell-', '');
      const resourceId = draggableId;
      
      console.log('Dropping to month-cell:', { date, resourceId });
      
      if (entries.length > 0) {
        console.log('Creating assignment for month view:', {
          service_entry_id: entries[0].id,
          resource_id: resourceId,
          date,
        });
        addAssignmentMutation.mutate({
          service_entry_id: entries[0].id,
          resource_id: resourceId,
          date,
        });
      }
    }
    else if (destination.droppableId.startsWith('cell-')) {
      // Formato: cell-{entryId}::{date}
      const parts = destination.droppableId.replace('cell-', '').split('::');
      console.log('Dropping to cell:', { droppableId: destination.droppableId, parts });
      
      if (parts.length === 2) {
        const entryId = parts[0];
        const date = parts[1];
        const resourceId = draggableId;

        console.log('Creating assignment:', {
          service_entry_id: entryId,
          resource_id: resourceId,
          date,
        });

        addAssignmentMutation.mutate({
          service_entry_id: entryId,
          resource_id: resourceId,
          date,
        });
      } else {
        console.error('Invalid cell format:', destination.droppableId, 'parts:', parts);
      }
    } else {
      console.log('Destination not handled:', destination.droppableId);
    }
  };

  const handleRemoveAssignment = (assignmentId: string) => {
    removeAssignmentMutation.mutate(assignmentId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateEntryFullMutation.mutate({ id: editingId, data: newEntry });
    } else {
      addEntryMutation.mutate(newEntry);
    }
  };

  const handleEditService = (entry: any) => {
    setEditingId(entry.id);
    setIsAddingEntry(true);
    setNewEntry({
      site: entry.site || '',
      zone: entry.zone || '',
      ott: entry.ott || '',
      client: entry.client || '',
      advisor: entry.advisor || '',
      type: entry.type || 'Service',
      equipment_state: entry.equipment_state || 'New',
      equipment: entry.equipment || '',
      notas: entry.notas || '',
      sede_id: entry.sede_id || selectedSedeId || '',
    });
  };

  const handleCloseService = (entryId: string) => {
    if (confirm('¿Está seguro que desea cerrar este servicio?')) {
      updateEntryStatusMutation.mutate({ id: entryId, estado: 'cerrado' });
    }
  };

  const handleReopenService = (entryId: string) => {
    if (confirm('¿Está seguro que desea reabrir este servicio?')) {
      updateEntryStatusMutation.mutate({ id: entryId, estado: 'abierto' });
    }
  };

  const handlePrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subDays(currentDate, viewMode === 'week' ? 7 : 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, viewMode === 'week' ? 7 : 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  if (entriesLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          <ResourceSidebar resources={resources} selectedSedeId={selectedSedeId} />
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">Servicios</h1>
              <div className="flex items-center gap-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowHistorial(!showHistorial)}
                  className="flex items-center gap-2"
                >
                  {showHistorial ? <List className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                  {showHistorial ? 'Ver Activos' : 'Ver Historial'}
                </Button>
                {!showHistorial && (
                  <Button
                    onClick={() => setIsAddingEntry(!isAddingEntry)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {isAddingEntry ? 'Cancelar' : 'Agregar Servicio'}
                  </Button>
                )}
              </div>
            </div>

            {!showHistorial && (
              <>
                <CalendarHeader
                  currentDate={currentDate}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onToday={handleToday}
                />

                {isAddingEntry && (
                  <div className="mb-6 bg-white rounded-lg shadow-md">
                    <form onSubmit={handleSubmit}>
                      <div className="p-6 space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {editingId ? 'Editar Servicio' : 'Nuevo Servicio'}
                        </h3>

                        {/* Selección de Sede */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                            Información de Sede
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <SedeSelector
                              value={newEntry.sede_id || selectedSedeId || ''}
                              onChange={(sedeId) => setNewEntry({ ...newEntry, sede_id: sedeId })}
                              sedes={sedes}
                            />
                          </div>
                        </div>

                        {/* Información del Cliente */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                            Información del Cliente
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              label="Cliente *"
                              value={newEntry.client}
                              onChange={(e) => setNewEntry({ ...newEntry, client: e.target.value })}
                              required
                            />
                            <Input
                              label="Sitio *"
                              value={newEntry.site}
                              onChange={(e) => setNewEntry({ ...newEntry, site: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <Input
                              label="Zona *"
                              value={newEntry.zone}
                              onChange={(e) => setNewEntry({ ...newEntry, zone: e.target.value })}
                              required
                            />
                            <Input
                              label="OTT *"
                              value={newEntry.ott}
                              onChange={(e) => setNewEntry({ ...newEntry, ott: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        {/* Información del Equipo */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                            Información del Equipo
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              label="Equipo"
                              value={newEntry.equipment}
                              onChange={(e) => setNewEntry({ ...newEntry, equipment: e.target.value })}
                            />
                            <Select
                              label="Estado del Equipo *"
                              value={newEntry.equipment_state}
                              onChange={(e) => setNewEntry({ ...newEntry, equipment_state: e.target.value as EquipmentState })}
                              options={[
                                { value: 'New', label: 'Nuevo' },
                                { value: 'Used', label: 'Usado' },
                              ]}
                            />
                          </div>
                        </div>

                        {/* Información del Servicio */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                            Información del Servicio
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <Select
                              label="Tipo de Servicio *"
                              value={newEntry.type}
                              onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as ServiceType })}
                              options={[
                                { value: 'Service', label: 'Servicio' },
                                { value: 'Preparation', label: 'Alistamiento' },
                              ]}
                            />
                            <Input
                              label="Asesor *"
                              value={newEntry.advisor}
                              onChange={(e) => setNewEntry({ ...newEntry, advisor: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        {/* Estado del Servicio */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                            Estado del Servicio
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <Select
                              label="Estado"
                              value={newEntry.estado || 'abierto'}
                              onChange={(e) => setNewEntry({ ...newEntry, estado: e.target.value as ServiceStatus })}
                              options={[
                                { value: 'abierto', label: 'Abierto' },
                                { value: 'cerrado', label: 'Cerrado' },
                              ]}
                            />
                          </div>
                        </div>

                        {/* Notas Adicionales */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                            Notas Adicionales
                          </h4>
                                <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Observaciones
                            </label>
                            <textarea
                              value={newEntry.notas}
                              onChange={(e) => setNewEntry({ ...newEntry, notas: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              rows={4}
                              placeholder="Agregue cualquier información adicional relevante..."
                            />
                          </div>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              setIsAddingEntry(false);
                              setEditingId(null);
                              setNewEntry({
                                site: '',
                                zone: '',
                                ott: '',
                                client: '',
                                advisor: '',
                                type: 'Service',
                                equipment_state: 'New',
                                equipment: '',
                                notas: '',
                                sede_id: selectedSedeId || '',
                              });
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit" isLoading={addEntryMutation.isPending || updateEntryFullMutation.isPending}>
                            {editingId ? 'Guardar Cambios' : 'Guardar Servicio'}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {viewMode === 'month' ? (
                  <MonthCalendarView
                    entries={entries}
                    assignments={assignments}
                    resources={resources}
                    currentDate={currentDate}
                    onEntryClick={(entry) => setSelectedEntry(entry)}
                  />
                ) : (
                  <ServiceCalendarGrid
                    entries={entries}
                    assignments={assignments}
                    resources={resources}
                    currentDate={currentDate}
                    viewMode={viewMode}
                    onEdit={handleEditService}
                    onClose={handleCloseService}
                    onRemoveAssignment={handleRemoveAssignment}
                  />
                )}
              </>
            )}

          {showHistorial && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Site</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Programación</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notas</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Cierre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {entries.map((entry) => {
                    // Obtener asignaciones de este servicio
                    const entryAssignments = assignments.filter(a => a.service_entry_id === entry.id);
                    
                    // Agrupar asignaciones por fecha
                    const assignmentsByDate = new Map<string, Assignment[]>();
                    entryAssignments.forEach(assignment => {
                      const dateStr = assignment.date.split('T')[0]; // Normalizar fecha
                      if (!assignmentsByDate.has(dateStr)) {
                        assignmentsByDate.set(dateStr, []);
                      }
                      assignmentsByDate.get(dateStr)!.push(assignment);
                    });
                    
                    // Ordenar fechas
                    const sortedDates = Array.from(assignmentsByDate.keys()).sort();
                    
                    return (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{entry.site}</td>
                        <td className="px-4 py-3">{entry.client}</td>
                        <td className="px-4 py-3">{entry.equipment || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            entry.type === 'Service' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {entry.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {sortedDates.length > 0 ? (
                            <div className="space-y-1 max-w-xs">
                              {sortedDates.map((dateStr) => {
                                const dateAssignments = assignmentsByDate.get(dateStr)!;
                                const date = new Date(dateStr);
                                const formattedDate = date.toLocaleDateString('es-ES', { 
                                  weekday: 'short', 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                });
                                
                                // Obtener recursos asignados para esta fecha
                                const assignedResources = dateAssignments
                                  .map(a => resources.find(r => r.id === a.resource_id))
                                  .filter(Boolean);
                                
                                return (
                                  <div key={dateStr} className="text-xs border-l-2 border-blue-400 pl-2 py-1">
                                    <div className="font-semibold text-gray-700 mb-1">
                                      {formattedDate}
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {assignedResources.length > 0 ? (
                                        assignedResources.map((resource) => {
                                          if (!resource) return null;
                                          const getResourceColor = () => {
                                            switch (resource.type) {
                                              case 'technician':
                                                return 'bg-blue-100 text-blue-700';
                                              case 'administrator':
                                                return 'bg-green-100 text-green-700';
                                              case 'phase':
                                                return 'bg-orange-100 text-orange-700';
                                              default:
                                                return 'bg-gray-100 text-gray-700';
                                            }
                                          };
                                          return (
                                            <span
                                              key={resource.id}
                                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getResourceColor()}`}
                                              title={resource.name}
                                            >
                                              {resource.name}
                                            </span>
                                          );
                                        })
                                      ) : (
                                        <span className="text-gray-400 text-[10px]">Sin recursos asignados</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">Sin programación</span>
                          )}
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate">{entry.notas || '-'}</td>
                        <td className="px-4 py-3">{new Date(entry.updated_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <Button
                            variant="secondary"
                            onClick={() => handleReopenService(entry.id)}
                          >
                            Reabrir
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {entries.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        No hay servicios cerrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </DragDropContext>

      {/* Modal de detalles del servicio */}
      {selectedEntry && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEntry(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Detalles del Servicio</h2>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Cerrar"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Información de Sede */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Sede</h3>
                <p className="text-gray-900">
                  {sedes.find(s => s.id === selectedEntry.sede_id)?.nombre || '-'}
                  {selectedEntry.sede_id && sedes.find(s => s.id === selectedEntry.sede_id)?.codigo && (
                    <span className="text-gray-500 ml-2">({sedes.find(s => s.id === selectedEntry.sede_id)?.codigo})</span>
                  )}
                </p>
              </div>

              {/* Información del Cliente */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Información del Cliente</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cliente</p>
                    <p className="text-gray-900 font-medium">{selectedEntry.client}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Sitio</p>
                    <p className="text-gray-900 font-medium">{selectedEntry.site}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Zona</p>
                    <p className="text-gray-900 font-medium">{selectedEntry.zone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">OTT</p>
                    <p className="text-gray-900 font-medium">{selectedEntry.ott}</p>
                  </div>
                </div>
              </div>

              {/* Información del Equipo */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Información del Equipo</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Equipo</p>
                    <p className="text-gray-900 font-medium">{selectedEntry.equipment || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Estado del Equipo</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      selectedEntry.equipment_state === 'New'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedEntry.equipment_state === 'New' ? 'Nuevo' : 'Usado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información del Servicio */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Información del Servicio</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tipo de Servicio</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      selectedEntry.type === 'Service'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {selectedEntry.type === 'Service' ? 'Servicio' : 'Alistamiento'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Asesor</p>
                    <p className="text-gray-900 font-medium">{selectedEntry.advisor}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Estado</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      selectedEntry.estado === 'abierto'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedEntry.estado === 'abierto' ? 'Abierto' : 'Cerrado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              {selectedEntry.notas && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Observaciones</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedEntry.notas}</p>
                </div>
              )}

              {/* Programación - Recursos asignados por fecha */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Programación</h3>
                {(() => {
                  const entryAssignments = assignments.filter(a => a.service_entry_id === selectedEntry.id);
                  if (entryAssignments.length === 0) {
                    return <p className="text-gray-500 text-sm">No hay recursos asignados</p>;
                  }
                  
                  // Agrupar por fecha
                  const assignmentsByDate = new Map<string, Assignment[]>();
                  entryAssignments.forEach(assignment => {
                    const dateStr = assignment.date.split('T')[0];
                    if (!assignmentsByDate.has(dateStr)) {
                      assignmentsByDate.set(dateStr, []);
                    }
                    assignmentsByDate.get(dateStr)!.push(assignment);
                  });
                  
                  const sortedDates = Array.from(assignmentsByDate.keys()).sort();
                  
                  return (
                    <div className="space-y-3">
                      {sortedDates.map((dateStr) => {
                        const dateAssignments = assignmentsByDate.get(dateStr)!;
                        const date = new Date(dateStr);
                        const formattedDate = date.toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        });
                        
                        const assignedResources = dateAssignments
                          .map(a => resources.find(r => r.id === a.resource_id))
                          .filter(Boolean);
                        
                        return (
                          <div key={dateStr} className="border-l-2 border-blue-400 pl-4 py-2">
                            <p className="text-sm font-semibold text-gray-700 mb-2">{formattedDate}</p>
                            <div className="flex flex-wrap gap-2">
                              {assignedResources.length > 0 ? (
                                assignedResources.map((resource) => {
                                  if (!resource) return null;
                                  const getResourceColor = () => {
                                    switch (resource.type) {
                                      case 'technician':
                                        return 'bg-blue-100 text-blue-700';
                                      case 'administrator':
                                        return 'bg-green-100 text-green-700';
                                      case 'phase':
                                        return 'bg-orange-100 text-orange-700';
                                      default:
                                        return 'bg-gray-100 text-gray-700';
                                    }
                                  };
                                  return (
                                    <span
                                      key={resource.id}
                                      className={`px-3 py-1 rounded text-sm font-medium ${getResourceColor()}`}
                                    >
                                      {resource.name}
                                    </span>
                                  );
                                })
                              ) : (
                                <span className="text-gray-400 text-sm">Sin recursos asignados</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={() => {
                    handleEditService(selectedEntry);
                    setSelectedEntry(null);
                  }}
                  className="flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </Button>
                {selectedEntry.estado === 'abierto' && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      handleCloseService(selectedEntry.id);
                      setSelectedEntry(null);
                    }}
                    className="flex items-center gap-2 bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    <X className="w-4 h-4" />
                    Cerrar Servicio
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => setSelectedEntry(null)}
                  className="ml-auto"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
