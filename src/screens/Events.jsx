// src/screens/Events.jsx
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import EventForm from '../components/EventForm';
import EventList from '../components/EventList';
import { authService } from '../services/authService';
import '../styles/Events.css';

const Events = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Función para verificar si el usuario puede crear eventos (solo admin y adminGroup)
  const canCreateEvents = () => {
    const user = authService.getCurrentUser();
    const isAdmin = authService.hasRole('admin');
    const isAdminGroup = authService.hasRole('adminGroup');
    
    // Debug logs para ayudar a diagnosticar problemas de roles
    console.log('Current user:', user);
    console.log('Has admin role:', isAdmin);
    console.log('Has adminGroup role:', isAdminGroup);
    console.log('Can create events:', isAdmin || isAdminGroup);
    
    return isAdmin || isAdminGroup;
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingEvent(null);
    setRefreshTrigger(prev => prev + 1); // Trigger refresh of event list
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  return (
    <div className="events-container">
      <div className="events-wrapper">
        <div className="events-header">
          <h2>
            <div className="events-header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
                <path d="M10 14l2 2 4-4"/>
              </svg>
            </div>
            Gestión de Eventos
          </h2>
          <p className="events-subtitle">
            Administra los eventos de los grupos ambientales
          </p>
          
          {!showForm && canCreateEvents() && (
            <button 
              className="create-event-button"
              onClick={handleCreateEvent}
            >
              <svg viewBox="0 0 24 24">
                <path d="M12 5v14m7-7H5"/>
              </svg>
              Crear Nuevo Evento
            </button>
          )}
        </div>

        <div className="events-content">
          {showForm ? (
            <EventForm
              isEditing={!!editingEvent}
              eventData={editingEvent}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          ) : (
            <EventList
              onEditEvent={handleEditEvent}
              refreshTrigger={refreshTrigger}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
