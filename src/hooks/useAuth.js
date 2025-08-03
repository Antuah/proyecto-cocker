// src/hooks/useAuth.js
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    
    if (token) {
      try {
        // Decodificar el token JWT para obtener la información del usuario
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        
        // Verificar si el token no ha expirado
        if (tokenPayload.exp && tokenPayload.exp * 1000 > Date.now()) {
          setUser(tokenPayload);
          setIsLoggedIn(true);
        } else {
          // Token expirado
          localStorage.removeItem('jwtToken');
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error al decodificar token:', error);
        localStorage.removeItem('jwtToken');
        setUser(null);
        setIsLoggedIn(false);
      }
    }
    
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setUser(null);
    setIsLoggedIn(false);
  };

  const login = (token) => {
    localStorage.setItem('jwtToken', token);
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      setUser(tokenPayload);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error al procesar token de login:', error);
    }
  };

  // Verificar si el usuario es administrador (rol = 1)
  const isAdmin = () => {
    if (!user) return false;
    
    // Verificar por rol en el token
    const hasRoleInToken = user.rol_id === 1 || 
                          user.rolId === 1 || 
                          (user.rol && user.rol.id === 1) ||
                          (user.role && user.role.id === 1) ||
                          user.rol === 1;
    
    // FALLBACK: Si el username es "admin", asumir que es administrador
    const isAdminByUsername = user.sub === 'admin' || user.username === 'admin';
    
    return hasRoleInToken || isAdminByUsername;
  };

  // Verificar si el usuario es administrador de grupo (rol = 2)
  const isAdminGroup = () => {
    if (!user) return false;
    
    return user.rol_id === 2 || 
           user.rolId === 2 || 
           (user.rol && user.rol.id === 2) ||
           (user.role && user.role.id === 2) ||
           user.rol === 2;
  };

  // Verificar si el usuario es miembro (rol = 3)
  const isMember = () => {
    if (!user) return false;
    
    return user.rol_id === 3 || 
           user.rolId === 3 || 
           (user.rol && user.rol.id === 3) ||
           (user.role && user.role.id === 3) ||
           user.rol === 3;
  };

  return {
    user,
    loading,
    isLoggedIn,
    isAdmin,
    isAdminGroup,
    isMember,
    login,
    logout
  };
};
