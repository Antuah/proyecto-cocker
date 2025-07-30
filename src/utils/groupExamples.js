// src/utils/groupExamples.js
// Este archivo contiene ejemplos de uso del servicio de grupos

import { groupService } from '../services/groupService';

// Ejemplo de datos de grupo para crear
export const sampleGroupData = {
  name: "Grupo Ecológico Cuernavaca",
  municipio: "Cuernavaca",
  colonia: "Centro Histórico"
};

// Función de ejemplo para crear un grupo
export const createSampleGroup = async () => {
  try {
    const newGroup = await groupService.createGroup(sampleGroupData);
    console.log('Grupo creado:', newGroup);
    return newGroup;
  } catch (error) {
    console.error('Error al crear grupo de ejemplo:', error);
    throw error;
  }
};

// Función de ejemplo para obtener todos los grupos
export const fetchAllGroups = async () => {
  try {
    const groups = await groupService.getAllGroups();
    console.log('Grupos obtenidos:', groups);
    return groups;
  } catch (error) {
    console.error('Error al obtener grupos:', error);
    throw error;
  }
};

// Función de ejemplo para actualizar un grupo
export const updateSampleGroup = async (groupId, updateData) => {
  try {
    const updatedGroup = await groupService.updateGroup(groupId, updateData);
    console.log('Grupo actualizado:', updatedGroup);
    return updatedGroup;
  } catch (error) {
    console.error('Error al actualizar grupo:', error);
    throw error;
  }
};

// Función de ejemplo para eliminar un grupo
export const deleteSampleGroup = async (groupId) => {
  try {
    await groupService.deleteGroup(groupId);
    console.log('Grupo eliminado exitosamente');
  } catch (error) {
    console.error('Error al eliminar grupo:', error);
    throw error;
  }
};

// Validación local de datos de grupo (replica las validaciones del backend)
export const validateGroupData = (groupData) => {
  const errors = {};
  const letterPattern = /^[A-Za-z]{1}[\sA-Za-z]{5,}$/;

  if (!groupData.name || !groupData.name.trim()) {
    errors.name = 'El nombre es obligatorio';
  } else if (!letterPattern.test(groupData.name)) {
    errors.name = 'El nombre debe comenzar con una letra y tener al menos 6 caracteres (solo letras y espacios)';
  }

  if (!groupData.municipio || !groupData.municipio.trim()) {
    errors.municipio = 'El municipio es obligatorio';
  } else if (!letterPattern.test(groupData.municipio)) {
    errors.municipio = 'El municipio debe comenzar con una letra y tener al menos 6 caracteres (solo letras y espacios)';
  }

  if (!groupData.colonia || !groupData.colonia.trim()) {
    errors.colonia = 'La colonia es obligatoria';
  } else if (!letterPattern.test(groupData.colonia)) {
    errors.colonia = 'La colonia debe comenzar con una letra y tener al menos 6 caracteres (solo letras y espacios)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
