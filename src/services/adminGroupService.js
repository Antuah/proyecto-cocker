// src/services/adminGroupService.js
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

// Servicio para el registro de administradores de grupo
export const adminGroupService = {
  // POST - Registrar un nuevo administrador de grupo (rol = 2)
  registerAdminGroup: async (userData) => {
    try {
      // Construir nombre completo desde los campos separados
      const nombreCompleto = [
        userData.nombre,
        userData.apellidoPaterno,
        userData.apellidoMaterno
      ].filter(Boolean).join(' '); // filter(Boolean) elimina campos vacíos
      
      // Transformar al formato que espera el backend
      const adminGroupData = {
        username: userData.username,
        password: userData.password,
        rol: { id: 2 },  // ADMINGROUP
        nombreCompleto: nombreCompleto,
        telefono: userData.telefono || '',
        correo: userData.email  // email → correo
      };

      console.log('📤 Registrando administrador de grupo (formato correcto):', adminGroupData);

      // Usar fetch sin token JWT como el registerService original
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminGroupData),
      });

      const data = await response.json();
      console.log('📥 Respuesta del servidor:', data);

      if (response.ok) {
        return data;
      } else {
        console.error('❌ Error del servidor:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error al registrar administrador de grupo:', error);
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        // Error del servidor (4xx, 5xx)
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           `Error ${error.response.status}: ${error.response.statusText}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        // Error de red
        throw new Error('Error de conexión: No se pudo conectar con el servidor');
      } else {
        // Otro tipo de error
        throw new Error(error.message || 'Error desconocido');
      }
    }
  },

  // GET - Obtener administradores de grupo disponibles (rol = 2 y sin grupo asignado)
  getAvailableAdminGroups: async () => {
    try {
      console.log('🔍 Obteniendo administradores disponibles...');
      const response = await api.get('');
      
      console.log('📥 Respuesta cruda de usuarios:', response.data);
      
      // Extraer usuarios
      let allUsers = [];
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        allUsers = response.data.data;
      } else if (Array.isArray(response.data)) {
        allUsers = response.data;
      }
      
      console.log('👥 Total de usuarios encontrados:', allUsers.length);
      
      // Filtrar solo administradores de grupo (rol_id = 2) que NO tengan grupo asignado
      const availableAdmins = allUsers.filter(user => {
        const isAdminGroup = user.rol_id === 2 ||
                           user.rolId === 2 ||
                           (user.rol && user.rol.id === 2) ||
                           (user.role && user.role.id === 2) ||
                           user.rol === 2;
        
        // Verificar si ya tiene un grupo asignado (relación One-to-One)
        const hasNoGroup = !user.group && !user.grupo && !user.groupId;
        
        console.log(`👤 Usuario ${user.username || user.id}:`, {
          rol_id: user.rol_id,
          rolId: user.rolId,
          rol: user.rol,
          role: user.role,
          isAdminGroup,
          hasGroup: !hasNoGroup,
          group: user.group,
          grupo: user.grupo,
          groupId: user.groupId,
          willInclude: isAdminGroup && hasNoGroup
        });
        
        return isAdminGroup && hasNoGroup;
      });
      
      console.log('✅ Administradores disponibles:', availableAdmins.length, availableAdmins);
      
      return availableAdmins;
      
    } catch (error) {
      console.error('❌ Error al obtener administradores disponibles:', error);
      return [];
    }
  },

  // GET - Obtener todos los administradores de grupo (rol = 2) para la lista
  getAdminGroups: async () => {
    try {
      const response = await api.get('');
      
      // Extraer usuarios
      let allUsers = [];
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        allUsers = response.data.data;
      } else if (Array.isArray(response.data)) {
        allUsers = response.data;
      }
      
      // Filtrar solo administradores de grupo (rol_id = 2)
      const adminGroups = allUsers.filter(user => {
        return user.rol_id === 2 ||
               user.rolId === 2 ||
               (user.rol && user.rol.id === 2) ||
               (user.role && user.role.id === 2) ||
               user.rol === 2;
      });
      
      return adminGroups;
      
    } catch (error) {
      console.error('❌ Error al obtener administradores de grupo:', error);
      return [];
    }
  }
};
