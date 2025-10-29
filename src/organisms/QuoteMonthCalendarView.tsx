import React from 'react';
import { QuoteEntry, QuoteAssignment } from '../types';
import { formatDate } from '../services/dateUtils';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, eachWeekOfInterval, format } from 'date-fns';
import { X } from 'lucide-react';

interface QuoteMonthCalendarViewProps {
  entries: QuoteEntry[];
  assignments: QuoteAssignment[];
  currentDate: Date;
  onDeliveryToggle: (quoteEntryId: string, date: string, currentStatus: string) => void;
  onDeleteAssignment: (quoteEntryId: string, date: string) => void;
}

export const QuoteMonthCalendarView: React.FC<QuoteMonthCalendarViewProps> = ({
  entries,
  assignments,
  currentDate,
  onDeliveryToggle,
  onDeleteAssignment,
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

  // Agrupar asignaciones por quote_entry_id
  const groupAssignmentsByEntry = (dateAssignments: QuoteAssignment[]) => {
    const grouped = new Map<string, QuoteAssignment[]>();
    dateAssignments.forEach(assignment => {
      const entryId = assignment.quote_entry_id;
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

                {/* Lista de cotizaciones y entregas */}
                <div className="space-y-1">
                  {Array.from(groupAssignmentsByEntry(dayAssignments).entries()).slice(0, 3).map(([entryId, entryAssignments]) => {
                    const entry = entries.find(e => e.id === entryId);
                    if (!entry) return null;
                    
                    const assignment = entryAssignments[0]; // Tomar el primero
                    const isPending = assignment.status === 'pending';
                    const isDelivered = assignment.status === 'delivered';
                    
                    return (
                      <div
                        key={entryId}
                        className={`text-[10px] p-1.5 rounded border ${
                          isDelivered 
                            ? 'bg-green-100 text-green-700 border-green-200' 
                            : isPending
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            : 'bg-blue-100 text-blue-700 border-blue-200'
                        }`}
                        title={`${entry.client} - ${entry.equipment}`}
                      >
                        <div className="font-semibold truncate mb-0.5">{entry.client}</div>
                        <div className="text-[9px] truncate opacity-90 mb-1">
                          {entry.equipment}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onDeliveryToggle(entryId, dateStr, assignment.status)}
                            className={`flex-1 px-1 py-0.5 rounded text-[8px] font-medium transition-colors ${
                              isDelivered
                                ? 'bg-green-200 text-green-800 hover:bg-green-300'
                                : isPending
                                ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
                                : 'bg-blue-200 text-blue-800 hover:bg-blue-300'
                            }`}
                          >
                            {isDelivered ? 'Entregado ✓' : isPending ? 'Entregar' : 'Programado'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Eliminar la asignación de esta fecha?')) {
                                onDeleteAssignment(entryId, dateStr);
                              }
                            }}
                            className="p-0.5 text-red-600 hover:bg-red-200 rounded transition-colors"
                            title="Eliminar asignación"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
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
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
