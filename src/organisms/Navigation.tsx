import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSede } from '../context/SedeContext';
import { Calendar, FileText, ClipboardList, LogOut, Users, Building2 } from 'lucide-react';
import { Button } from '../atoms/Button';

export const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const { clearSelectedSede } = useSede();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/services', label: 'Services & Preparations', icon: <Calendar className="w-5 h-5" /> },
    { path: '/quotes', label: 'Quotes', icon: <FileText className="w-5 h-5" /> },
    { path: '/pending', label: 'Pending Items', icon: <ClipboardList className="w-5 h-5" /> },
    { path: '/resources', label: 'Resources', icon: <Users className="w-5 h-5" /> },
    { path: '/sedes', label: 'Sedes', icon: <Building2 className="w-5 h-5" /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-gray-900">Calendar Manager</h1>
            <div className="flex gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{user?.username}</span>
              <span className="ml-2 text-gray-400">({user?.role})</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={async () => {
                try {
                  // Limpiar la sede seleccionada
                  clearSelectedSede();
                  // Hacer logout
                  await logout();
                  // Redirigir al login
                  navigate('/login');
                } catch (error) {
                  console.error('Error al cerrar sesión:', error);
                  // Aun así, redirigir al login
                  navigate('/login');
                }
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
