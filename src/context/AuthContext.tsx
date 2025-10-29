import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { User, AuthContextType, UserRole } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Verificar que el token sigue siendo válido
          const userData = await authApi.getMe();
          setUser(userData as User);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          // Token inválido, limpiar
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login(username, password);
      
      // Guardar token y usuario
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user as User);
      return response;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  };

  const register = async (username: string, email: string, password: string, role: UserRole) => {
    try {
      const response = await authApi.register(username, email, password, role);
      
      // Guardar token y usuario
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user as User);
      return response;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Error al registrarse');
    }
  };

  const logout = async () => {
    try {
      authApi.logout();
      // Limpiar token y usuario
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      // Limpiar también la sede seleccionada
      localStorage.removeItem('selectedSedeId');
    } catch (error) {
      console.error('Logout error:', error);
      // Aun así, limpiar todo localmente
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedSedeId');
      setUser(null);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
