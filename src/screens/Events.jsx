// src/screens/Events.jsx
import React, { useState } from 'react';
import EventForm from '../components/EventForm';
import EventList from '../components/EventList';
import '../styles/Events.css';

const Events = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
      <div className="events-header">
        <h2>Gestión de Eventos</h2>
        <p className="events-subtitle">
          Administra los eventos de los grupos ambientales
        </p>
        
        {!showForm && (
          <button 
            className="create-event-button"
            onClick={handleCreateEvent}
          >
            ➕ Crear Nuevo Evento
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
  );
};

export default Events;
