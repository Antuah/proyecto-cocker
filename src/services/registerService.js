// src/services/registerService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/auth'; // Ajusta la ruta según tu backend

// Configurar axios para el registro (no necesita token JWT)
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Servicio para el registro de usuarios
export const registerService = {
  // POST - Registrar un nuevo usuario
  registerUser: async (userData) => {
    try {
      // Diferentes formatos que podría esperar el backend
      const formats = [
        // Formato 1: Objeto para relación ManyToOne
        {
          ...userData,
          rol: { id: 3 }
        },
        // Formato 2: Solo ID
        {
          ...userData,
          rol_id: 3
        },
        // Formato 3: rolId camelCase
        {
          ...userData,
          rolId: 3
        },
        // Formato 4: Solo rol como número
        {
          ...userData,
          rol: 3
        }
      ];

      // Intentamos con el primer formato (más común para JPA)
      const userDataWithRole = formats[0];

      console.log('📤 Enviando datos de registro:', userDataWithRole);

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userDataWithRole),
      });

      const data = await response.json();
      console.log('📥 Respuesta del servidor:', data);

      if (response.ok) {
        return data;
      } else {
        // Si falla, mostrar información detallada para debugging
        console.error('❌ Error del servidor:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }
};
