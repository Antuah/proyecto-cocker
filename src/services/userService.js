// src/services/userService.js
import axios from 'axios';

console.log('🔧 UserService - Modo sin errores activado');

// Servicio para obtener usuarios
export const userService = {
  // GET - Obtener todos los usuarios con rol MEMBER (rol_id = 3)
  getUsersWithMemberRole: async () => {
    try {
      console.log('⚠️ Backend aún no tiene endpoint GET para usuarios');
      console.log('🧪 Usando datos de prueba para evitar errores...');
      
      // Datos de prueba mientras se implementa el backend
      const testUsers = [
        {
          id: 1,
          username: 'testuser1',
          nombreCompleto: 'Usuario Prueba 1',
          correo: 'test1@ejemplo.com',
          telefono: '1234567890',
          rol_id: 3,
          rol: { id: 3, name: 'MEMBER' }
        },
        {
          id: 2,
          username: 'testuser2',
          nombreCompleto: 'Usuario Prueba 2',
          correo: 'test2@ejemplo.com',
          telefono: '0987654321',
          rol_id: 3,
          rol: { id: 3, name: 'MEMBER' }
        },
        {
          id: 3,
          username: 'testuser3',
          nombreCompleto: 'Usuario Prueba 3',
          correo: 'test3@ejemplo.com',
          telefono: '5555555555',
          rol_id: 3,
          rol: { id: 3, name: 'MEMBER' }
        }
      ];
      
      console.log('👥 Devolviendo usuarios de prueba:', testUsers);
      return testUsers;
      
    } catch (error) {
      console.error('❌ Error en userService:', error);
      // Incluso si hay error, devolver array vacío para no romper la UI
      return [];
    }
  },

  // GET - Obtener todos los usuarios
  getAllUsers: async () => {
    return await userService.getUsersWithMemberRole();
  }
};
