// src/screens/Events.jsx
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import EventForm from '../components/EventForm';
import EventList from '../components/EventList';
import EventTypes from '../components/EventTypes';
import { authService } from '../services/authService';
import '../styles/Events.css';

const Events = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('events'); // 'events' o 'types'

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

  const renderTabContent = () => {
    if (activeTab === 'types') {
      return <EventTypes />;
    }

    if (showForm) {
      return (
        <EventForm
          isEditing={!!editingEvent}
          eventData={editingEvent}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      );
    }

    return (
      <EventList
        onEditEvent={handleEditEvent}
        refreshTrigger={refreshTrigger}
      />
    );
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
            Administra los eventos y tipos de eventos de los grupos ambientales
          </p>
        </div>

        {/* Pestañas de navegación */}
        <div className="events-tabs">
          <button 
            className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('events');
              setShowForm(false);
              setEditingEvent(null);
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Eventos
          </button>
          <button 
            className={`tab-button ${activeTab === 'types' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('types');
              setShowForm(false);
              setEditingEvent(null);
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/>
            </svg>
            Tipos de Eventos
          </button>
        </div>

        {/* Botón de crear evento (solo en la pestaña de eventos) */}
        {activeTab === 'events' && !showForm && canCreateEvents() && (
          <div className="events-actions">
            <button 
              className="create-event-button"
              onClick={handleCreateEvent}
            >
              <svg viewBox="0 0 24 24">
                <path d="M12 5v14m7-7H5"/>
              </svg>
              Crear Nuevo Evento
            </button>
          </div>
        )}

        <div className="events-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Events;
