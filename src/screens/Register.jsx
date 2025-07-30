// src/screens/Register.jsx
import React, { useState } from 'react';
import { registerService } from '../services/registerService';
import '../styles/Register.css';

function Register({ onRegisterSuccess, onBackToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nombreCompleto: '',
    telefono: '',
    correo: ''
  });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validaciones
  const validateField = (name, value) => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'El nombre de usuario es obligatorio';
        if (value.length < 3) return 'El nombre de usuario debe tener al menos 3 caracteres';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Solo se permiten letras, números y guiones bajos';
        return '';
      
      case 'password':
        if (!value) return 'La contraseña es obligatoria';
        if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        return '';
      
      case 'confirmPassword':
        if (!value) return 'Confirma tu contraseña';
        if (value !== formData.password) return 'Las contraseñas no coinciden';
        return '';
      
      case 'nombreCompleto':
        if (!value.trim()) return 'El nombre completo es obligatorio';
        if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'Solo se permiten letras y espacios';
        return '';
      
      case 'telefono':
        if (!value.trim()) return 'El teléfono es obligatorio';
        if (!/^\d{10}$/.test(value.replace(/\s/g, ''))) return 'El teléfono debe tener 10 dígitos';
        return '';
      
      case 'correo':
        if (!value.trim()) return 'El correo es obligatorio';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Ingresa un correo válido';
        return '';
      
      default:
        return '';
    }
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

    // Validar confirmación de contraseña en tiempo real
    if (name === 'password' && formData.confirmPassword) {
      const confirmError = formData.confirmPassword !== value ? 'Las contraseñas no coinciden' : '';
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmError
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('Por favor, corrige los errores en el formulario');
      return;
    }

    setIsSubmitting(true);
    setMessage('Registrando usuario...');

    try {
      // Excluir confirmPassword de los datos enviados
      const { confirmPassword, ...dataToSend } = formData;
      
      const response = await registerService.registerUser(dataToSend);
      
      console.log('Usuario registrado exitosamente:', response);
      setMessage('¡Usuario registrado exitosamente! Puedes iniciar sesión ahora.');
      
      // Limpiar formulario
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        nombreCompleto: '',
        telefono: '',
        correo: ''
      });

      // Llamar callback si existe
      if (onRegisterSuccess) {
        onRegisterSuccess(response);
      }

    } catch (error) {
      console.error('Error en el registro:', error);
      setMessage(`Error al registrar usuario: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para determinar la clase del mensaje
  const getMessageClass = () => {
    if (message.includes('exitosamente')) return 'message success';
    if (message.includes('Error') || message.includes('errores')) return 'message error';
    if (message.includes('Registrando')) return 'message loading';
    return 'message';
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-icon">👤</div>
        <h2 className="register-title">Crear Cuenta</h2>
        
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="username">Usuario *</label>
              <input
                className={`form-input ${errors.username ? 'input-error' : ''}`}
                type="text"
                id="username"
                name="username"
                placeholder="Nombre de usuario"
                value={formData.username}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="nombreCompleto">Nombre Completo *</label>
              <input
                className={`form-input ${errors.nombreCompleto ? 'input-error' : ''}`}
                type="text"
                id="nombreCompleto"
                name="nombreCompleto"
                placeholder="Tu nombre completo"
                value={formData.nombreCompleto}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              />
              {errors.nombreCompleto && <span className="error-message">{errors.nombreCompleto}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="correo">Correo Electrónico *</label>
              <input
                className={`form-input ${errors.correo ? 'input-error' : ''}`}
                type="email"
                id="correo"
                name="correo"
                placeholder="tu@email.com"
                value={formData.correo}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              />
              {errors.correo && <span className="error-message">{errors.correo}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="telefono">Teléfono *</label>
              <input
                className={`form-input ${errors.telefono ? 'input-error' : ''}`}
                type="tel"
                id="telefono"
                name="telefono"
                placeholder="1234567890"
                value={formData.telefono}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              />
              {errors.telefono && <span className="error-message">{errors.telefono}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="password">Contraseña *</label>
              <input
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                type="password"
                id="password"
                name="password"
                placeholder="Tu contraseña"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirmar Contraseña *</label>
              <input
                className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>

          <button 
            className="submit-button" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        {message && <div className={getMessageClass()}>{message}</div>}
        
        <div className="register-footer">
          <p>¿Ya tienes cuenta?</p>
          <button 
            className="link-button" 
            onClick={onBackToLogin}
            disabled={isSubmitting}
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
