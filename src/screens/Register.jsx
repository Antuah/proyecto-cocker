// src/screens/Register.jsx
import React, { useState } from 'react';
import Swal from 'sweetalert2';
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
      await Swal.fire({
        title: 'Formulario incompleto',
        text: 'Por favor, corrige los errores en el formulario',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#059669'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Excluir confirmPassword de los datos enviados
      const { confirmPassword, ...dataToSend } = formData;
      
      const response = await registerService.registerUser(dataToSend);
      
      console.log('Usuario registrado exitosamente:', response);
      
      await Swal.fire({
        title: '¡Registro exitoso!',
        text: 'Usuario registrado exitosamente. Puedes iniciar sesión ahora.',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#059669',
        timer: 3000,
        timerProgressBar: true
      });
      
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
      
      await Swal.fire({
        title: 'Error en el registro',
        text: `Error al registrar usuario: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para determinar la clase del mensaje
  const getMessageClass = () => {
    if (message.includes('exitosamente')) return 'message-container message-success';
    if (message.includes('Error') || message.includes('errores')) return 'message-container message-error';
    if (message.includes('Registrando')) return 'message-container message-loading';
    return 'message-container message-default';
  };

  return (
    <div className="register-screen">
      <div className="register-wrapper">
        {/* Header */}
        <div className="register-header">
          <div className="register-icon-container">
            <div className="register-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
            </div>
          </div>
          <h1 className="register-main-title">Comité de Gestión Ambiental</h1>
          <p className="register-subtitle">Sistema de acceso para miembros</p>
        </div>

        <div className="register-card">
          <div className="register-card-header">
            <h2 className="register-title">Registro de Miembro</h2>
            <p className="register-description">Completa el formulario para unirte al comité</p>
          </div>

          <div className="register-form-container">
            <form onSubmit={handleSubmit} className="register-form">
              {/* Primera fila: Usuario y Nombre */}
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="username" className="form-label">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Usuario *
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Nombre de usuario"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    required
                    className={`form-input ${errors.username ? 'input-error' : ''}`}
                  />
                  {errors.username && <span className="error-text">{errors.username}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="nombreCompleto" className="form-label">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Nombre Completo *
                  </label>
                  <input
                    id="nombreCompleto"
                    name="nombreCompleto"
                    type="text"
                    placeholder="Tu nombre completo"
                    value={formData.nombreCompleto}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    required
                    className={`form-input ${errors.nombreCompleto ? 'input-error' : ''}`}
                  />
                  {errors.nombreCompleto && <span className="error-text">{errors.nombreCompleto}</span>}
                </div>
              </div>

              {/* Segunda fila: Email y Teléfono */}
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="correo" className="form-label">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    Correo Electrónico *
                  </label>
                  <input
                    id="correo"
                    name="correo"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.correo}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    required
                    className={`form-input ${errors.correo ? 'input-error' : ''}`}
                  />
                  {errors.correo && <span className="error-text">{errors.correo}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="telefono" className="form-label">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Teléfono *
                  </label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    placeholder="1234567890"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    required
                    className={`form-input ${errors.telefono ? 'input-error' : ''}`}
                  />
                  {errors.telefono && <span className="error-text">{errors.telefono}</span>}
                </div>
              </div>

              {/* Tercera fila: Contraseñas */}
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="password" className="form-label">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Contraseña *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    required
                    className={`form-input ${errors.password ? 'input-error' : ''}`}
                  />
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="confirmPassword" className="form-label">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Confirmar Contraseña *
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    required
                    className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                  />
                  {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="submit-button"
              >
                {isSubmitting ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>

            {message && (
              <div className={getMessageClass()}>
                {message}
              </div>
            )}

            <div className="register-footer">
              <p>¿Ya tienes cuenta?</p>
              <button
                onClick={onBackToLogin}
                disabled={isSubmitting}
                className="login-link"
              >
                Inicia sesión aquí
              </button>
            </div>
          </div>
        </div>

        <div className="register-disclaimer">
          <p>Al registrarte, aceptas contribuir a la protección del medio ambiente</p>
          <p>y seguir las políticas del comité.</p>
        </div>
      </div>
    </div>
  );
}

export default Register;
