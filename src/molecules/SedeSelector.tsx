import React from 'react';
import { Sede } from '../types';
import { MapPin } from 'lucide-react';

interface SedeSelectorProps {
  sedes: Sede[];
  selectedSedeId: string | null;
  onSedeChange: (sedeId: string | null) => void;
  showAll?: boolean;
}

export const SedeSelector: React.FC<SedeSelectorProps> = ({
  sedes,
  selectedSedeId,
  onSedeChange,
  showAll = true,
}) => {
  return (
    <div className="flex items-center gap-3">
      <MapPin className="w-5 h-5 text-gray-600" />
      <select
        value={selectedSedeId || ''}
        onChange={(e) => onSedeChange(e.target.value || null)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      >
        {showAll && <option value="">Todas las Sedes</option>}
        {sedes
          .filter(s => s.activa)
          .map((sede) => (
            <option key={sede.id} value={sede.id}>
              {sede.nombre} ({sede.codigo})
            </option>
          ))}
      </select>
    </div>
  );
};

