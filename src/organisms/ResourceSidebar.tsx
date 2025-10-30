import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { DraggableResource } from '../molecules/DraggableResource';
import { Assignment, Resource, ViewMode } from '../types';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface ResourceSidebarProps {
  resources: Resource[];
  assignments?: Assignment[];
  currentDate?: Date;
  viewMode?: ViewMode;
  resourceFilter?: 'all' | 'technician' | 'administrator';
  resourceId?: string | null;
  selectedSedeId?: string | null;
}

export const ResourceSidebar: React.FC<ResourceSidebarProps> = ({ resources, assignments = [], currentDate = new Date(), viewMode = 'week', resourceFilter = 'all', resourceId = null, selectedSedeId }) => {
  // Función para extraer el número del nombre del recurso
  const extractNumber = (name: string): number => {
    const match = name.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // Función para ordenar recursos por número en su nombre
  const sortByNumber = (a: Resource, b: Resource): number => {
    const numA = extractNumber(a.name);
    const numB = extractNumber(b.name);
    if (numA !== numB) {
      return numA - numB;
    }
    // Si tienen el mismo número, ordenar alfabéticamente
    return a.name.localeCompare(b.name);
  };

  // Filtrar técnicos y administradores por sede si hay una seleccionada
  // Las fases son globales y se muestran siempre sin importar la sede
  const filteredBySede = selectedSedeId
    ? resources.filter(r => r.sede_id === selectedSedeId || r.type === 'phase')
    : resources;

  const filteredResources = filteredBySede.filter(r => {
    if (resourceFilter === 'technician') return r.type === 'technician';
    if (resourceFilter === 'administrator') return r.type === 'administrator';
    return true;
  });

  let technicians = filteredResources
    .filter((r) => r.type === 'technician')
    .sort(sortByNumber);
  let administrators = filteredResources
    .filter((r) => r.type === 'administrator')
    .sort(sortByNumber);
  if (resourceId) {
    technicians = technicians.filter(r => r.id === resourceId || resourceFilter !== 'technician');
    administrators = administrators.filter(r => r.id === resourceId || resourceFilter !== 'administrator');
  }
  // Las fases siempre se muestran todas, sin filtrar por sede
  const phases = resources
    .filter((r) => r.type === 'phase')
    .sort(sortByNumber);

  const activities = filteredBySede
    .filter((r) => r.type === 'activity')
    .sort(sortByNumber);

  const getRange = () => {
    switch (viewMode) {
      case 'day':
        return [startOfDay(currentDate), endOfDay(currentDate)] as const;
      case 'week':
        return [startOfWeek(currentDate, { weekStartsOn: 1 }), endOfWeek(currentDate, { weekStartsOn: 1 })] as const;
      case 'month':
      default:
        return [startOfMonth(currentDate), endOfMonth(currentDate)] as const;
    }
  };

  const [from, to] = getRange();

  const countAssignmentsForResource = (resourceId: string): number => {
    return assignments.filter(a => {
      if (a.resource_id !== resourceId) return false;
      const dateOnly = new Date(a.date.split('T')[0]);
      return dateOnly >= from && dateOnly <= to;
    }).length;
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-3 space-y-4 overflow-y-auto h-full">
        <div>
          <h3 className="text-xs font-semibold text-gray-700 mb-2">Technicians</h3>
          <Droppable droppableId="technicians-sidebar">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-1.5"
              >
                {technicians.map((resource, index) => (
                  <DraggableResource key={resource.id} resource={resource} index={index} countBadge={countAssignmentsForResource(resource.id)} />
                ))}
                {technicians.length === 0 && (
                  <p className="text-xs text-gray-500 italic">No hay técnicos en esta sede</p>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-700 mb-2">Administrators</h3>
          <Droppable droppableId="administrators-sidebar">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-1.5"
              >
                {administrators.map((resource, index) => (
                  <DraggableResource key={resource.id} resource={resource} index={index} countBadge={countAssignmentsForResource(resource.id)} />
                ))}
                {administrators.length === 0 && (
                  <p className="text-xs text-gray-500 italic">No hay administradores en esta sede</p>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-700 mb-2">Activities</h3>
          <Droppable droppableId="activities-sidebar">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-1.5"
              >
                {activities.map((resource, index) => (
                  <DraggableResource key={resource.id} resource={resource} index={index} countBadge={countAssignmentsForResource(resource.id)} />
                ))}
                {activities.length === 0 && (
                  <p className="text-xs text-gray-500 italic">No hay actividades en esta sede</p>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-700 mb-2">Phases</h3>
          <Droppable droppableId="phases-sidebar">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-1.5"
              >
                {phases.map((resource, index) => (
                  <DraggableResource key={resource.id} resource={resource} index={index} />
                ))}
                {phases.length === 0 && (
                  <p className="text-xs text-gray-500 italic">No hay fases disponibles</p>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </div>
  );
};
