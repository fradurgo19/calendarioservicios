import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSede } from '../context/SedeContext';
import { SedeSelectionPage } from '../pages/SedeSelectionPage';

interface RequiresSedeProps {
  children: React.ReactNode;
}

export const RequiresSede: React.FC<RequiresSedeProps> = ({ children }) => {
  const { selectedSedeId } = useSede();

  if (!selectedSedeId) {
    return <SedeSelectionPage />;
  }

  return <>{children}</>;
};

