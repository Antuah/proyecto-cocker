// src/services/typeService.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const typeService = {
  // Obtener todos los tipos de eventos
  getAllTypes: async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      console.log('Fetching event types...');
      
      const response = await fetch(`${API_BASE_URL}/api/types`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      console.log('Types response status:', response.status);
      console.log('Types response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      // Verificar si la respuesta está vacía o corrupta
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      if (!responseText || responseText.trim() === '') {
        console.warn('Empty response from types endpoint');
        throw new Error('Empty response from server');
      }

      try {
        const data = JSON.parse(responseText);
        console.log('Types data received:', data);
        return data;
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        console.error('Response text that failed to parse:', responseText.substring(0, 500) + '...');
        throw new Error('Invalid JSON response from server - possible circular reference issue');
      }
    } catch (error) {
      console.error('Error fetching types:', error);
      throw error;
    }
  },

  // Crear un nuevo tipo de evento
  createType: async (typeData) => {
    try {
      const token = localStorage.getItem('jwtToken');
      console.log('Creating type with data:', typeData);

      const response = await fetch(`${API_BASE_URL}/api/types`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(typeData)
      });

      console.log('Create type response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Type created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating type:', error);
      throw error;
    }
  },

  // Obtener tipo por ID
  getTypeById: async (id) => {
    try {
      const token = localStorage.getItem('jwtToken');
      
      const response = await fetch(`${API_BASE_URL}/api/types/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
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
      console.error('Error fetching type by ID:', error);
      throw error;
    }
  },

  // Obtener tipo por nombre
  getTypeByName: async (name) => {
    try {
      const token = localStorage.getItem('jwtToken');
      
      const response = await fetch(`${API_BASE_URL}/api/types/name/${encodeURIComponent(name)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
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
      console.error('Error fetching type by name:', error);
      throw error;
    }
  }
};

export default typeService;
