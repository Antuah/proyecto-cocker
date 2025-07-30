import React, { useState } from 'react';
import '../styles/Login.css'; // Importa el nuevo componente Login

function Login({ onLoginSuccess }) {
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
        // Aquí puedes esperar que el backend devuelva un token JWT, un mensaje de éxito, etc.
        console.log('Inicio de sesión exitoso:', data);
        setMessage('¡Inicio de sesión exitoso!');

        // Si tu backend devuelve un token (JWT), guárdalo para futuras peticiones
        if (data.token) {
          localStorage.setItem('jwtToken', data.token);
          console.log('Token JWT guardado:', data.token);
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
        setMessage(`Error al iniciar sesión: ${errorData.message || 'Credenciales inválidas.'}`);
      }
    } catch (error) {
      // Captura cualquier error de red o del proceso de fetch
      console.error('Error de conexión o de red:', error);
      setMessage('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
    }
  };

  // Función para determinar la clase del mensaje
  const getMessageClass = () => {
    if (message.includes('exitoso')) return 'message success';
    if (message.includes('Error') || message.includes('inválidas')) return 'message error';
    if (message.includes('Iniciando')) return 'message loading';
    return 'message';
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">👤</div>
        <h2 className="login-title">Iniciar Sesión</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Usuario:</label>
            <input
              className="form-input"
              type="text"
              id="username"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Contraseña:</label>
            <input
              className="form-input"
              type="password"
              id="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            className="submit-button" 
            type="submit"
            disabled={message.includes('Iniciando')}
          >
            {message.includes('Iniciando') ? 'Iniciando...' : 'Entrar'}
          </button>
        </form>
        {message && <div className={getMessageClass()}>{message}</div>}
      </div>
    </div>
  );
}

export default Login;