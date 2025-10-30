import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { ServiceEntry, Assignment, ViewMode, Resource } from '../types';
import { formatDate, getWeekDays, getMonthWeeks, formatDateDisplay } from '../services/dateUtils';
import { Edit2, X } from 'lucide-react';

interface ServiceCalendarGridProps {
  entries: ServiceEntry[];
  assignments: Assignment[];
  resources: Resource[];
  currentDate: Date;
  viewMode: ViewMode;
  onEdit?: (entry: ServiceEntry) => void;
  onClose?: (entryId: string) => void;
  onRemoveAssignment?: (assignmentId: string) => void;
}

export const ServiceCalendarGrid: React.FC<ServiceCalendarGridProps> = ({
  entries,
  assignments,
  resources,
  currentDate,
  viewMode,
  onEdit,
  onClose,
  onRemoveAssignment,
}) => {
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

  const getAssignmentsForCell = (entryId: string, date: Date) => {
    const targetDate = formatDate(date); // 'yyyy-MM-dd'
    
    return assignments.filter((a) => {
      // Normalizar la fecha del assignment a formato 'yyyy-MM-dd'
      // Puede venir como ISO string ('2025-10-31T05:00:00.000Z') o como 'yyyy-MM-dd'
      const assignmentDate = a.date.split('T')[0];
      
      return a.service_entry_id === entryId && assignmentDate === targetDate;
    });
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-300 px-1 py-1 text-center text-xs font-semibold text-gray-700" style={{ width: '50px' }}>Acciones</th>
            <th className="border border-gray-300 px-1 py-1 text-left text-xs font-semibold text-gray-700" style={{ width: '80px' }}>Sede</th>
            <th className="border border-gray-300 px-1 py-1 text-left text-xs font-semibold text-gray-700" style={{ width: '100px' }}>Cliente</th>
            <th className="border border-gray-300 px-1 py-1 text-left text-xs font-semibold text-gray-700" style={{ width: '80px' }}>Sitio</th>
            <th className="border border-gray-300 px-1 py-1 text-left text-xs font-semibold text-gray-700" style={{ width: '60px' }}>Zona</th>
            <th className="border border-gray-300 px-1 py-1 text-left text-xs font-semibold text-gray-700" style={{ width: '80px' }}>OTT</th>
            <th className="border border-gray-300 px-1 py-1 text-left text-xs font-semibold text-gray-700" style={{ width: '80px' }}>Equipo</th>
            <th className="border border-gray-300 px-1 py-1 text-left text-xs font-semibold text-gray-700" style={{ width: '70px' }}>Tipo</th>
            <th className="border border-gray-300 px-1 py-1 text-left text-xs font-semibold text-gray-700" style={{ width: '70px' }}>Eq. Estado</th>
            <th className="border border-gray-300 px-1 py-1 text-left text-xs font-semibold text-gray-700" style={{ width: '80px' }}>Asesor</th>
            <th className="border border-gray-300 px-1 py-1 text-left text-xs font-semibold text-gray-700" style={{ width: '100px' }}>Observaciones</th>
            <th className="border border-gray-300 px-1 py-1 text-left text-xs font-semibold text-gray-700" style={{ width: '70px' }}>Estado</th>
            {days.map((day) => (
              <th
                key={day.toISOString()}
                className="border border-gray-300 px-2 py-2 text-center text-sm font-semibold bg-blue-50 text-blue-900"
                style={{ minWidth: '150px' }}
              >
                <div className="text-sm font-bold">{formatDateDisplay(day)}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={13 + days.length} className="px-4 py-8 text-center text-gray-500">
                No hay servicios disponibles. Agrega un nuevo servicio para comenzar.
              </td>
            </tr>
          ) : (
            entries.map((entry: any) => (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-1 py-1">
                <div className="flex justify-center gap-1">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(entry)}
                      className="p-1 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                  {onClose && entry.estado === 'abierto' && (
                    <button
                      onClick={() => onClose(entry.id)}
                      className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                      title="Cerrar Servicio"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </td>
              <td className="border border-gray-300 px-1 py-1 text-xs">
                <div className="truncate" title={entry.sede_nombre ? `${entry.sede_nombre} (${entry.sede_codigo})` : '-'}>
                  {entry.sede_nombre ? `${entry.sede_nombre} (${entry.sede_codigo})` : '-'}
                </div>
              </td>
              <td className="border border-gray-300 px-1 py-1 text-xs">
                <div className="truncate" title={entry.client}>{entry.client}</div>
              </td>
              <td className="border border-gray-300 px-1 py-1 text-xs">
                <div className="truncate" title={entry.site}>{entry.site}</div>
              </td>
              <td className="border border-gray-300 px-1 py-1 text-xs">
                <div className="truncate" title={entry.zone}>{entry.zone}</div>
              </td>
              <td className="border border-gray-300 px-1 py-1 text-xs">
                <div className="truncate" title={entry.ott}>{entry.ott}</div>
              </td>
              <td className="border border-gray-300 px-1 py-1 text-xs">
                <div className="truncate" title={entry.equipment || '-'}>{entry.equipment || '-'}</div>
              </td>
              <td className="border border-gray-300 px-1 py-1 text-xs">
                {(() => {
                  const cls = entry.type === 'Service'
                    ? 'bg-blue-100 text-blue-700'
                    : entry.type === 'Preparation'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-purple-100 text-purple-700';
                  const label = entry.type === 'Service' ? 'Serv.' : entry.type === 'Preparation' ? 'Prep.' : 'Garant.';
                  return (
                    <span className={`px-1 py-0.5 rounded-full text-[10px] font-medium ${cls}`}>
                      {label}
                    </span>
                  );
                })()}
              </td>
              <td className="border border-gray-300 px-1 py-1 text-xs">
                <span
                  className={`px-1 py-0.5 rounded-full text-[10px] font-medium ${
                    entry.equipment_state === 'New'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {entry.equipment_state === 'New' ? 'Nuevo' : 'Usado'}
                </span>
              </td>
              <td className="border border-gray-300 px-1 py-1 text-xs">
                <div className="truncate" title={entry.advisor}>{entry.advisor}</div>
              </td>
              <td className="border border-gray-300 px-1 py-1 text-xs">
                {entry.notas ? (
                  <div className="truncate" title={entry.notas}>
                    {entry.notas}
                  </div>
                ) : (
                  '-'
                )}
              </td>
              <td className="border border-gray-300 px-1 py-1 text-xs">
                <span
                  className={`px-1 py-0.5 rounded-full text-[10px] font-medium ${
                    entry.estado === 'abierto'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {entry.estado === 'abierto' ? 'Abierto' : 'Cerrado'}
                </span>
              </td>
              {days.map((day) => {
                const cellAssignments = getAssignmentsForCell(entry.id, day);
                const droppableId = `cell-${entry.id}::${formatDate(day)}`;

                return (
                  <td key={day.toISOString()} className="border border-gray-300 px-2 py-2 bg-gray-50">
                    <Droppable droppableId={droppableId} isDropDisabled={false}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-h-24 rounded p-2 transition-colors ${
                            snapshot.isDraggingOver ? 'bg-blue-100 border-2 border-blue-400' : 'border border-transparent bg-white'
                          }`}
                          style={provided.droppableProps.style}
                        >
                          <div className="flex flex-wrap gap-1">
                            {cellAssignments.map((assignment) => {
                              const resource = resources.find(r => r.id === assignment.resource_id);
                              const getColorClass = () => {
                                if (!resource) return 'bg-gray-100 text-gray-700';
                                switch (resource.type) {
                                  case 'technician':
                                    return 'bg-blue-100 text-blue-700';
                                  case 'administrator':
                                    return 'bg-green-100 text-green-700';
                                  case 'phase':
                                    return 'bg-orange-100 text-orange-700';
                                  case 'activity':
                                    return 'bg-red-100 text-red-700';
                                  default:
                                    return 'bg-gray-100 text-gray-700';
                                }
                              };
                              return (
                                <span
                                  key={assignment.id}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getColorClass()} group hover:opacity-80`}
                                  title={resource?.name || assignment.resource_id}
                                >
                                  <span>{resource?.name || assignment.resource_id}</span>
                                  {onRemoveAssignment && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm(`¿Remover ${resource?.name || 'este recurso'} de esta fecha?`)) {
                                          onRemoveAssignment(assignment.id);
                                        }
                                      }}
                                      className="opacity-0 group-hover:opacity-100 hover:bg-red-200 rounded p-0.5 transition-opacity"
                                      title="Remover asignación"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </td>
                );
              })}
            </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
