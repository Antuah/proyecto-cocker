// src/utils/debugAdminAssignment.js
import { groupService } from '../services/groupService';
import { adminGroupService } from '../services/adminGroupService';

export const debugAdminAssignment = async (groupId, adminId) => {
  console.group('🔍 DEBUG: Asignación de Administrador');
  
  try {
    // 1. Obtener estado inicial del grupo
    console.log('📋 PASO 1: Obteniendo grupo actual...');
    const currentGroup = await groupService.getAllGroups();
    const targetGroup = currentGroup.find(g => g.id === parseInt(groupId));
    console.log('Grupo encontrado:', targetGroup);
    
    // 2. Obtener administradores disponibles
    console.log('👥 PASO 2: Obteniendo administradores disponibles...');
    const availableAdmins = await adminGroupService.getAvailableAdminGroups();
    console.log('Administradores disponibles:', availableAdmins);
    
    // 3. Verificar que el admin seleccionado esté disponible
    const selectedAdmin = availableAdmins.find(admin => admin.id === parseInt(adminId));
    console.log('Administrador seleccionado:', selectedAdmin);
    
    if (!selectedAdmin) {
      console.error('❌ El administrador seleccionado no está en la lista de disponibles');
      return false;
    }
    
    // 4. Preparar datos para actualización (manteniendo usuarios existentes)
    const updateData = {
      name: targetGroup.name,
      municipio: targetGroup.municipio,
      colonia: targetGroup.colonia,
      selectedUsers: targetGroup.users ? targetGroup.users.map(u => u.id) : [],
      selectedAdmin: parseInt(adminId)
    };
    
    console.log('📝 PASO 3: Datos para actualización:', updateData);
    
    // 5. Enviar actualización
    console.log('🔄 PASO 4: Enviando actualización...');
    const result = await groupService.updateGroup(groupId, updateData);
    console.log('Resultado de actualización:', result);
    
    // 6. Verificar resultado obteniendo el grupo actualizado
    console.log('✅ PASO 5: Verificando resultado...');
    const updatedGroups = await groupService.getAllGroups();
    const updatedGroup = updatedGroups.find(g => g.id === parseInt(groupId));
    console.log('Grupo después de actualización:', updatedGroup);
    
    // 7. Verificar si el administrador se asignó correctamente
    const adminAssigned = updatedGroup.adminUser && updatedGroup.adminUser.id === parseInt(adminId);
    console.log('¿Administrador asignado correctamente?', adminAssigned);
    
    if (adminAssigned) {
      console.log('✅ ÉXITO: El administrador se asignó correctamente');
    } else {
      console.log('❌ FALLO: El administrador NO se asignó');
      console.log('Admin esperado ID:', adminId);
      console.log('Admin actual en grupo:', updatedGroup.adminUser);
    }
    
    return adminAssigned;
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    return false;
  } finally {
    console.groupEnd();
  }
};

// Función para usar directamente en la consola
export const testAdminAssignment = (groupId, adminId) => {
  console.log(`🧪 Iniciando prueba de asignación: Grupo ${groupId} -> Admin ${adminId}`);
  return debugAdminAssignment(groupId, adminId);
};

// Hacer disponible globalmente para debugging
if (typeof window !== 'undefined') {
  window.debugAdminAssignment = debugAdminAssignment;
  window.testAdminAssignment = testAdminAssignment;
}
