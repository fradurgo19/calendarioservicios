import React from 'react';
import { ViewMode } from '../types';
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';

interface ViewModeSelectorProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
  currentView,
  onViewChange,
}) => {
  const views: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'day', label: 'Day', icon: <Calendar className="w-4 h-4" /> },
    { mode: 'week', label: 'Week', icon: <CalendarDays className="w-4 h-4" /> },
    { mode: 'month', label: 'Month', icon: <CalendarRange className="w-4 h-4" /> },
  ];

  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {views.map(({ mode, label, icon }) => (
        <button
          key={mode}
          onClick={() => onViewChange(mode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
            currentView === mode
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};
