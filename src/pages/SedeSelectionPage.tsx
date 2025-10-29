import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Sede } from '../types';
import { sedesApi } from '../services/api';
import { useSede } from '../context/SedeContext';
import { Card } from '../atoms/Card';
import { Loading } from '../atoms/Loading';
import { Button } from '../atoms/Button';
import { MapPin, Building2, Plus } from 'lucide-react';

export const SedeSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedSede } = useSede();
  const [isSelecting, setIsSelecting] = useState(false);

  const { data: sedes = [], isLoading, error } = useQuery({
    queryKey: ['sedes'],
    queryFn: async () => {
      try {
        // Obtener todas las sedes y filtrar las activas
        const allSedes = await sedesApi.list();
        const activeSedes = allSedes.filter((s: Sede) => s.activa);
        
        // Si hay sedes activas, retornarlas; si no, retornar todas
        return activeSedes.length > 0 ? activeSedes : (allSedes as Sede[]);
      } catch (err: unknown) {
        console.error('Error al cargar sedes:', err);
        // En caso de error, retornar array vacío
        return [];
      }
    },
  });

  const handleSelectSede = (sede: Sede) => {
    setIsSelecting(true);
    setSelectedSede(sede);
    // Redirigir a la página de servicios después de seleccionar
    setTimeout(() => {
      navigate('/services');
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loading text="Cargando sedes..." />
      </div>
    );
  }

  // Si hay error, mostrar mensaje informativo
  const errorObj = error as { message?: string; code?: string } | null;
  if (error && errorObj?.message) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 shadow-2xl">
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Error al cargar sedes
            </h1>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : JSON.stringify(error)}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Por favor, verifica tu conexión o contacta al administrador.
            </p>
            <div className="mt-4">
              <Link to="/sedes">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Ir a Gestión de Sedes
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 rounded-full p-4">
              <Building2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Selección de Sede
          </h1>
          <p className="text-lg text-gray-600">
            Por favor, seleccione la sede con la que desea trabajar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sedes.map((sede: Sede) => (
            <button
              key={sede.id}
              onClick={() => handleSelectSede(sede)}
              disabled={isSelecting}
              className="group relative overflow-hidden bg-white border-2 border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                  {sede.codigo}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {sede.nombre}
              </h3>
              
              {sede.ciudad && (
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Ciudad:</span> {sede.ciudad}
                </p>
              )}
              
              {sede.direccion && (
                <p className="text-sm text-gray-500 mb-4">
                  {sede.direccion}
                </p>
              )}

              <div className="mt-4 flex items-center text-blue-600 font-medium text-sm">
                Seleccionar
                <svg
                  className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {sedes.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              No hay sedes disponibles
            </p>
            <p className="text-gray-400 text-sm mb-6">
              La tabla de sedes no existe o no hay sedes creadas. Ejecuta el script CREATE_SEDES_TABLE.sql en tu base de datos y luego crea tu primera sede.
            </p>
            <Link to="/sedes">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ir a Gestión de Sedes
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};
