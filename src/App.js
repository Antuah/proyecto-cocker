// src/App.js

import React, { useState } from 'react';
import Login from './screens/Login'; // Importa el nuevo componente Login
import './styles/App.css'; // Si tienes estilos globales
import './styles/Header.css'; // Importa los estilos del componente Login

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado para saber si el usuario está logueado
  const [userData, setUserData] = useState(null); // Para guardar los datos del usuario logueado

  // Función que se llama cuando el login es exitoso en el componente Login.js
  const handleLoginSuccess = (data) => {
    setIsLoggedIn(true);
    setUserData(data); // Guarda los datos del usuario (ej. su nombre, rol, etc.)
    console.log("¡Usuario ha iniciado sesión!");
    // Aquí podrías redirigir al usuario a otra página o mostrar el dashboard
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('jwtToken'); // Elimina el token del almacenamiento local
    setIsLoggedIn(false);
    setUserData(null);
    console.log("Usuario ha cerrado sesión.");
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sistema de Gestión Ambiental</h1>
      </header>
      <main>
        {isLoggedIn ? (
          <div className="dashboard">
            <div className="welcome-card">
              <h2 className="welcome-title">¡Bienvenido!</h2>
              <p className="welcome-message">
                Has iniciado sesión exitosamente en el Sistema de Gestión Ambiental de Morelos.
              </p>
              <div className="user-info">
                <div className="user-name">{userData?.username || 'Usuario'}</div>
                <div className="user-role">Administrador del Sistema</div>
              </div>
              <button className="logout-button" onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </div>
          </div>
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
      </main>
    </div>
  );
}

export default App;