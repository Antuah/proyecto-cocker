import React, { useState } from 'react';
import Swal from 'sweetalert2';
import '../styles/Login.css'; // Importa el nuevo componente Login

function Login({ onLoginSuccess, onShowRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // URL base de tu backend de Java para la autenticación
  // Asegúrate de que esta URL sea la correcta para tu endpoint de login en Swagger UI
  const API_AUTH_URL = 'http://localhost:8080/api/auth'; // ¡Ajusta esta URL si tu endpoint es diferente!

  // Función que se ejecuta cuando el usuario envía el formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario
    setMessage('Iniciando sesión...'); // Mensaje de carga

    try {
      // Realiza la petición POST a tu endpoint de autenticación
      const response = await fetch(API_AUTH_URL, {
        method: 'POST', // Es una petición POST para enviar datos
        headers: {
          'Content-Type': 'application/json', // Indica que estamos enviando JSON
        },
        body: JSON.stringify({ // Convierte el objeto JavaScript a una cadena JSON
          username: username,
          password: password,
        }),
      });

      // Verifica si la respuesta HTTP fue exitosa (código 2xx)
      if (response.ok) {
        const data = await response.json(); // Parsea la respuesta JSON del servidor
        console.log('🎉 Inicio de sesión exitoso:', data);
        setMessage('¡Inicio de sesión exitoso!');

        // El backend devuelve el token en data.data
        let token = null;
        if (data.data && typeof data.data === 'string') {
          token = data.data; // El token JWT está en data.data
        } else if (data.token) {
          token = data.token;
        } else if (data.jwt) {
          token = data.jwt;
        } else if (data.accessToken) {
          token = data.accessToken;
        }

        if (token) {
          localStorage.setItem('jwtToken', token);
          console.log('✅ Token JWT guardado exitosamente');
        } else {
          console.log('⚠️ No se encontró token en la respuesta');
        }

        // Llama a una función `onLoginSuccess` que se pasa como prop,
        // esto es útil para que el componente padre sepa que el login fue exitoso.
        if (onLoginSuccess) {
          onLoginSuccess(data); // Puedes pasar los datos de la respuesta al componente padre
        }
      } else {
        // Si la respuesta no fue exitosa, lee el mensaje de error del backend si lo hay
        const errorData = await response.json();
        console.error('Error en el inicio de sesión:', errorData);
        
        await Swal.fire({
          title: 'Error de autenticación',
          text: errorData.message || 'Credenciales inválidas. Verifica tu usuario y contraseña.',
          icon: 'error',
          confirmButtonText: 'Reintentar',
          confirmButtonColor: '#dc2626'
        });
      }
    } catch (error) {
      // Captura cualquier error de red o del proceso de fetch
      console.error('Error de conexión o de red:', error);
      
      await Swal.fire({
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor. Intenta de nuevo más tarde.',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  // Función para determinar la clase del mensaje
  const getMessageClass = () => {
    if (message.includes('exitoso')) return 'message-container message-success';
    if (message.includes('Error') || message.includes('inválidas')) return 'message-container message-error';
    if (message.includes('Iniciando')) return 'message-container message-loading';
    return 'message-container message-default';
  };

  return (
    <div className="login-screen">
      <div className="login-wrapper">
        <div className="login-header">
          <div className="login-icon-container">
            <div className="login-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
            </div>
          </div>
          <h1 className="login-main-title">Comité de Gestión Ambiental</h1>
          <p className="login-subtitle">Sistema de acceso para miembros</p>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-title">Iniciar Sesión</h2>
            <p className="login-description">Ingresa tus credenciales para acceder</p>
          </div>

          <div className="login-form-container">
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-field">
                <label htmlFor="username" className="form-label">
                  <svg viewBox="0 0 24 24">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Usuario
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label htmlFor="password" className="form-label">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <button 
                type="submit"
                disabled={message.includes('Iniciando')}
                className="submit-button"
              >
                {message.includes('Iniciando') ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            </form>

            {message && (
              <div className={getMessageClass()}>
                {message}
              </div>
            )}

            <div className="login-footer">
              <p>¿No tienes cuenta?</p>
              <button
                onClick={onShowRegister}
                disabled={message.includes('Iniciando')}
                className="register-link"
              >
                Regístrate aquí
              </button>
            </div>
          </div>
        </div>

        <div className="login-disclaimer">
          <p>Al iniciar sesión, contribuyes a la protección del medio ambiente</p>
          <p>y sigues las políticas del comité.</p>
        </div>
      </div>
    </div>
  );
}

export default Login;