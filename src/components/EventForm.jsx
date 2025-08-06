// src/components/EventForm.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
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

  useEffect(() => {
    fetchTypes();
  }, []);

  useEffect(() => {
    if (isEditing && eventData && types.length > 0) {
      // Buscar el tipo correcto basado en el nombre del evento
      let selectedTypeId = '';
      
      if (eventData.eventType) {
        // Buscar por nombre del tipo
        const matchingType = types.find(type => 
          type.name === eventData.eventType || 
          type.name.toLowerCase() === eventData.eventType.toLowerCase()
        );
        selectedTypeId = matchingType ? matchingType.id.toString() : '';
      } else if (eventData.type && eventData.type.id) {
        // Si tiene el objeto tipo completo
        selectedTypeId = eventData.type.id.toString();
      } else if (eventData.typeId) {
        // Si tiene typeId directamente
        selectedTypeId = eventData.typeId.toString();
      }

      setFormData({
        title: eventData.title || '',
        date: eventData.eventDate ? eventData.eventDate.split('T')[0] : '',
        typeId: selectedTypeId,
        description: eventData.description || ''
      });
    }
  }, [isEditing, eventData, types]);

  const fetchTypes = async () => {
    try {
      const typesData = await typeService.getAllTypes();
      
      // Manejar diferentes formatos de respuesta del backend
      if (typesData && typesData.data && Array.isArray(typesData.data)) {
        setTypes(typesData.data);
      } else if (typesData && Array.isArray(typesData)) {
        setTypes(typesData);
      } else {
        // Datos de fallback para debugging
        const fallbackTypes = [
          { id: 1, name: 'Conferencia' },
          { id: 2, name: 'Taller' },
          { id: 3, name: 'Seminario' },
          { id: 4, name: 'Evento Social' }
        ];
        setTypes(fallbackTypes);
        
        await Swal.fire({
          title: 'Datos de prueba',
          text: 'Usando datos de prueba - revisa la consola para más detalles',
          icon: 'info',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#059669'
        });
      }
    } catch (error) {
      // Si hay error de autenticación, usar datos de fallback para debugging
      if (error.message.includes('403') || error.message.includes('401')) {
        const fallbackTypes = [
          { id: 1, name: 'Conferencia' },
          { id: 2, name: 'Taller' },
          { id: 3, name: 'Seminario' },
          { id: 4, name: 'Evento Social' }
        ];
        setTypes(fallbackTypes);
        
        await Swal.fire({
          title: 'Error de autenticación',
          text: 'Error de autenticación - revisa tu login. Usando datos de prueba.',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#059669'
        });
      } else {
        setTypes([]);
        
        await Swal.fire({
          title: 'Error al cargar tipos',
          text: 'Error al cargar los tipos de eventos: ' + error.message,
          icon: 'error',
          confirmButtonText: 'Reintentar',
          confirmButtonColor: '#dc2626'
        });
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

    try {
      // Verificar autenticación
      const token = localStorage.getItem('jwtToken');

      if (!token) {
        await Swal.fire({
          title: 'Sesión expirada',
          text: 'No estás autenticado. Por favor, inicia sesión nuevamente.',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#059669'
        });
        setLoading(false);
        return;
      }

      if (!formData.title || !formData.date || !formData.typeId) {
        await Swal.fire({
          title: 'Campos incompletos',
          text: 'Por favor, completa todos los campos requeridos',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#059669'
        });
        setLoading(false);
        return;
      }

      // Formatear la fecha y mapear los campos al formato esperado por el backend
      const selectedType = types.find(type => type.id === parseInt(formData.typeId));
      
      const eventRequestData = {
        title: formData.title,
        eventDate: new Date(formData.date).toISOString(),
        eventType: selectedType?.name || '', // Enviar el NOMBRE del tipo, no el ID ni el objeto
        description: formData.description
      };

      let response;
      if (isEditing) {
        // Para edición, usar el ID del evento
        const eventId = eventData.id || eventData.eventId;
        
        if (!eventId) {
          await Swal.fire({
            title: 'Error',
            text: 'No se pudo identificar el evento a editar',
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#dc2626'
          });
          setLoading(false);
          return;
        }
        
        response = await eventService.updateEvent(eventId, eventRequestData);
      } else {
        response = await eventService.createEvent(eventRequestData);
      }

      if (response) {
        await Swal.fire({
          title: '¡Éxito!',
          text: isEditing ? 'Evento actualizado exitosamente' : 'Evento creado exitosamente',
          icon: 'success',
          confirmButtonText: 'Continuar',
          confirmButtonColor: '#059669',
          timer: 3000,
          timerProgressBar: true
        });
        
        onSuccess();
        // Limpiar formulario
        setFormData({
          title: '',
          date: '',
          typeId: '',
          description: ''
        });
      } else {
        await Swal.fire({
          title: 'Error',
          text: 'Error al guardar el evento',
          icon: 'error',
          confirmButtonText: 'Reintentar',
          confirmButtonColor: '#dc2626'
        });
      }
    } catch (error) {
      await Swal.fire({
        title: 'Error de conexión',
        text: 'Error de conexión. Intenta de nuevo.',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#dc2626'
      });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-form-container">
      <div className="event-form">
        <h3>
          <div className="form-title-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
              <path d="M10 14l2 2 4-4"/>
            </svg>
          </div>
          {isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              Título del Evento *
            </label>
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
            <label htmlFor="date">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Fecha del Evento *
            </label>
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
            <label htmlFor="typeId">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              Tipo de Evento *
            </label>
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
            <label htmlFor="description">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              Descripción
            </label>
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
