// src/components/Navigation.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navigation.css';

const Navigation = ({ onLogout, userData }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-links">
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            🏠 Dashboard
          </Link>
          <Link 
            to="/groups" 
            className={`nav-link ${isActive('/groups') ? 'active' : ''}`}
          >
            👥 Grupos
          </Link>
          <Link 
            to="/events" 
            className={`nav-link ${isActive('/events') ? 'active' : ''}`}
          >
            📅 Eventos
          </Link>
        </div>
        
        <div className="nav-user">
          <span className="user-name">{userData?.username || 'Usuario'}</span>
          <button className="logout-button" onClick={onLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
