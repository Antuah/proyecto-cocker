// src/screens/AdminGroups.jsx
import React, { useState, useEffect } from 'react';
import { adminGroupService } from '../services/adminGroupService';
import '../styles/AdminGroups.css';

const AdminGroups = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    telefono: ''
  });

  const [adminGroups, setAdminGroups] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Cargar lista de administradores de grupo al montar el componente
  useEffect(() => {
    loadAdminGroups();
  }, []);

  const loadAdminGroups = async () => {
    try {
      const adminGroupsList = await adminGroupService.getAdminGroups();
      setAdminGroups(adminGroupsList);
    } catch (err) {
      console.error('Error al cargar administradores de grupo:', err);
      setError('Error al cargar la lista de administradores');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('El nombre de usuario es requerido');
      return false;
    }
    if (!formData.password.trim()) {
      setError('La contraseña es requerida');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (!formData.apellidoPaterno.trim()) {
      setError('El apellido paterno es requerido');
      return false;
    }
    if (!formData.email.trim()) {
      setError('El email es requerido');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('El email no tiene un formato válido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Preparar datos para envío (sin confirmPassword)
      const { confirmPassword, ...dataToSend } = formData;
      
      await adminGroupService.registerAdminGroup(dataToSend);
      
      setSuccessMessage('Administrador de grupo registrado exitosamente');
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        email: '',
        telefono: ''
      });
      setShowForm(false);
      
      // Recargar la lista
      await loadAdminGroups();
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      setError(err.message || 'Error al registrar administrador de grupo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      email: '',
      telefono: ''
    });
    setError('');
  };

  return (
    <div className="admin-groups-container">
      <div className="admin-groups-header">
        <h2>Gestión de Administradores de Grupo</h2>
        <p className="admin-groups-description">
          Registra nuevos administradores de grupo que podrán gestionar grupos ambientales
        </p>
      </div>

      {/* Mensajes de éxito y error */}
      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Botón para mostrar/ocultar formulario */}
      <div className="admin-groups-actions">
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : 'Registrar Nuevo Administrador'}
        </button>
      </div>

      {/* Formulario de registro */}
      {showForm && (
        <div className="admin-group-form-container">
          <form onSubmit={handleSubmit} className="admin-group-form">
            <h3>Registrar Administrador de Grupo</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username">Nombre de Usuario *</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Contraseña *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="apellidoPaterno">Apellido Paterno *</label>
                <input
                  type="text"
                  id="apellidoPaterno"
                  name="apellidoPaterno"
                  value={formData.apellidoPaterno}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="apellidoMaterno">Apellido Materno</label>
                <input
                  type="text"
                  id="apellidoMaterno"
                  name="apellidoMaterno"
                  value={formData.apellidoMaterno}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={handleReset}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Limpiar
              </button>
              <button 
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registrando...' : 'Registrar Administrador'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de administradores de grupo */}
      <div className="admin-groups-list">
        <h3>Administradores de Grupo Registrados</h3>
        {adminGroups.length === 0 ? (
          <div className="no-admin-groups">
            <p>No hay administradores de grupo registrados</p>
          </div>
        ) : (
          <div className="admin-groups-table">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Nombre Completo</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                </tr>
              </thead>
              <tbody>
                {adminGroups.map((admin) => (
                  <tr key={admin.id}>
                    <td>{admin.username}</td>
                    <td>
                      {admin.nombreCompleto}
                    </td>
                    <td>{admin.correo}</td>
                    <td>{admin.telefono || 'N/A'}</td>
                    <td>
                      <span className="role-badge admin-group">
                        Administrador de Grupo
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGroups;
