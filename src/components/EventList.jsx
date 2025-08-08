// src/components/EventList.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { eventService } from '../services/eventService';
import { authService } from '../services/authService';
import '../styles/EventList.css';

const EventList = ({ onEditEvent, refreshTrigger }) => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState({}); // Para manejar el estado de asistencia de cada evento

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
  }, [events, statusFilter, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getAllEvents();
      
      // Debug: Vamos a ver qué está retornando el backend
      console.log('Respuesta del backend:', response);
      
      let eventsData = [];
      // El backend probablemente retorna {message: "...", data: [...], error: false}
      if (response && response.data && Array.isArray(response.data)) {
        eventsData = response.data;
      } else if (response && Array.isArray(response)) {
        // Si retorna directamente un array
        eventsData = response;
      } else {
        console.error('Formato de respuesta inesperado:', response);
        await Swal.fire({
          title: 'Error de formato',
          text: 'No se pudieron cargar los eventos - formato de respuesta inesperado',
          icon: 'error',
          confirmButtonText: 'Reintentar',
          confirmButtonColor: '#dc2626'
        });
        return;
      }

      setEvents(eventsData);

      // Verificar estado de asistencia para cada evento
      await checkAttendanceForAllEvents(eventsData);

    } catch (error) {
      await Swal.fire({
        title: 'Error de conexión',
        text: 'No se pudieron cargar los eventos. Verifica tu conexión.',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#dc2626'
      });
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
        (event.eventType && event.eventType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        event.creatorUsername.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const handleStatusChange = async (event, newStatus) => {
    try {
      console.log('Changing status for event:', event.title, 'to:', newStatus);
      
      const response = await eventService.updateEventStatus(
        event.title,
        event.creatorUsername,
        { status: newStatus }
      );

      console.log('Status update response:', response);

      // Verificar si la actualización fue exitosa
      if (response && (response.status === 200 || response.status === 204 || response.message)) {
        // Actualizar el evento en la lista local
        setEvents(prevEvents =>
          prevEvents.map(evt =>
            evt.title === event.title && evt.creatorUsername === event.creatorUsername
              ? { ...evt, status: newStatus }
              : evt
          )
        );
        
        await Swal.fire({
          title: '¡Estado actualizado!',
          text: 'El estado del evento ha sido actualizado exitosamente',
          icon: 'success',
          confirmButtonText: 'Continuar',
          confirmButtonColor: '#059669',
          timer: 2000,
          timerProgressBar: true
        });
      } else {
        console.error('Respuesta inesperada:', response);
        await Swal.fire({
          title: 'Error',
          text: 'Error al actualizar el estado del evento',
          icon: 'error',
          confirmButtonText: 'Reintentar',
          confirmButtonColor: '#dc2626'
        });
      }
    } catch (error) {
      console.error('Error updating event status:', error);
      await Swal.fire({
        title: 'Error de conexión',
        text: `Error al actualizar el estado del evento: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  // ==================== FUNCIONES PARA ASISTENCIA A EVENTOS ====================

  // Verificar estado de asistencia para todos los eventos
  const checkAttendanceForAllEvents = async (eventsData) => {
    try {
      console.log('Checking attendance for events:', eventsData.map(e => e.id));
      
      // Usar getMyAttendingEvents para obtener todos los eventos a los que asiste el usuario
      console.log('Calling getMyAttendingEvents...');
      const myAttendingResponse = await eventService.getMyAttendingEvents();
      console.log('My attending events response:', myAttendingResponse);
      
      // Extraer los eventos a los que asiste el usuario
      let attendingEvents = [];
      if (myAttendingResponse && myAttendingResponse.data && Array.isArray(myAttendingResponse.data)) {
        attendingEvents = myAttendingResponse.data;
        console.log('Found attending events in response.data');
      } else if (myAttendingResponse && Array.isArray(myAttendingResponse)) {
        attendingEvents = myAttendingResponse;
        console.log('Found attending events in response directly');
      } else {
        console.log('No attending events found, response structure:', myAttendingResponse);
        // Si no hay estructura reconocible, asumir que no hay eventos
        attendingEvents = [];
      }
      
      console.log('Events user is attending:', attendingEvents);
      
      // Crear un mapa de eventos a los que asiste (por ID)
      const attendingEventIds = new Set(attendingEvents.map(event => event.id));
      console.log('Attending event IDs:', Array.from(attendingEventIds));
      
      // Crear el mapa de estado de asistencia
      const newAttendanceStatus = {};
      eventsData.forEach(event => {
        newAttendanceStatus[event.id] = attendingEventIds.has(event.id);
      });
      
      console.log('Setting attendance status using getMyAttendingEvents:', newAttendanceStatus);
      setAttendanceStatus(newAttendanceStatus);
      
    } catch (error) {
      console.error('Error getting my attending events:', error);
      
      // En caso de error, establecer todos como no registrados
      console.log('Setting all events as not attending due to error');
      const newAttendanceStatus = {};
      eventsData.forEach(event => {
        newAttendanceStatus[event.id] = false;
      });
      setAttendanceStatus(newAttendanceStatus);
    }
  };

  // Manejar asistencia al evento (registrar o cancelar)
  const handleAttendance = async (event) => {
    const isCurrentlyRegistered = attendanceStatus[event.id] || false;
    console.log(`Current attendance status for event ${event.id}:`, isCurrentlyRegistered);
    
    try {
      if (isCurrentlyRegistered) {
        // Cancelar asistencia
        console.log('Canceling attendance for event:', event.id);
        await eventService.cancelAttendance(event.id);
        
        // Actualizar estado local
        setAttendanceStatus(prev => ({
          ...prev,
          [event.id]: false
        }));

        await Swal.fire({
          title: '¡Asistencia cancelada!',
          text: `Has cancelado tu asistencia al evento "${event.title}".`,
          icon: 'success',
          confirmButtonText: 'Continuar',
          confirmButtonColor: '#059669',
          timer: 3000,
          timerProgressBar: true
        });
      } else {
        // Registrar asistencia
        console.log('Registering attendance for event:', event.id);
        await eventService.registerAttendance(event.id);
        
        // Actualizar estado local
        setAttendanceStatus(prev => ({
          ...prev,
          [event.id]: true
        }));

        await Swal.fire({
          title: '¡Asistencia confirmada!',
          text: `Te has registrado para asistir al evento "${event.title}".`,
          icon: 'success',
          confirmButtonText: 'Continuar',
          confirmButtonColor: '#059669',
          timer: 3000,
          timerProgressBar: true
        });
      }
    } catch (error) {
      console.error('Error handling attendance:', error);
      
      // Manejar error 409 - Ya registrado
      if (error.message && error.message.includes('409')) {
        console.log('User is already registered - updating local state');
        // Si el error es 409, significa que ya está registrado
        setAttendanceStatus(prev => ({
          ...prev,
          [event.id]: true
        }));
        
        await Swal.fire({
          title: 'Ya estás registrado',
          text: `Ya estás registrado para asistir al evento "${event.title}". El estado se ha actualizado.`,
          icon: 'info',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#059669',
          timer: 3000,
          timerProgressBar: true
        });
      } else {
        await Swal.fire({
          title: 'Error',
          text: error.message || 'Error al actualizar la asistencia',
          icon: 'error',
          confirmButtonText: 'Reintentar',
          confirmButtonColor: '#dc2626'
        });
      }
    }
  };

  const handleDeleteEvent = async (event) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Esta acción eliminará el evento "${event.title}" permanentemente`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        console.log('Deleting event:', event.title);
        
        const response = await eventService.deleteEvent(event.title, event.creatorUsername);
        
        console.log('Delete response:', response);
        
        // Verificar si la eliminación fue exitosa
        if (response && (response.status === 200 || response.status === 204 || response.message)) {
          setEvents(prevEvents =>
            prevEvents.filter(evt =>
              !(evt.title === event.title && evt.creatorUsername === event.creatorUsername)
            )
          );
          
          await Swal.fire({
            title: '¡Eliminado!',
            text: 'El evento ha sido eliminado exitosamente',
            icon: 'success',
            confirmButtonText: 'Continuar',
            confirmButtonColor: '#059669',
            timer: 3000,
            timerProgressBar: true
          });
        } else {
          console.error('Respuesta inesperada:', response);
          await Swal.fire({
            title: 'Error',
            text: 'Error al eliminar el evento',
            icon: 'error',
            confirmButtonText: 'Reintentar',
            confirmButtonColor: '#dc2626'
          });
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        await Swal.fire({
          title: 'Error de conexión',
          text: `Error al eliminar el evento: ${error.message}`,
          icon: 'error',
          confirmButtonText: 'Reintentar',
          confirmButtonColor: '#dc2626'
        });
      }
    }
  };

  // ==================== FUNCIONES DE CONTROL DE ACCESO ====================

  // Verificar si el usuario es MEMBER
  const isMemberUser = () => {
    const result = authService.hasRole('member');
    console.log('Is member user:', result);
    return result;
  };

  // Verificar si el usuario puede gestionar eventos (ADMIN o ADMIN_GROUP)
  const canManageEvents = () => {
    const user = authService.getCurrentUser();
    const isAdmin = authService.hasRole('admin');
    const isAdminGroup = authService.hasRole('adminGroup');
    const result = isAdmin || isAdminGroup;
    
    console.log('EventList - Current user:', user);
    console.log('EventList - Has admin role:', isAdmin);
    console.log('EventList - Has adminGroup role:', isAdminGroup);
    console.log('EventList - Can manage events:', result);
    
    return result;
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
              placeholder="Buscar por título, tipo o creador..."
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
            <div key={`${event.title}-${event.creatorUsername}-${index}`} className="event-card">
              <div className="event-header">
                <h4 className="event-title">{event.title}</h4>
                <span className={`event-status ${statusColors[event.status]}`}>
                  {statusLabels[event.status] || event.status}
                </span>
              </div>

              <div className="event-details">
                <div className="event-detail">
                  <span className="detail-label">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Fecha:
                  </span>
                  <span className="detail-value">{formatDate(event.eventDate)}</span>
                </div>

                <div className="event-detail">
                  <span className="detail-label">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    Tipo:
                  </span>
                  <span className="detail-value">{event.eventType || 'Sin tipo'}</span>
                </div>

                <div className="event-detail">
                  <span className="detail-label">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Creador:
                  </span>
                  <span className="detail-value">{event.creatorUsername}</span>
                </div>

                {event.description && (
                  <div className="event-detail">
                    <span className="detail-label">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                      Descripción:
                    </span>
                    <span className="detail-value">{event.description}</span>
                  </div>
                )}
              </div>

              <div className="event-actions">
                {canManageEvents() ? (
                  // Vista para ADMIN y ADMIN_GROUP - pueden gestionar eventos
                  <>
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
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Editar
                      </button>
                      
                      <button
                        className={`attendance-button ${attendanceStatus[event.id] ? 'registered' : 'not-registered'}`}
                        onClick={() => handleAttendance(event)}
                        disabled={event.status === 'FINALIZADO'}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                          {attendanceStatus[event.id] ? (
                            // Icono para cancelar asistencia
                            <>
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                              <line x1="18" y1="8" x2="22" y2="12"/>
                              <line x1="22" y1="8" x2="18" y2="12"/>
                            </>
                          ) : (
                            // Icono para registrar asistencia
                            <>
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                              <line x1="19" y1="8" x2="19" y2="14"/>
                              <line x1="22" y1="11" x2="16" y2="11"/>
                            </>
                          )}
                        </svg>
                        {attendanceStatus[event.id] ? 'Cancelar Asistencia' : 'Asistir al Evento'}
                      </button>

                      <button
                        className="delete-button"
                        onClick={() => handleDeleteEvent(event)}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </>
                ) : isMemberUser() ? (
                  // Vista para MEMBER - solo pueden marcar asistencia
                  <div className="member-actions">
                    <button
                      className={`attendance-button ${attendanceStatus[event.id] ? 'registered' : 'not-registered'}`}
                      onClick={() => handleAttendance(event)}
                      disabled={event.status === 'FINALIZADO'}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        {attendanceStatus[event.id] ? (
                          // Icono para cancelar asistencia
                          <>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                            <line x1="18" y1="8" x2="22" y2="12"/>
                            <line x1="22" y1="8" x2="18" y2="12"/>
                          </>
                        ) : (
                          // Icono para registrar asistencia
                          <>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                            <line x1="19" y1="8" x2="19" y2="14"/>
                            <line x1="22" y1="11" x2="16" y2="11"/>
                          </>
                        )}
                      </svg>
                      {attendanceStatus[event.id] ? 'Cancelar Asistencia' : 'Asistir al Evento'}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
