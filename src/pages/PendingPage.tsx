import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigation } from '../organisms/Navigation';
import { PendingItemsTable } from '../organisms/PendingItemsTable';
import { Loading } from '../atoms/Loading';
import { PendingItem } from '../types';
import { pendingItemsApi } from '../services/api';
import { useSede } from '../context/SedeContext';

export const PendingPage: React.FC = () => {
  const { selectedSedeId } = useSede();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['pending-items', selectedSedeId],
    queryFn: async () => {
      const params: Record<string, string> | undefined = selectedSedeId ? { sede_id: selectedSedeId } : undefined;
      const data = await pendingItemsApi.list(params);
      return data;
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: Omit<PendingItem, 'id' | 'created_by' | 'created_at' | 'updated_at'>) => {
      return await pendingItemsApi.create(item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-items'] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, item }: { id: string; item: Partial<PendingItem> }) => {
      return await pendingItemsApi.update(id, item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-items'] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      return await pendingItemsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-items'] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <Loading text="Loading pending items..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto p-6">
        <PendingItemsTable
          items={items}
          onAdd={(item) => addItemMutation.mutate(item)}
          onEdit={(id, item) => updateItemMutation.mutate({ id, item })}
          onDelete={(id) => deleteItemMutation.mutate(id)}
        />
      </div>
    </div>
  );
};
