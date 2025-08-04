// src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './screens/Login'; // Importa el nuevo componente Login
import Register from './screens/Register'; // Importa el nuevo componente Register
import Groups from './screens/Groups'; // Importa el componente de Grupos
import Events from './screens/Events'; // Importa el componente de Eventos
import AdminGroups from './screens/AdminGroups'; // Importa el componente de Administradores
import Navigation from './components/Navigation'; // Componente de navegación
import ProtectedRoute from './components/ProtectedRoute'; // Componente de ruta protegida
import './styles/App.css'; // Si tienes estilos globales
import './styles/Header.css'; // Importa los estilos del componente Login

// Importar utilidades de debug en desarrollo
if (process.env.NODE_ENV === 'development') {
  import('./utils/testGroupUpdate');
  import('./utils/debugAdminAssignment');
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado para saber si el usuario está logueado
  const [userData, setUserData] = useState(null); // Para guardar los datos del usuario logueado
  const [loading, setLoading] = useState(true); // Estado de carga inicial
  const [showRegister, setShowRegister] = useState(false); // Estado para mostrar registro

  // Verificar si hay un token válido al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      // Aquí podrías hacer una petición al backend para verificar si el token es válido
      // Por ahora, asumimos que si existe el token, el usuario está logueado
      setIsLoggedIn(true);
      // Podrías obtener los datos del usuario del token o hacer una petición
    }
    setLoading(false);
  }, []);

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
    setShowRegister(false); // Resetear al login
    console.log("Usuario ha cerrado sesión.");
  };

  // Función para cambiar a la vista de registro
  const handleShowRegister = () => {
    setShowRegister(true);
  };

  // Función para cambiar a la vista de login
  const handleShowLogin = () => {
    setShowRegister(false);
  };

  // Función que se llama cuando el registro es exitoso
  const handleRegisterSuccess = () => {
    setShowRegister(false); // Volver al login después del registro exitoso
  };

  return (
    <Router>
      <div className="App">
        <header className="header">
          <div className="header-content">
            <div className="header-icon-container">
              <div className="header-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C8.1 2 5 5.1 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.9-3.1-7-7-7zm0 9.5L8.5 8 12 4.5 15.5 8 12 11.5z"/>
                  <path d="M8.5 8C8.5 8 12 11.5 12 11.5S15.5 8 15.5 8C15.5 8 12 4.5 12 4.5S8.5 8 8.5 8z"/>
                </svg>
              </div>
            </div>
            <h1>Sistema de Gestión Ambiental</h1>
            <p className="header-subtitle">Comité Ambiental de Morelos</p>
          </div>
        </header>
        <main>
          {loading ? (
            <div className="loading">Cargando...</div>
          ) : isLoggedIn ? (
            <>
              <Navigation onLogout={handleLogout} userData={userData} />
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={
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
                    </div>
                  </div>
                } />
                <Route path="/groups" element={<Groups />} />
                <Route path="/events" element={<Events />} />
                <Route path="/admin-groups" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminGroups />
                  </ProtectedRoute>
                } />
              </Routes>
            </>
          ) : (
            showRegister ? (
              <Register 
                onRegisterSuccess={handleRegisterSuccess}
                onShowLogin={handleShowLogin}
              />
            ) : (
              <Login 
                onLoginSuccess={handleLoginSuccess}
                onShowRegister={handleShowRegister}
              />
            )
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;