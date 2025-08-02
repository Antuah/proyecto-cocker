// src/services/eventService.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const eventService = {
  // Crear un nuevo evento
  createEvent: async (eventData) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(eventData)
      });

      const data = await response.json();
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
      
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Data received from backend:', data);
      console.log('Data type:', typeof data);
      console.log('Is array:', Array.isArray(data));
      
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

  // Obtener evento por título y grupo
  getEventByTitleAndGroup: async (title, groupName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/find?title=${encodeURIComponent(title)}&groupName=${encodeURIComponent(groupName)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching event by title and group:', error);
      throw error;
    }
  },

  // Actualizar estado del evento
  updateEventStatus: async (title, groupName, statusData) => {
    try {
      const token = localStorage.getItem('jwtToken');
      console.log('Updating event status:', { title, groupName, statusData });
      
      const response = await fetch(`${API_BASE_URL}/api/events/update-status?title=${encodeURIComponent(title)}&groupName=${encodeURIComponent(groupName)}`, {
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
  deleteEvent: async (title, groupName) => {
    try {
      console.log('Deleting event:', { title, groupName });
      
      const response = await fetch(`${API_BASE_URL}/api/events/delete?title=${encodeURIComponent(title)}&groupName=${encodeURIComponent(groupName)}`, {
        method: 'DELETE'
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
  },

  // Obtener eventos por grupo y estado
  getEventsByGroupAndStatus: async (groupName, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/group/${encodeURIComponent(groupName)}/status/${status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching events by group and status:', error);
      throw error;
    }
  }
};

export default eventService;
