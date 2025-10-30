import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Resource } from '../types';
import { User, UserCog, Hash, Flag } from 'lucide-react';

interface DraggableResourceProps {
  resource: Resource;
  index: number;
  countBadge?: number;
}

export const DraggableResource: React.FC<DraggableResourceProps> = ({ resource, index, countBadge }) => {
  const getIcon = () => {
    switch (resource.type) {
      case 'technician':
        return <User className="w-3 h-3" />;
      case 'administrator':
        return <UserCog className="w-3 h-3" />;
      case 'phase':
        return <Hash className="w-3 h-3" />;
      case 'activity':
        return <Flag className="w-3 h-3" />;
    }
  };

  const getColorClass = () => {
    switch (resource.type) {
      case 'technician':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'administrator':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'phase':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'activity':
        return 'bg-amber-100 text-amber-700 border-amber-300';
    }
  };

  return (
    <Draggable draggableId={resource.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded border cursor-move transition-all ${getColorClass()} ${
            snapshot.isDragging ? 'shadow-lg scale-105' : ''
          } ${!resource.available ? 'opacity-50' : ''}`}
        >
          {getIcon()}
          <span className="font-medium text-xs">{resource.name}</span>
          {typeof countBadge === 'number' && (
            <span
              className={
                `ml-auto inline-flex items-center justify-center min-w-[1rem] h-4 px-1 rounded-full text-[10px] font-bold ` +
                (resource.type === 'technician' || resource.type === 'administrator' || resource.type === 'activity'
                  ? 'bg-red-500 text-white'
                  : 'bg-white/70 border border-current')
              }
            >
              {countBadge}
            </span>
          )}
        </div>
      )}
    </Draggable>
  );
};
