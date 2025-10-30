import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigation } from '../organisms/Navigation';
import { CalendarHeader } from '../organisms/CalendarHeader';
import { Loading } from '../atoms/Loading';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { ViewMode, QuoteEntry, QuoteAssignment, Sede } from '../types';
import { sedesApi, quoteEntriesApi, quoteAssignmentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSede } from '../context/SedeContext';
import { Plus, Edit2, Package, X } from 'lucide-react';
import { addDays, addMonths, subDays, subMonths, format } from 'date-fns';
import { getWeekDays, getMonthWeeks, formatDateDisplay, formatDate } from '../services/dateUtils';
import { QuoteMonthCalendarView } from '../organisms/QuoteMonthCalendarView';

export const QuotesPage: React.FC = () => {
  const { user } = useAuth();
  const { selectedSedeId } = useSede();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    zone: '',
    equipment: '',
    client: '',
    notes: '',
    sede_id: selectedSedeId || '',
    estado: 'abierto',
  });

  const { data: sedes = [] } = useQuery({
    queryKey: ['sedes'],
    queryFn: async () => {
      const data = await sedesApi.list();
      return data as Sede[];
    },
  });

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['quote-entries', selectedSedeId],
    queryFn: async () => {
      const params = selectedSedeId ? { sede_id: selectedSedeId } : {};
      const data = await quoteEntriesApi.list(params);
      return data;
    },
  });

  const sortedEntries = [...entries].sort((a: any, b: any) => {
    const aOpen = (a.estado || 'abierto') === 'abierto';
    const bOpen = (b.estado || 'abierto') === 'abierto';
    if (aOpen !== bOpen) return aOpen ? -1 : 1; // abiertos primero
    const aDate = new Date(a.created_at || 0).getTime();
    const bDate = new Date(b.created_at || 0).getTime();
    return bDate - aDate; // más reciente primero
  });

  const { data: quoteAssignments = [] } = useQuery({
    queryKey: ['quote-assignments'],
    queryFn: async () => {
      const data = await quoteAssignmentsApi.list();
      return data;
    },
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const addEntryMutation = useMutation({
    mutationFn: async (entry: typeof newEntry) => {
      return await quoteEntriesApi.create(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-entries'] });
      setIsAddingEntry(false);
      setEditingId(null);
      setNewEntry({ zone: '', equipment: '', client: '', notes: '', sede_id: selectedSedeId || '', estado: 'abierto' });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<QuoteEntry> }) => {
      return await quoteEntriesApi.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-entries'] });
      setEditingId(null);
      setIsAddingEntry(false);
      setNewEntry({ zone: '', equipment: '', client: '', notes: '', sede_id: selectedSedeId || '', estado: 'abierto' });
    },
  });

  const getDays = () => {
    if (viewMode === 'day') {
      return [currentDate];
    } else if (viewMode === 'week') {
      return getWeekDays(currentDate);
    } else {
      return getMonthWeeks(currentDate);
    }
  };

  const days = getDays();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateEntryMutation.mutate({ id: editingId, data: newEntry });
    } else {
      addEntryMutation.mutate(newEntry);
    }
  };

  // Actualizar sede_id cuando cambie selectedSedeId
  useEffect(() => {
    if (selectedSedeId && !isAddingEntry) {
      setNewEntry(prev => ({
        ...prev,
        sede_id: selectedSedeId,
      }));
    }
  }, [selectedSedeId, isAddingEntry]);

  // Resetear el formulario cuando se abre para agregar nueva entrada
  useEffect(() => {
    if (isAddingEntry && !editingId) {
      setNewEntry({
        zone: '',
        equipment: '',
        client: '',
        notes: '',
        sede_id: selectedSedeId || '',
        estado: 'abierto',
      });
    }
  }, [isAddingEntry, editingId, selectedSedeId]);

  const handleEdit = (entry: QuoteEntry) => {
    setEditingId(entry.id);
    setNewEntry({
      zone: entry.zone,
      equipment: entry.equipment,
      client: entry.client,
      notes: entry.notes,
      sede_id: entry.sede_id || selectedSedeId || '',
      estado: entry.estado || 'abierto',
    });
    setIsAddingEntry(true);
  };

  // Mutación para crear/actualizar quote assignment
  const toggleDeliveryMutation = useMutation({
    mutationFn: async ({ quoteEntryId, date, currentStatus }: { quoteEntryId: string; date: string; currentStatus: string }) => {
      // Determinar el nuevo status
      let newStatus = 'pending';
      if (currentStatus === 'pending') {
        newStatus = 'delivered';
      } else if (currentStatus === 'delivered') {
        newStatus = 'pending';
      } else {
        // Si no existe o es 'scheduled', crear como 'pending'
        newStatus = 'pending';
      }

      // Buscar si ya existe una asignación
      const existingAssignment = quoteAssignments.find(
        (a: any) => a.quote_entry_id === quoteEntryId && a.date.split('T')[0] === date
      );

      if (existingAssignment) {
        // Actualizar el status
        return await quoteAssignmentsApi.update(existingAssignment.id, { status: newStatus });
      } else {
        // Crear nueva asignación
        return await quoteAssignmentsApi.create({
          quote_entry_id: quoteEntryId,
          date: date,
          status: newStatus,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-assignments'] });
    },
  });

  // Mutación para eliminar asignación
  const deleteAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      return await quoteAssignmentsApi.delete(assignmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-assignments'] });
    },
  });

  const handleDeliveryToggle = (quoteEntryId: string, date: string, currentStatus: string) => {
    toggleDeliveryMutation.mutate({ quoteEntryId, date, currentStatus });
  };

  const handleDeleteAssignment = (quoteEntryId: string, date: string) => {
    const assignment = quoteAssignments.find(
      (a: any) => a.quote_entry_id === quoteEntryId && a.date.split('T')[0] === date
    );
    if (assignment && confirm('¿Eliminar la asignación de esta fecha?')) {
      deleteAssignmentMutation.mutate(assignment.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <Loading text="Loading quotes..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex-1 p-6 max-w-full">
        <CalendarHeader
          currentDate={currentDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onToday={handleToday}
        />

        <div className="mb-6">
          <Button onClick={() => setIsAddingEntry(!isAddingEntry)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Cotización
          </Button>
        </div>

        {selectedSedeId && (
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Sede seleccionada:</span>
              <span className="text-sm font-semibold text-blue-600">
                {sedes.find(s => s.id === selectedSedeId)?.nombre || 'N/A'}
              </span>
            </div>
          </div>
        )}

        {isAddingEntry && (
          <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
            <form onSubmit={handleSubmit}>
              <h3 className="text-lg font-semibold mb-4">
                {editingId ? 'Editar Cotización' : 'Nueva Cotización'}
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Select
                  label="Sede"
                  value={newEntry.sede_id || selectedSedeId || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, sede_id: e.target.value || selectedSedeId || '' })}
                  options={[
                    ...sedes.filter(s => s.activa).map(s => ({
                      value: s.id,
                      label: `${s.nombre} (${s.codigo})`,
                    })),
                  ]}
                  required
                  disabled
                />
                <Input
                  label="Zone"
                  value={newEntry.zone}
                  onChange={(e) => setNewEntry({ ...newEntry, zone: e.target.value })}
                  required
                />
                <Input
                  label="Equipment"
                  value={newEntry.equipment}
                  onChange={(e) => setNewEntry({ ...newEntry, equipment: e.target.value })}
                  required
                />
                <Input
                  label="Client"
                  value={newEntry.client}
                  onChange={(e) => setNewEntry({ ...newEntry, client: e.target.value })}
                  required
                />
                <Input
                  label="Notes/Observations"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                />
                <Select
                  label="Estado"
                  value={newEntry.estado || 'abierto'}
                  onChange={(e) => setNewEntry({ ...newEntry, estado: e.target.value as 'abierto' | 'cerrado' })}
                  options={[
                    { value: 'abierto', label: 'Abierta' },
                    { value: 'cerrado', label: 'Cerrada' },
                  ]}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" isLoading={addEntryMutation.isPending || updateEntryMutation.isPending}>
                  {editingId ? 'Guardar Cambios' : 'Guardar Cotización'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => {
                  setIsAddingEntry(false);
                  setEditingId(null);
                  setNewEntry({ zone: '', equipment: '', client: '', notes: '', sede_id: selectedSedeId || '', estado: 'abierto' });
                }}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {viewMode === 'month' ? (
          <QuoteMonthCalendarView
            entries={entries}
            assignments={quoteAssignments}
            currentDate={currentDate}
            onDeliveryToggle={handleDeliveryToggle}
            onDeleteAssignment={handleDeleteAssignment}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700" style={{ width: '80px' }}>Acciones</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700 min-w-24">Zone</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700 min-w-32">Equipment</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700 min-w-32">Client</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700 min-w-40">Notes</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700 min-w-24">Sede</th>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700 min-w-24">Estado</th>
                {days.map((day) => (
                  <th
                    key={day.toISOString()}
                    className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700 min-w-32"
                  >
                    {formatDateDisplay(day)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={8 + days.length} className="px-4 py-8 text-center text-gray-500">
                    No hay cotizaciones disponibles. Agrega una nueva cotización para comenzar.
                  </td>
                </tr>
              ) : (
                sortedEntries.map((entry: QuoteEntry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{entry.zone}</td>
                    <td className="border border-gray-300 px-4 py-2">{entry.equipment}</td>
                    <td className="border border-gray-300 px-4 py-2">{entry.client}</td>
                    <td className="border border-gray-300 px-4 py-2">{entry.notes}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {sedes.find(s => s.id === entry.sede_id)?.nombre || '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.estado === 'abierto'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {entry.estado === 'abierto' ? 'Abierta' : 'Cerrada'}
                      </span>
                    </td>
                    {days.map((day) => {
                      const dateStr = formatDate(day); // Usar formatDate para consistencia
                      const assignment = quoteAssignments.find(
                        (a: any) => a.quote_entry_id === entry.id && a.date.split('T')[0] === dateStr
                      );

                      const isPending = assignment?.status === 'pending';
                      const isDelivered = assignment?.status === 'delivered';
                      const isScheduled = assignment?.status === 'scheduled' || (assignment && !assignment.status);

                      return (
                        <td key={day.toISOString()} className="border border-gray-300 px-2 py-2">
                          <div className="min-h-16 rounded p-2 flex items-center justify-center gap-1">
                            {assignment ? (
                              <>
                                <button
                                  onClick={() => handleDeliveryToggle(entry.id, dateStr, assignment.status || 'scheduled')}
                                  className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                                    isDelivered
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                      : isPending
                                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  }`}
                                  title={isDelivered ? 'Entregado - Click para cambiar estado' : isPending ? 'Pendiente de entregar - Click para cambiar estado' : 'Programado - Click para cambiar estado'}
                                >
                                  <Package className="w-3 h-3" />
                                  {isDelivered ? 'Entregado' : isPending ? 'Entregar' : 'Programado'}
                                </button>
                                <button
                                  onClick={() => handleDeleteAssignment(entry.id, dateStr)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                  title="Eliminar asignación"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleDeliveryToggle(entry.id, dateStr, '')}
                                className="px-2 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded text-xs font-medium transition-colors flex items-center gap-1"
                                title="Marcar para entrega"
                              >
                                <Package className="w-3 h-3" />
                                Entregar
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};
