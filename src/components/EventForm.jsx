// src/components/EventForm.jsx
import React, { useState, useEffect } from 'react';
import { eventService } from '../services/eventService';
import { groupService } from '../services/groupService';
import '../styles/EventForm.css';

const EventForm = ({ isEditing, eventData, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: '',
    groupName: '',
    description: ''
  })

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Tipos de eventos disponibles
  const eventTypes = [
    'CONFERENCIA',
    'TALLER',
    'CAPACITACION',
    'REUNIÓN',
    'ACTIVIDAD_COMUNITARIA',
    'EVENTO_AMBIENTAL',
    'OTRO'
  ];

  useEffect(() => {
    fetchGroups();
    if (isEditing && eventData) {
      setFormData({
        title: eventData.title || '',
        date: eventData.eventDate ? eventData.eventDate.split('T')[0] : '',
        type: eventData.eventType || '',
        groupName: eventData.groupName || '',
        description: eventData.description || ''
      });
    }
  }, [isEditing, eventData]);

  const fetchGroups = async () => {
    try {
      const groups = await groupService.getAllGroups();
      // El servicio ya retorna directamente el array de grupos
      setGroups(groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.title || !formData.date || !formData.type || !formData.groupName) {
        setError('Por favor, completa todos los campos requeridos');
        setLoading(false);
        return;
      }

      // Formatear la fecha y mapear los campos al formato esperado por el backend
      const eventRequestData = {
        title: formData.title,
        eventDate: new Date(formData.date).toISOString(),
        eventType: formData.type,
        groupName: formData.groupName,
        description: formData.description
      };

      let response;
      if (isEditing) {
        // Para edición, usar el endpoint de actualización
        response = await eventService.updateEventStatus(
          eventData.title, 
          eventData.groupName, 
          { status: 'PROXIMAMENTE' } // Mantener el estado actual o el que corresponda
        );
      } else {
        response = await eventService.createEvent(eventRequestData);
      }

      if (response.status === 200 || response.status === 201) {
        onSuccess();
        // Limpiar formulario
        setFormData({
          title: '',
          date: '',
          type: '',
          groupName: '',
          description: ''
        });
      } else {
        setError(response.message || 'Error al guardar el evento');
      }
    } catch (error) {
      setError('Error de conexión. Intenta de nuevo.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-form-container">
      <div className="event-form">
        <h3>{isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}</h3>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Título del Evento *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ingresa el título del evento"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Fecha del Evento *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Tipo de Evento *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona un tipo</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="groupName">Grupo *</label>
            <select
              id="groupName"
              name="groupName"
              value={formData.groupName}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona un grupo</option>
              {groups.map(group => (
                <option key={group.id} value={group.name}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción del evento (opcional)"
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="submit-button" 
              disabled={loading}
            >
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Evento')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
