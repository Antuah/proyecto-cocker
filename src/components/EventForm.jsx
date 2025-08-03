// src/components/EventForm.jsx
import React, { useState, useEffect } from 'react';
import { eventService } from '../services/eventService';
import typeService from '../services/typeService';
import '../styles/EventForm.css';

const EventForm = ({ isEditing, eventData, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    typeId: '',
    description: ''
  });

  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTypes();
    if (isEditing && eventData) {
      setFormData({
        title: eventData.title || '',
        date: eventData.eventDate ? eventData.eventDate.split('T')[0] : '',
        typeId: eventData.type?.id || '',
        description: eventData.description || ''
      });
    }
  }, [isEditing, eventData]);

  const fetchTypes = async () => {
    try {
      console.log('=== DEBUGGING TYPES FETCH ===');
      const token = localStorage.getItem('jwtToken');
      console.log('Token status:', {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        tokenStart: token ? token.substring(0, 20) + '...' : 'No token'
      });

      const typesData = await typeService.getAllTypes();
      console.log('Types fetched successfully:', typesData);
      console.log('Types data type:', typeof typesData);
      console.log('Types data structure:', JSON.stringify(typesData, null, 2));
      
      // Manejar diferentes formatos de respuesta del backend
      if (typesData && typesData.data && Array.isArray(typesData.data)) {
        console.log('Using typesData.data format, found', typesData.data.length, 'types');
        setTypes(typesData.data);
      } else if (typesData && Array.isArray(typesData)) {
        console.log('Using direct array format, found', typesData.length, 'types');
        setTypes(typesData);
      } else {
        console.error('Formato de respuesta inesperado para tipos:', typesData);
        console.log('Setting fallback types for debugging...');
        // Datos de fallback para debugging
        const fallbackTypes = [
          { id: 1, name: 'Conferencia' },
          { id: 2, name: 'Taller' },
          { id: 3, name: 'Seminario' },
          { id: 4, name: 'Evento Social' }
        ];
        setTypes(fallbackTypes);
        setError('Usando datos de prueba - revisa la consola para más detalles');
      }

      // Probar si el endpoint de eventos funciona para verificar autenticación
      try {
        const eventsTest = await eventService.getAllEvents();
        console.log('Events endpoint test (for auth verification):', eventsTest ? 'SUCCESS' : 'FAILED');
      } catch (authTestError) {
        console.warn('Events endpoint test failed (potential auth issue):', authTestError.message);
      }
    } catch (error) {
      console.error('Error fetching types:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Si hay error de autenticación, usar datos de fallback para debugging
      if (error.message.includes('403') || error.message.includes('401')) {
        console.log('Authentication error detected, using fallback data...');
        const fallbackTypes = [
          { id: 1, name: 'Conferencia' },
          { id: 2, name: 'Taller' },
          { id: 3, name: 'Seminario' },
          { id: 4, name: 'Evento Social' }
        ];
        setTypes(fallbackTypes);
        setError('Error de autenticación - revisa tu login. Usando datos de prueba.');
      } else {
        setTypes([]);
        setError('Error al cargar los tipos de eventos: ' + error.message);
      }
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
      // Verificar autenticación
      const token = localStorage.getItem('jwtToken');
      console.log('User authentication check:', {
        hasToken: !!token,
        tokenLength: token ? token.length : 0
      });

      if (!token) {
        setError('No estás autenticado. Por favor, inicia sesión nuevamente.');
        setLoading(false);
        return;
      }

      if (!formData.title || !formData.date || !formData.typeId) {
        setError('Por favor, completa todos los campos requeridos');
        setLoading(false);
        return;
      }

      console.log('Form data before submit:', formData);
      console.log('Available types:', types);

      // Formatear la fecha y mapear los campos al formato esperado por el backend
      const selectedType = types.find(type => type.id === parseInt(formData.typeId));
      
      const eventRequestData = {
        title: formData.title,
        eventDate: new Date(formData.date).toISOString(),
        eventType: selectedType?.name || '', // Enviar el NOMBRE del tipo, no el ID ni el objeto
        description: formData.description
      };

      console.log('Submitting event data:', eventRequestData);
      console.log('Selected type:', selectedType);

      let response;
      if (isEditing) {
        // Para edición, necesitaremos implementar el endpoint de actualización
        response = await eventService.updateEvent(eventData.eventId, eventRequestData);
      } else {
        response = await eventService.createEvent(eventRequestData);
      }

      console.log('Response:', response);

      if (response) {
        onSuccess();
        // Limpiar formulario
        setFormData({
          title: '',
          date: '',
          typeId: '',
          description: ''
        });
      } else {
        setError('Error al guardar el evento');
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
            <label htmlFor="typeId">Tipo de Evento *</label>
            <select
              id="typeId"
              name="typeId"
              value={formData.typeId}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona un tipo</option>
              {types.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
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
