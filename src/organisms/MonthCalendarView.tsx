import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { ServiceEntry, Assignment, Resource } from '../types';
import { formatDate } from '../services/dateUtils';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, eachWeekOfInterval, format } from 'date-fns';

interface MonthCalendarViewProps {
  entries: ServiceEntry[];
  assignments: Assignment[];
  resources: Resource[];
  currentDate: Date;
  onEntryClick?: (entry: ServiceEntry) => void;
}

export const MonthCalendarView: React.FC<MonthCalendarViewProps> = ({
  entries,
  assignments,
  resources,
  currentDate,
  onEntryClick,
}) => {
  // Obtener todas las semanas del mes
  const getMonthWeeks = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const monthStart = startOfWeek(start, { weekStartsOn: 1 }); // Lunes
    const monthEnd = endOfWeek(end, { weekStartsOn: 1 });

    const weeks = eachWeekOfInterval(
      { start: monthStart, end: monthEnd },
      { weekStartsOn: 1 }
    );

    return weeks.map(weekStart => {
      return eachDayOfInterval({
        start: weekStart,
        end: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 5) // Lunes a Sábado
      });
    });
  };

  const weeks = getMonthWeeks();

  // Obtener asignaciones para una fecha específica
  const getAssignmentsForDate = (date: Date) => {
    const dateStr = formatDate(date); // 'yyyy-MM-dd'
    return assignments.filter(a => {
      // Normalizar la fecha del assignment a formato 'yyyy-MM-dd'
      const assignmentDate = a.date.split('T')[0];
      return assignmentDate === dateStr;
    });
  };

  // Agrupar asignaciones por servicio_entry_id
  const groupAssignmentsByEntry = (dateAssignments: Assignment[]) => {
    const grouped = new Map<string, Assignment[]>();
    dateAssignments.forEach(assignment => {
      const entryId = assignment.service_entry_id;
      if (!grouped.has(entryId)) {
        grouped.set(entryId, []);
      }
      grouped.get(entryId)!.push(assignment);
    });
    return grouped;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Encabezado de días de la semana */}
      <div className="grid grid-cols-6 border-b">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="p-2 text-center font-semibold text-gray-700 bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      {/* Semanas del mes */}
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-6 border-b last:border-b-0">
          {week.map((day, dayIndex) => {
            const dateStr = formatDate(day);
            const dayAssignments = getAssignmentsForDate(day);
            const droppableId = `month-cell-${dateStr}`;
            const isOtherMonth = !isCurrentMonth(day);

            return (
              <div
                key={dayIndex}
                className={`min-h-32 border-r last:border-r-0 p-2 ${
                  isOtherMonth ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                {/* Número del día */}
                <div className={`text-sm font-semibold mb-1 ${
                  isOtherMonth ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  {format(day, 'd')}
                </div>

                {/* Área de drop para asignaciones */}
                <Droppable droppableId={droppableId}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-20 rounded p-1 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      }`}
                    >
                      {/* Lista de asignaciones agrupadas por servicio */}
                      <div className="space-y-1">
                        {Array.from(groupAssignmentsByEntry(dayAssignments).entries()).slice(0, 3).map(([entryId, entryAssignments]) => {
                          const entry = entries.find(e => e.id === entryId);
                          if (!entry) return null;
                          
                          // Obtener recursos asignados
                          const assignedResources = entryAssignments
                            .map(a => resources.find(r => r.id === a.resource_id))
                            .filter(Boolean) as Resource[];
                          
                          const getTypeLabel = () => {
                            return entry.type === 'Service' ? 'Servicio' : entry.type === 'Preparation' ? 'Alistamiento' : 'Garantía';
                          };
                          
                          const getTypeColor = () => {
                            return entry.type === 'Service'
                              ? 'bg-blue-100 text-blue-700 border-blue-200'
                              : entry.type === 'Preparation'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : 'bg-purple-100 text-purple-700 border-purple-200';
                          };
                          
                          return (
                            <div
                              key={entryId}
                              onClick={() => onEntryClick?.(entry)}
                              className={`text-[10px] p-1.5 rounded border ${getTypeColor()} hover:opacity-80 cursor-pointer transition-all hover:shadow-md`}
                              title={`Click para ver detalles - ${entry.site} - ${entry.client} - ${entry.equipment || 'Sin equipo'}`}
                            >
                              <div className="font-semibold truncate mb-0.5">{entry.site}</div>
                              {entry.equipment && (
                                <div className="text-[9px] truncate opacity-90 mb-0.5">
                                  Equipo: {entry.equipment}
                                </div>
                              )}
                              <div className="text-[9px] font-medium mb-1">
                                {getTypeLabel()}
                              </div>
                              {assignedResources.length > 0 && (
                                <div className="flex flex-wrap gap-0.5 mt-1">
                                  {assignedResources.map((resource) => {
                                    const getResourceColor = () => {
                                      switch (resource.type) {
                                        case 'technician':
                                          return 'bg-blue-200 text-blue-800';
                                        case 'administrator':
                                          return 'bg-green-200 text-green-800';
                                        case 'phase':
                                          return 'bg-orange-200 text-orange-800';
                                        case 'activity':
                                          return 'bg-red-200 text-red-800';
                                        default:
                                          return 'bg-gray-200 text-gray-800';
                                      }
                                    };
                                    return (
                                      <span
                                        key={resource.id}
                                        className={`px-1 py-0.5 rounded text-[8px] font-medium ${getResourceColor()}`}
                                        title={resource.name}
                                      >
                                        {resource.name}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {/* Indicador de más asignaciones */}
                        {dayAssignments.length > 0 && Array.from(groupAssignmentsByEntry(dayAssignments).entries()).length > 3 && (
                          <div className="text-[10px] text-gray-500 text-center pt-1">
                            +{Array.from(groupAssignmentsByEntry(dayAssignments).entries()).length - 3} más
                          </div>
                        )}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

