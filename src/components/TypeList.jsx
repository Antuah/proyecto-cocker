// src/components/TypeList.jsx
import React from 'react';
import Swal from 'sweetalert2';
import '../styles/TypeList.css';

const TypeList = ({ types, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando tipos de eventos...</p>
      </div>
    );
  }

  if (!types || types.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-content">
          <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/>
          </svg>
          <h3>No hay tipos de eventos registrados</h3>
          <p>Comienza creando el primer tipo de evento.</p>
        </div>
      </div>
    );
  }

  const handleDelete = async (type) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará el tipo "${type.name}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      onDelete(type.id);
    }
  };

  return (
    <div className="type-list">
      <div className="type-grid">
        {types.map((type) => (
          <div key={type.id} className="type-card">
            <div className="type-card-header">
              <h3 className="type-name">{type.name}</h3>
              {(onEdit || onDelete) && (
                <div className="type-actions">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(type)}
                      className="action-button edit-button"
                      title="Editar tipo"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => handleDelete(type)}
                      className="action-button delete-button"
                      title="Eliminar tipo"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
            {type.description && (
              <div className="type-description">
                <p>{type.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TypeList;
