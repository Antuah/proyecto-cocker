// src/utils/debugHelper.js
export const debugGroupOperation = (operation, data, result = null) => {
  const timestamp = new Date().toISOString();
  
  console.group(`🔍 [${timestamp}] ${operation}`);
  
  switch (operation) {
    case 'GROUP_UPDATE_START':
      console.log('📝 ID del grupo:', data.groupId);
      console.log('📝 Datos del formulario:', data.formData);
      console.log('📝 Usuarios seleccionados:', data.formData.selectedUsers);
      console.log('📝 Administrador seleccionado:', data.formData.selectedAdmin);
      break;
      
    case 'GROUP_UPDATE_BACKEND_REQUEST':
      console.log('📤 Datos enviados al backend:', JSON.stringify(data, null, 2));
      console.log('📤 Usuarios transformados:', data.users);
      console.log('📤 Administrador transformado:', data.adminUser);
      break;
      
    case 'GROUP_UPDATE_BACKEND_RESPONSE':
      console.log('📥 Respuesta completa del backend:', result);
      if (result && result.data) {
        console.log('📥 Grupo actualizado:', result.data);
        console.log('📥 Usuarios en respuesta:', result.data.users);
        console.log('📥 Administrador en respuesta:', result.data.adminUser);
      }
      break;
      
    case 'GROUP_LOAD_FOR_EDIT':
      console.log('📖 Grupo cargado para editar:', data);
      console.log('📖 Usuarios actuales:', data.users);
      console.log('📖 Administrador actual:', data.adminUser);
      break;
      
    default:
      console.log('📊 Datos:', data);
      if (result) console.log('📊 Resultado:', result);
  }
  
  console.groupEnd();
};

export const debugUserAssignment = (operation, userId, groupId, additionalData = {}) => {
  const timestamp = new Date().toISOString();
  
  console.group(`👤 [${timestamp}] ${operation}`);
  console.log('👤 Usuario ID:', userId);
  console.log('👤 Grupo ID:', groupId);
  
  Object.keys(additionalData).forEach(key => {
    console.log(`👤 ${key}:`, additionalData[key]);
  });
  
  console.groupEnd();
};
