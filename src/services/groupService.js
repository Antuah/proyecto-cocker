// src/services/groupService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/group';

// Configurar axios para incluir el token JWT si existe
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
    console.error('❌ Error en interceptor:', error);
    return Promise.reject(error);
  }
);

// Servicio para el CRUD de grupos
export const groupService = {
  // GET - Obtener todos los grupos
  getAllGroups: async () => {
    try {
      const response = await api.get('');
      
      // El backend devuelve: {message: '...', data: [...], error: false, status: 'OK'}
      // Pero necesitamos solo el array que está en data
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data; // Devolver solo el array
      } else {
        console.log('⚠️ Formato de respuesta inesperado:', response.data);
        return []; // Devolver array vacío si no hay datos
      }
    } catch (error) {
      console.error('❌ Error al obtener grupos:', error);
      throw error;
    }
  },

  // GET - Obtener un grupo por ID
  getGroupById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener grupo:', error);
      throw error;
    }
  },

  // POST - Crear un nuevo grupo
  createGroup: async (groupData) => {
    try {
      const response = await api.post('', groupData);
      
      // Extraer solo los datos del grupo creado
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error('Error al crear grupo:', error);
      throw error;
    }
  },

  // PUT - Actualizar un grupo
  updateGroup: async (id, groupData) => {
    try {
      const response = await api.put(`/${id}`, groupData);
      
      // Extraer solo los datos del grupo actualizado
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error('Error al actualizar grupo:', error);
      throw error;
    }
  },

  // DELETE - Eliminar un grupo
  deleteGroup: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar grupo:', error);
      throw error;
    }
  }
};
