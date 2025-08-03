// src/services/eventService.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const eventService = {
  // Crear un nuevo evento
  createEvent: async (eventData) => {
    try {
      const token = localStorage.getItem('jwtToken');
      console.log('Creating event with data:', eventData);
      console.log('API URL:', `${API_BASE_URL}/api/events`);
      console.log('JWT Token present:', !!token);
      console.log('JWT Token value:', token ? token.substring(0, 50) + '...' : 'No token');
      
      // Verificar que el token no esté vacío y tenga el formato correcto
      if (!token || token.trim() === '') {
        throw new Error('No authentication token found');
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`
      };

      console.log('Request headers:', headers);
      console.log('Request body:', JSON.stringify(eventData, null, 2));
      
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(eventData)
      });

      console.log('Create event response status:', response.status);
      console.log('Create event response ok:', response.ok);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        console.error('Full response details:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Event created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Obtener todos los eventos
  getAllEvents: async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      console.log('Token disponible:', !!token);
      console.log('URL completa:', `${API_BASE_URL}/api/events`);
      console.log('Token for GET events:', token ? token.substring(0, 50) + '...' : 'No token');
      
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      console.log('GET Events - Response status:', response.status);
      console.log('GET Events - Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('GET Events - Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Data received from backend:', data);
      
      return data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Obtener eventos próximos
  getUpcomingEvents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/upcoming`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  },

  // Obtener eventos por estatus
  getEventsByStatus: async (status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/status/${status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching events by status:', error);
      throw error;
    }
  },

  // Obtener eventos por creador
  getEventsByCreator: async (creatorUsername) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/creator/${encodeURIComponent(creatorUsername)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching events by creator:', error);
      throw error;
    }
  },

  // Obtener eventos por tipo
  getEventsByType: async (typeName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/type/${encodeURIComponent(typeName)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching events by type:', error);
      throw error;
    }
  },

  // Obtener evento por título y creador
  getEventByTitleAndCreator: async (title, creatorUsername) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/find?title=${encodeURIComponent(title)}&creatorUsername=${encodeURIComponent(creatorUsername)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching event by title and creator:', error);
      throw error;
    }
  },

  // Obtener mis eventos (eventos del usuario autenticado)
  getMyEvents: async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`${API_BASE_URL}/api/events/my-events`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching my events:', error);
      throw error;
    }
  },

  // Actualizar evento completo
  updateEvent: async (eventId, eventData) => {
    try {
      const token = localStorage.getItem('jwtToken');
      console.log('Updating event with ID:', eventId);
      console.log('Update data:', eventData);
      
      if (!token || token.trim() === '') {
        throw new Error('No authentication token found');
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`
      };

      console.log('Update request headers:', headers);
      console.log('Update request body:', JSON.stringify(eventData, null, 2));
      
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(eventData)
      });

      console.log('Update event response status:', response.status);
      console.log('Update event response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Event updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  // Actualizar estado del evento
  updateEventStatus: async (title, creatorUsername, statusData) => {
    try {
      const token = localStorage.getItem('jwtToken');
      console.log('Updating event status:', { title, creatorUsername, statusData });
      
      const response = await fetch(`${API_BASE_URL}/api/events/update-status?title=${encodeURIComponent(title)}&creatorUsername=${encodeURIComponent(creatorUsername)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(statusData)
      });

      console.log('Update response status:', response.status);
      console.log('Update response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      // Verificar si hay contenido en la respuesta
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      if (responseText.trim() === '') {
        // Si la respuesta está vacía, asumir que fue exitosa
        return { status: response.status, message: 'Estado actualizado correctamente' };
      }
      
      try {
        const data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
        return data;
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        // Si no se puede parsear, pero la respuesta fue exitosa, retornar status
        return { status: response.status, message: 'Estado actualizado correctamente' };
      }
    } catch (error) {
      console.error('Error updating event status:', error);
      throw error;
    }
  },

  // Eliminar evento
  deleteEvent: async (title, creatorUsername) => {
    try {
      const token = localStorage.getItem('jwtToken');
      console.log('Deleting event:', { title, creatorUsername });
      
      const response = await fetch(`${API_BASE_URL}/api/events/delete?title=${encodeURIComponent(title)}&creatorUsername=${encodeURIComponent(creatorUsername)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      // Verificar si hay contenido en la respuesta
      const responseText = await response.text();
      console.log('Delete response text:', responseText);
      
      if (responseText.trim() === '') {
        // Si la respuesta está vacía, asumir que fue exitosa
        return { status: response.status, message: 'Evento eliminado correctamente' };
      }
      
      try {
        const data = JSON.parse(responseText);
        console.log('Parsed delete response data:', data);
        return data;
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        // Si no se puede parsear, pero la respuesta fue exitosa, retornar status
        return { status: response.status, message: 'Evento eliminado correctamente' };
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
};

export default eventService;
