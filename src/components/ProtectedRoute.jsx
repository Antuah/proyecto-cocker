// src/components/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, requiredRole = null, fallback = null }) => {
  const { user, loading, isLoggedIn, isAdmin, isAdminGroup, isMember } = useAuth();

  // Si está cargando, mostrar loading
  if (loading) {
    return <div className="loading">Verificando permisos...</div>;
  }

  // Si no está logueado, mostrar mensaje de acceso denegado
  if (!isLoggedIn) {
    return (
      <div className="access-denied">
        <h3>Acceso Denegado</h3>
        <p>Debes iniciar sesión para acceder a esta página.</p>
      </div>
    );
  }

  // Verificar roles específicos
  if (requiredRole) {
    let hasRequiredRole = false;

    switch (requiredRole) {
      case 'admin':
      case 1:
        hasRequiredRole = isAdmin();
        break;
      case 'adminGroup':
      case 2:
        hasRequiredRole = isAdminGroup();
        break;
      case 'member':
      case 3:
        hasRequiredRole = isMember();
        break;
      default:
        hasRequiredRole = false;
    }

    // Si no tiene el rol requerido, mostrar mensaje o fallback
    if (!hasRequiredRole) {
      if (fallback) {
        return fallback;
      }
      
      return (
        <div className="access-denied">
          <h3>Acceso Denegado</h3>
          <p>No tienes permisos suficientes para acceder a esta página.</p>
          <p>Esta función está disponible solo para administradores del sistema.</p>
        </div>
      );
    }
  }

  // Si todo está bien, renderizar el componente hijo
  return children;
};

export default ProtectedRoute;
