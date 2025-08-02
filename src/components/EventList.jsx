// src/components/EventList.jsx
import React, { useState, useEffect } from 'react';
import { eventService } from '../services/eventService';
import '../styles/EventList.css';

const EventList = ({ onEditEvent, refreshTrigger }) => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const statusOptions = [
    { value: 'ALL', label: 'Todos los eventos' },
    { value: 'PROXIMAMENTE', label: 'Próximamente' },
    { value: 'EN_EJECUCION', label: 'En Ejecución' },
    { value: 'FINALIZADO', label: 'Finalizado' }
  ];

  const statusLabels = {
    'PROXIMAMENTE': 'Próximamente',
    'EN_EJECUCION': 'En Ejecución',
    'FINALIZADO': 'Finalizado'
  };

  const statusColors = {
    'PROXIMAMENTE': 'status-upcoming',
    'EN_EJECUCION': 'status-ongoing',
    'FINALIZADO': 'status-finished'
  };

  useEffect(() => {
    fetchEvents();
  }, [refreshTrigger]);

  useEffect(() => {
    filterEvents();
  }, [events, statusFilter, searchTerm]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getAllEvents();
      
      // Debug: Vamos a ver qué está retornando el backend
      console.log('Respuesta del backend:', response);
      
      // El backend probablemente retorna {message: "...", data: [...], error: false}
      if (response && response.data && Array.isArray(response.data)) {
        setEvents(response.data);
        setError('');
      } else if (response && Array.isArray(response)) {
        // Si retorna directamente un array
        setEvents(response);
        setError('');
      } else {
        console.error('Formato de respuesta inesperado:', response);
        setError('No se pudieron cargar los eventos - formato de respuesta inesperado');
      }
    } catch (error) {
      setError('Error al cargar los eventos');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Filtrar por estatus
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.groupName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const handleStatusChange = async (event, newStatus) => {
    try {
      console.log('Changing status for event:', event.title, 'to:', newStatus);
      
      const response = await eventService.updateEventStatus(
        event.title,
        event.groupName,
        { status: newStatus }
      );

      console.log('Status update response:', response);

      // Verificar si la actualización fue exitosa
      if (response && (response.status === 200 || response.status === 204 || response.message)) {
        // Actualizar el evento en la lista local
        setEvents(prevEvents =>
          prevEvents.map(evt =>
            evt.title === event.title && evt.groupName === event.groupName
              ? { ...evt, status: newStatus }
              : evt
          )
        );
        console.log('Estado actualizado exitosamente');
      } else {
        console.error('Respuesta inesperada:', response);
        alert('Error al actualizar el estado del evento');
      }
    } catch (error) {
      console.error('Error updating event status:', error);
      alert(`Error al actualizar el estado del evento: ${error.message}`);
    }
  };

  const handleDeleteEvent = async (event) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el evento "${event.title}"?`)) {
      try {
        console.log('Deleting event:', event.title);
        
        const response = await eventService.deleteEvent(event.title, event.groupName);
        
        console.log('Delete response:', response);
        
        // Verificar si la eliminación fue exitosa
        if (response && (response.status === 200 || response.status === 204 || response.message)) {
          setEvents(prevEvents =>
            prevEvents.filter(evt =>
              !(evt.title === event.title && evt.groupName === event.groupName)
            )
          );
          console.log('Evento eliminado exitosamente');
        } else {
          console.error('Respuesta inesperada:', response);
          alert('Error al eliminar el evento');
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        alert(`Error al eliminar el evento: ${error.message}`);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Cargando eventos...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="event-list">
      <div className="event-list-header">
        <h3>Lista de Eventos</h3>
        
        <div className="event-filters">
          <div className="filter-group">
            <label htmlFor="status-filter">Filtrar por estado:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="search">Buscar:</label>
            <input
              type="text"
              id="search"
              placeholder="Buscar por título, tipo o grupo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="no-events">
          {events.length === 0 ? 'No hay eventos registrados' : 'No se encontraron eventos con los filtros aplicados'}
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event, index) => (
            <div key={`${event.title}-${event.groupName}-${index}`} className="event-card">
              <div className="event-header">
                <h4 className="event-title">{event.title}</h4>
                <span className={`event-status ${statusColors[event.status]}`}>
                  {statusLabels[event.status] || event.status}
                </span>
              </div>

              <div className="event-details">
                <div className="event-detail">
                  <span className="detail-label">📅 Fecha:</span>
                  <span className="detail-value">{formatDate(event.eventDate)}</span>
                </div>

                <div className="event-detail">
                  <span className="detail-label">🏷️ Tipo:</span>
                  <span className="detail-value">{event.eventType.replace('_', ' ')}</span>
                </div>

                <div className="event-detail">
                  <span className="detail-label">👥 Grupo:</span>
                  <span className="detail-value">{event.groupName}</span>
                </div>

                {event.description && (
                  <div className="event-detail">
                    <span className="detail-label">📝 Descripción:</span>
                    <span className="detail-value">{event.description}</span>
                  </div>
                )}
              </div>

              <div className="event-actions">
                <div className="status-actions">
                  <label>Cambiar estado:</label>
                  <select
                    value={event.status}
                    onChange={(e) => handleStatusChange(event, e.target.value)}
                    className="status-select"
                  >
                    <option value="PROXIMAMENTE">Próximamente</option>
                    <option value="EN_EJECUCION">En Ejecución</option>
                    <option value="FINALIZADO">Finalizado</option>
                  </select>
                </div>

                <div className="action-buttons">
                  <button
                    className="edit-button"
                    onClick={() => onEditEvent(event)}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteEvent(event)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
