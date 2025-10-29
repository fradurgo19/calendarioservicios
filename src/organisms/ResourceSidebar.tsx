import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { DraggableResource } from '../molecules/DraggableResource';
import { Resource } from '../types';

interface ResourceSidebarProps {
  resources: Resource[];
  selectedSedeId?: string | null;
}

export const ResourceSidebar: React.FC<ResourceSidebarProps> = ({ resources, selectedSedeId }) => {
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
  const filteredResources = selectedSedeId
    ? resources.filter(r => r.sede_id === selectedSedeId)
    : resources;

  const technicians = filteredResources
    .filter((r) => r.type === 'technician')
    .sort(sortByNumber);
  const administrators = filteredResources
    .filter((r) => r.type === 'administrator')
    .sort(sortByNumber);
  // Las fases siempre se muestran todas, sin filtrar por sede
  const phases = resources
    .filter((r) => r.type === 'phase')
    .sort(sortByNumber);

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
                  <DraggableResource key={resource.id} resource={resource} index={index} />
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
                  <DraggableResource key={resource.id} resource={resource} index={index} />
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
