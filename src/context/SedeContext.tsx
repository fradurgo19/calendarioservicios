import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sede } from '../types';
import { sedesApi } from '../services/api';
import { useAuth } from './AuthContext';

interface SedeContextType {
  selectedSede: Sede | null;
  selectedSedeId: string | null;
  setSelectedSede: (sede: Sede | null) => void;
  clearSelectedSede: () => void;
}

const SedeContext = createContext<SedeContextType | undefined>(undefined);

export const SedeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [selectedSedeId, setSelectedSedeId] = useState<string | null>(() => {
    // Recuperar de localStorage si existe
    const saved = localStorage.getItem('selectedSedeId');
    return saved || null;
  });
  const [selectedSede, setSelectedSedeState] = useState<Sede | null>(null);

  // Resetear la sede solo cuando el usuario se desloguea (no durante la carga inicial)
  useEffect(() => {
    // Solo limpiar si ya terminó de cargar y no hay usuario Y no hay token
    // Esto evita limpiar la sede durante la carga inicial
    if (!isLoading && !user) {
      const token = localStorage.getItem('token');
      // Solo limpiar si realmente no hay token (se hizo logout)
      // No limpiar si solo está cargando inicialmente
      if (!token) {
        setSelectedSedeId(null);
        setSelectedSedeState(null);
        localStorage.removeItem('selectedSedeId');
      }
    }
  }, [user, isLoading]);

  // Cargar la sede completa cuando se inicializa el componente
  useEffect(() => {
    const loadSede = async () => {
      if (selectedSedeId) {
        try {
          const data = await sedesApi.get(selectedSedeId);
          setSelectedSedeState(data as Sede);
        } catch (error) {
          console.error('Error loading sede:', error);
          // Si no se encuentra la sede, limpiar
          setSelectedSedeId(null);
          localStorage.removeItem('selectedSedeId');
        }
      }
    };

    loadSede();
  }, [selectedSedeId]);

  // Cuando cambia el selectedSedeId, actualizar el selectedSede y localStorage
  useEffect(() => {
    if (selectedSedeId) {
      localStorage.setItem('selectedSedeId', selectedSedeId);
    } else {
      localStorage.removeItem('selectedSedeId');
      setSelectedSedeState(null);
    }
  }, [selectedSedeId]);

  const setSelectedSede = (sede: Sede | null) => {
    setSelectedSedeId(sede?.id || null);
    setSelectedSedeState(sede);
  };

  const clearSelectedSede = () => {
    setSelectedSedeId(null);
    setSelectedSedeState(null);
    localStorage.removeItem('selectedSedeId');
  };

  return (
    <SedeContext.Provider
      value={{
        selectedSede,
        selectedSedeId,
        setSelectedSede,
        clearSelectedSede,
      }}
    >
      {children}
    </SedeContext.Provider>
  );
};

export const useSede = () => {
  const context = useContext(SedeContext);
  if (context === undefined) {
    throw new Error('useSede must be used within a SedeProvider');
  }
  return context;
};

