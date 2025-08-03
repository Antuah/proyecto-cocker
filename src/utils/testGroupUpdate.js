// src/utils/testGroupUpdate.js
import { groupService } from '../services/groupService';
import { adminGroupService } from '../services/adminGroupService';

export const testGroupUpdate = async (groupId, testData) => {
  console.group('🧪 PRUEBA DE ACTUALIZACIÓN DE GRUPO');
  
  try {
    // 1. Obtener el grupo actual
    console.log('1️⃣ Obteniendo grupo actual...');
    const currentGroup = await groupService.getGroupById(groupId);
    console.log('📋 Grupo actual:', currentGroup);
    
    // 2. Obtener administradores disponibles
    console.log('2️⃣ Obteniendo administradores disponibles...');
    const availableAdmins = await adminGroupService.getAvailableAdminGroups();
    console.log('👥 Administradores disponibles:', availableAdmins);
    
    // 3. Simular datos del formulario
    console.log('3️⃣ Datos de prueba para actualización:');
    const formData = {
      name: testData.name || currentGroup.name,
      municipio: testData.municipio || currentGroup.municipio,
      colonia: testData.colonia || currentGroup.colonia,
      selectedUsers: testData.selectedUsers || (currentGroup.users ? currentGroup.users.map(u => u.id) : []),
      selectedAdmin: testData.selectedAdmin || (currentGroup.adminUser ? currentGroup.adminUser.id : null)
    };
    console.log('📝 Datos del formulario:', formData);
    
    // 4. Intentar actualizar
    console.log('4️⃣ Intentando actualizar grupo...');
    const result = await groupService.updateGroup(groupId, formData);
    console.log('✅ Resultado de actualización:', result);
    
    // 5. Verificar resultado
    console.log('5️⃣ Verificando resultado...');
    const updatedGroup = await groupService.getGroupById(groupId);
    console.log('📋 Grupo después de actualización:', updatedGroup);
    
    return {
      success: true,
      originalGroup: currentGroup,
      formData,
      result,
      updatedGroup
    };
    
  } catch (error) {
    console.error('❌ Error en prueba:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    console.groupEnd();
  }
};

// Función para usar en la consola del navegador
window.testGroupUpdate = testGroupUpdate;
