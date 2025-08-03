// src/services/authService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/auth';

// Configurar axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token JWT a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Función para decodificar el token JWT
export const decodeToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error al decodificar token:', error);
    return null;
  }
};

// Función para verificar si el token ha expirado
export const isTokenExpired = (token) => {
  try {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return true;
    
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

// Función para obtener el usuario del token
export const getUserFromToken = () => {
  const token = localStorage.getItem('jwtToken');
  if (!token || isTokenExpired(token)) {
    return null;
  }
  
  return decodeToken(token);
};

// Servicio de autenticación
export const authService = {
  // POST - Login
  login: async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      
      // Extraer el token de la respuesta
      let token = null;
      if (response.data && response.data.data) {
        token = response.data.data;
      } else if (response.data && response.data.token) {
        token = response.data.token;
      } else if (typeof response.data === 'string') {
        token = response.data;
      }
      
      if (token) {
        localStorage.setItem('jwtToken', token);
        return { success: true, token, user: decodeToken(token) };
      } else {
        throw new Error('Token no encontrado en la respuesta');
      }
    } catch (error) {
      console.error('Error en login:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           `Error ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('Error de conexión: No se pudo conectar con el servidor');
      } else {
        throw new Error(error.message || 'Error desconocido');
      }
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('jwtToken');
    return { success: true };
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('jwtToken');
    return token && !isTokenExpired(token);
  },

  // Obtener el usuario actual
  getCurrentUser: () => {
    return getUserFromToken();
  },

  // Verificar roles
  hasRole: (requiredRole) => {
    const user = getUserFromToken();
    if (!user) return false;

    // Normalizar el rol requerido
    let roleId = requiredRole;
    if (typeof requiredRole === 'string') {
      switch (requiredRole) {
        case 'admin':
          roleId = 1;
          break;
        case 'adminGroup':
          roleId = 2;
          break;
        case 'member':
          roleId = 3;
          break;
        default:
          roleId = parseInt(requiredRole);
      }
    }

    // Verificar el rol del usuario
    return user.rol_id === roleId || 
           user.rolId === roleId || 
           (user.rol && user.rol.id === roleId) ||
           (user.role && user.role.id === roleId) ||
           user.rol === roleId;
  }
};
