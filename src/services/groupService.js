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
      // Transformar selectedUsers [1, 2, 3] a formato que espera el backend
      const usersForBackend = groupData.selectedUsers.map(userId => ({
        id: userId
      }));
      
      // Formato correcto según Swagger
      const backendData = {
        name: groupData.name,
        municipio: groupData.municipio,
        colonia: groupData.colonia,
        users: usersForBackend  // Array de objetos con {id: numero}
      };
      
      const response = await api.post('', backendData);
      
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
      // Transformar selectedUsers [1, 2, 3] a formato que espera el backend
      const usersForBackend = groupData.selectedUsers.map(userId => ({
        id: userId
      }));
      
      // Formato correcto según Swagger (incluye el id del grupo)
      const backendData = {
        id: parseInt(id),  // Asegurar que sea número
        name: groupData.name,
        municipio: groupData.municipio,
        colonia: groupData.colonia,
        users: usersForBackend
      };
      
      // ✅ CORRECCIÓN: Backend tiene @PutMapping("") sin /{id}
      const response = await api.put('', backendData);  // Sin /${id} en la URL
      
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
      // ✅ CORRECCIÓN: Backend tiene @DeleteMapping("") sin /{id}
      // Y espera el objeto grupo completo en el body
      const groupToDelete = {
        id: parseInt(id)  // Backend necesita al menos el ID en el body
      };
      
      const response = await api.delete('', { data: groupToDelete });  // Sin /${id} en URL, con data en body
      return response.data;
    } catch (error) {
      console.error('Error al eliminar grupo:', error);
      throw error;
    }
  }
};
