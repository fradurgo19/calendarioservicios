import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '../molecules/LoginForm';
import { RegisterForm } from '../molecules/RegisterForm';
import { Card } from '../atoms/Card';
import { Loading } from '../atoms/Loading';
import { Calendar } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { user, login, register, isLoading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading text="Loading..." />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/services" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar Manager</h1>
          <p className="text-gray-600 mt-2">
            {isLoginMode ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {isLoginMode ? (
          <LoginForm onSubmit={login} onToggleMode={() => setIsLoginMode(false)} />
        ) : (
          <RegisterForm onSubmit={register} onToggleMode={() => setIsLoginMode(true)} />
        )}
      </Card>
    </div>
  );
};
