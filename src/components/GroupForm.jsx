// src/components/GroupForm.jsx
import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import '../styles/GroupForm.css';

const GroupForm = ({ group, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    municipio: '',
    colonia: '',
    selectedUsers: [] // Array de IDs de usuarios seleccionados
  });
  const [users, setUsers] = useState([]); // Lista de usuarios con rol MEMBER
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar usuarios con rol MEMBER al montar el componente
  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const memberUsers = await userService.getUsersWithMemberRole();
        setUsers(memberUsers);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  // Llenar el formulario si estamos editando
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || '',
        municipio: group.municipio || '',
        colonia: group.colonia || '',
        selectedUsers: group.userIds || group.users?.map(user => user.id) || []
      });
    }
  }, [group]);

  // Validación de campos
  const validateField = (name, value) => {
    const letterPattern = /^[A-Za-z]{1}[\sA-Za-z]{5,}$/;
    
    if (!value.trim()) {
      return 'Este campo es obligatorio';
    }
    
    if (value.trim().length === 0) {
      return 'No se aceptan valores en blanco';
    }
    
    if (!letterPattern.test(value)) {
      return 'Debe comenzar con una letra y tener al menos 6 caracteres (solo letras y espacios)';
    }
    
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Manejar selección/deselección de usuarios
  const handleUserSelection = (userId) => {
    setFormData(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter(id => id !== userId) // Deseleccionar
        : [...prev.selectedUsers, userId] // Seleccionar
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    newErrors.name = validateField('name', formData.name);
    newErrors.municipio = validateField('municipio', formData.municipio);
    newErrors.colonia = validateField('colonia', formData.colonia);
    
    // Filtrar errores vacíos
    const filteredErrors = Object.keys(newErrors).reduce((acc, key) => {
      if (newErrors[key]) {
        acc[key] = newErrors[key];
      }
      return acc;
    }, {});
    
    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      municipio: '',
      colonia: '',
      selectedUsers: []
    });
    setErrors({});
  };

  return (
    <div className="group-form-container">
      <div className="group-form-card">
        <h3>{group ? 'Editar Grupo' : 'Nuevo Grupo'}</h3>
        
        <form onSubmit={handleSubmit} className="group-form">
          <div className="form-group">
            <label htmlFor="name">Nombre del Grupo *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? 'input-error' : ''}
              placeholder="Ingrese el nombre del grupo"
              disabled={isSubmitting}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="municipio">Municipio *</label>
            <input
              type="text"
              id="municipio"
              name="municipio"
              value={formData.municipio}
              onChange={handleInputChange}
              className={errors.municipio ? 'input-error' : ''}
              placeholder="Ingrese el municipio"
              disabled={isSubmitting}
            />
            {errors.municipio && <span className="error-message">{errors.municipio}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="colonia">Colonia *</label>
            <input
              type="text"
              id="colonia"
              name="colonia"
              value={formData.colonia}
              onChange={handleInputChange}
              className={errors.colonia ? 'input-error' : ''}
              placeholder="Ingrese la colonia"
              disabled={isSubmitting}
            />
            {errors.colonia && <span className="error-message">{errors.colonia}</span>}
          </div>

          <div className="form-group">
            <label>Miembros del Grupo</label>
            <div className="user-selection-container">
              {loadingUsers ? (
                <div className="loading-users">Cargando usuarios...</div>
              ) : users.length === 0 ? (
                <div className="no-users">No hay usuarios con rol MEMBER disponibles</div>
              ) : (
                <div className="user-list">
                  {users.map(user => (
                    <div key={user.id} className="user-item">
                      <label className="user-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelection(user.id)}
                          disabled={isSubmitting}
                        />
                        <span className="checkmark"></span>
                        <span className="user-info">
                          <span className="user-name">{user.name || user.username}</span>
                          <span className="user-email">{user.email}</span>
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
              <div className="selected-count">
                {formData.selectedUsers.length} usuario(s) seleccionado(s)
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Limpiar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : (group ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupForm;
