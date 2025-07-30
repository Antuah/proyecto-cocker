// src/components/GroupList.jsx
import React, { useState } from 'react';
import '../styles/GroupList.css';

const GroupList = ({ groups, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Filtrar grupos por término de búsqueda
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.municipio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.colonia.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ordenar grupos
  const sortedGroups = [...filteredGroups].sort((a, b) => {
    const aValue = a[sortField].toLowerCase();
    const bValue = b[sortField].toLowerCase();
    
    if (sortDirection === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (groups.length === 0) {
    return (
      <div className="group-list-container">
        <div className="empty-state">
          <h3>No hay grupos registrados</h3>
          <p>Comienza creando tu primer grupo usando el botón "Nuevo Grupo"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group-list-container">
      <div className="list-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar grupos por nombre, municipio o colonia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="results-count">
          Mostrando {sortedGroups.length} de {groups.length} grupos
        </div>
      </div>

      <div className="table-container">
        <table className="groups-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">
                Nombre {getSortIcon('name')}
              </th>
              <th onClick={() => handleSort('municipio')} className="sortable">
                Municipio {getSortIcon('municipio')}
              </th>
              <th onClick={() => handleSort('colonia')} className="sortable">
                Colonia {getSortIcon('colonia')}
              </th>
              <th>Usuarios</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedGroups.map(group => (
              <tr key={group.id}>
                <td className="group-name">{group.name}</td>
                <td>{group.municipio}</td>
                <td>{group.colonia}</td>
                <td className="users-count">
                  {group.users ? group.users.length : 0} usuarios
                </td>
                <td className="actions">
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={() => onEdit(group)}
                    title="Editar grupo"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => onDelete(group.id)}
                    title="Eliminar grupo"
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedGroups.length === 0 && searchTerm && (
        <div className="no-results">
          <p>No se encontraron grupos que coincidan con "{searchTerm}"</p>
          <button 
            className="btn btn-outline"
            onClick={() => setSearchTerm('')}
          >
            Limpiar búsqueda
          </button>
        </div>
      )}
    </div>
  );
};

export default GroupList;
