// src/components/EventTypes.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { typeService } from '../services/typeService';
import { useAuth } from '../hooks/useAuth';
import TypeForm from './TypeForm';
import TypeList from './TypeList';
import '../styles/EventTypes.css';

const EventTypes = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAdmin, isAdminGroup } = useAuth();

  // Función para verificar si el usuario puede gestionar tipos (ADMIN y ADMINGROUP)
  const canManageTypes = () => {
    return isAdmin() || isAdminGroup();
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      setLoading(true);
      const data = await typeService.getAllTypes();
      console.log('Types loaded:', data);
      
      // Manejar diferentes formatos de respuesta del backend
      if (data && data.data && Array.isArray(data.data)) {
        setTypes(data.data);
      } else if (Array.isArray(data)) {
        setTypes(data);
      } else {
        console.warn('Formato de datos inesperado:', data);
        setTypes([]);
      }
    } catch (err) {
      await Swal.fire({
        title: 'Error de conexión',
        text: 'No se pudieron cargar los tipos de eventos. Verifica tu conexión.',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#dc2626'
      });
      console.error('Error loading types:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateType = async (typeData) => {
    try {
      await typeService.createType(typeData);
      await Swal.fire({
        title: '¡Éxito!',
        text: 'Tipo de evento creado exitosamente',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#059669',
        timer: 3000,
        timerProgressBar: true
      });
      setShowForm(false);
      loadTypes();
    } catch (err) {
      await Swal.fire({
        title: 'Error',
        text: 'Error al crear el tipo de evento',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#dc2626'
      });
      console.error('Error creating type:', err);
    }
  };

  const handleUpdateType = async (typeData) => {
    try {
      await typeService.updateType(editingType.id, typeData);
      await Swal.fire({
        title: '¡Actualizado!',
        text: 'Tipo de evento actualizado exitosamente',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#059669',
        timer: 3000,
        timerProgressBar: true
      });
      setShowForm(false);
      setEditingType(null);
      loadTypes();
    } catch (err) {
      await Swal.fire({
        title: 'Error',
        text: 'Error al actualizar el tipo de evento',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#dc2626'
      });
      console.error('Error updating type:', err);
    }
  };

  const handleDeleteType = async (typeId) => {
    try {
      await typeService.deleteType(typeId);
      await Swal.fire({
        title: '¡Eliminado!',
        text: 'Tipo de evento eliminado exitosamente',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#059669',
        timer: 3000,
        timerProgressBar: true
      });
      loadTypes();
    } catch (err) {
      await Swal.fire({
        title: 'Error',
        text: 'Error al eliminar el tipo de evento',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#dc2626'
      });
      console.error('Error deleting type:', err);
    }
  };

  const handleEditType = (type) => {
    setEditingType(type);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingType(null);
  };

  const handleFormSubmit = (typeData) => {
    if (editingType) {
      return handleUpdateType(typeData);
    } else {
      return handleCreateType(typeData);
    }
  };

  const filteredTypes = types.filter(type =>
    type.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="event-types-container">
      <div className="event-types-header">
        <div className="header-content">
          <h2>Tipos de Eventos</h2>
          <p>Gestiona los diferentes tipos de eventos disponibles en el sistema</p>
        </div>
        
        <div className="header-actions">
          <div className="search-container">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar tipos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          {canManageTypes() && (
            <button
              onClick={() => setShowForm(true)}
              className="create-button"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nuevo Tipo
            </button>
          )}
        </div>
      </div>

      <div className="types-content">
        <TypeList
          types={filteredTypes}
          onEdit={canManageTypes() ? handleEditType : null}
          onDelete={canManageTypes() ? handleDeleteType : null}
          loading={loading}
        />
      </div>

      {showForm && (
        <TypeForm
          onSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
          initialData={editingType}
          isEditing={!!editingType}
        />
      )}
    </div>
  );
};

export default EventTypes;
