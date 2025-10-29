import React, { useState, useEffect } from 'react';
import { PendingItem } from '../types';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { useSede } from '../context/SedeContext';
import { useQuery } from '@tanstack/react-query';
import { sedesApi } from '../services/api';
import { Sede } from '../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface PendingItemsTableProps {
  items: PendingItem[];
  onAdd: (item: Omit<PendingItem, 'id' | 'created_by' | 'created_at' | 'updated_at'>) => void;
  onEdit: (id: string, item: Partial<PendingItem>) => void;
  onDelete: (id: string) => void;
}

export const PendingItemsTable: React.FC<PendingItemsTableProps> = ({
  items,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const { selectedSedeId } = useSede();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    item: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    assigned_to: '',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    observations: '',
    sede_id: selectedSedeId || '',
    estado: 'abierto',
  });

  // Actualizar sede_id cuando cambie selectedSedeId (solo cuando no está editando)
  useEffect(() => {
    if (selectedSedeId && !editingId) {
      setNewItem(prev => ({ ...prev, sede_id: selectedSedeId }));
    }
  }, [selectedSedeId, editingId]);

  const { data: sedes = [] } = useQuery({
    queryKey: ['sedes'],
    queryFn: async () => {
      const data = await sedesApi.list();
      return data as Sede[];
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onEdit(editingId, newItem);
      setEditingId(null);
    } else {
      onAdd(newItem);
    }
    setNewItem({
      item: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      assigned_to: '',
      due_date: format(new Date(), 'yyyy-MM-dd'),
      observations: '',
      sede_id: selectedSedeId || '',
      estado: 'abierto',
    });
    setIsAdding(false);
  };

  const handleEditClick = (item: PendingItem) => {
    setEditingId(item.id);
    setNewItem({
      item: item.item,
      date: item.date,
      assigned_to: item.assigned_to,
      due_date: item.due_date,
      observations: item.observations || '',
      sede_id: item.sede_id || selectedSedeId || '',
      estado: item.estado || 'abierto',
    });
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewItem({
      item: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      assigned_to: '',
      due_date: format(new Date(), 'yyyy-MM-dd'),
      observations: '',
      sede_id: selectedSedeId || '',
      estado: 'abierto',
    });
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pending Items</h2>
        <Button onClick={() => { 
          setIsAdding(true); 
          setEditingId(null);
          setNewItem({
            item: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            assigned_to: '',
            due_date: format(new Date(), 'yyyy-MM-dd'),
            observations: '',
            sede_id: selectedSedeId || '',
            estado: 'abierto',
          });
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {isAdding && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Editar Item Pendiente' : 'Nuevo Item Pendiente'}
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Select
                label="Sede"
                value={newItem.sede_id || selectedSedeId || ''}
                onChange={(e) => setNewItem({ ...newItem, sede_id: e.target.value })}
                options={[
                  ...sedes.filter(s => s.activa).map(s => ({
                    value: s.id,
                    label: `${s.nombre} (${s.codigo})`,
                  })),
                ]}
                required
                disabled={!editingId} // Deshabilitado al agregar nuevo, habilitado al editar
              />
              <Select
                label="Estado"
                value={newItem.estado}
                onChange={(e) => setNewItem({ ...newItem, estado: e.target.value })}
                options={[
                  { value: 'abierto', label: 'Abierto' },
                  { value: 'cerrado', label: 'Cerrado' },
                ]}
              />
              <Input
                label="Pending Item"
                value={newItem.item}
                onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                required
              />
              <Input
                label="Date"
                type="date"
                value={newItem.date}
                onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                required
              />
              <Input
                label="Assigned To"
                value={newItem.assigned_to}
                onChange={(e) => setNewItem({ ...newItem, assigned_to: e.target.value })}
                required
              />
              <Input
                label="Due Date"
                type="date"
                value={newItem.due_date}
                onChange={(e) => setNewItem({ ...newItem, due_date: e.target.value })}
                required
              />
            </div>
            <Input
              label="Observations"
              value={newItem.observations}
              onChange={(e) => setNewItem({ ...newItem, observations: e.target.value })}
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button type="submit">{editingId ? 'Guardar Cambios' : 'Guardar Item'}</Button>
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Sede</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Estado</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Pending Item</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Assigned To</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Due Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Observations</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  {sedes.find(s => s.id === item.sede_id)?.nombre || item.sede_id || '-'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.estado === 'abierto'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.estado === 'abierto' ? 'Abierto' : 'Cerrado'}
                  </span>
                </td>
                <td className="px-4 py-3">{item.item}</td>
                <td className="px-4 py-3">{format(new Date(item.date), 'MMM d, yyyy')}</td>
                <td className="px-4 py-3">{item.assigned_to}</td>
                <td className="px-4 py-3">{format(new Date(item.due_date), 'MMM d, yyyy')}</td>
                <td className="px-4 py-3">{item.observations}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEditClick(item)} className="p-1 hover:bg-gray-200 rounded">
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
