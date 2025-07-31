// src/services/userService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/auth';

// Configurar axios para incluir el token JWT
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

// Servicio para obtener usuarios
export const userService = {
  // GET - Obtener todos los usuarios con rol MEMBER (rol_id = 3)
  getUsersWithMemberRole: async () => {
    try {
      const response = await api.get('');
      
      // Verificar si la respuesta tiene la estructura esperada
      let allUsers = [];
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Formato: {message: '...', data: [...], error: false, status: 'OK'}
        allUsers = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Formato directo: [...]
        allUsers = response.data;
      }
      
      // Filtrar usuarios con rol_id = 3 (MEMBER)
      const memberUsers = allUsers.filter(user => {
        // Verificar diferentes formas de encontrar rol_id = 3
        return user.rol_id === 3 ||
               user.rolId === 3 ||
               (user.rol && user.rol.id === 3) ||
               (user.role && user.role.id === 3) ||
               user.rol === 3;
      });
      
      return memberUsers;
      
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return [];
    }
  },

  // GET - Obtener todos los usuarios
  getAllUsers: async () => {
    return await userService.getUsersWithMemberRole();
  }
};
