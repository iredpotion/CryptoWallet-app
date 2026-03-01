import React from 'react';
import { Navigate } from 'react-router-dom';

// Valida a sessão do usuário através do token e protege a renderização de componentes privados
export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}