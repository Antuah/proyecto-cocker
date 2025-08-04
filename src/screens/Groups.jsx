// src/screens/Groups.jsx
import React, { useState, useEffect } from 'react';
import { groupService } from '../services/groupService';
import GroupForm from '../components/GroupForm';
import GroupList from '../components/GroupList';
import '../styles/Groups.css';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Cargar grupos al montar el componente
  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await groupService.getAllGroups();
      setGroups(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los grupos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (groupData) => {
    try {
      await groupService.createGroup(groupData);
      setSuccessMessage('Grupo creado exitosamente');
      setShowForm(false);
      loadGroups();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error al crear el grupo');
      console.error('Error:', err);
    }
  };

  const handleUpdateGroup = async (groupData) => {
    try {
      await groupService.updateGroup(editingGroup.id, groupData);
      setSuccessMessage('Grupo actualizado exitosamente');
      setEditingGroup(null);
      setShowForm(false);
      loadGroups();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error al actualizar el grupo');
      console.error('Error:', err);
    }
  };

  const handleDeleteGroup = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este grupo?')) {
      try {
        await groupService.deleteGroup(id);
        setSuccessMessage('Grupo eliminado exitosamente');
        loadGroups();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError('Error al eliminar el grupo');
        console.error('Error:', err);
      }
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingGroup(null);
  };

  const handleNewGroup = () => {
    setEditingGroup(null);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="groups-container">
        <div className="groups-wrapper">
          <div className="loading">Cargando grupos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="groups-container">
      <div className="groups-wrapper">
        <div className="groups-header">
          <h2>
            <div className="groups-header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
            </div>
            Gestión de Grupos
          </h2>
          <button 
            className="btn btn-primary"
            onClick={handleNewGroup}
            disabled={showForm}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{height: '1rem', width: '1rem'}}>
              <path d="M12 5v14m7-7H5"/>
            </svg>
            Nuevo Grupo
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <div className="groups-content">
          {showForm && (
            <GroupForm
              group={editingGroup}
              onSubmit={editingGroup ? handleUpdateGroup : handleCreateGroup}
              onCancel={handleCancelForm}
            />
          )}

          <GroupList
            groups={groups}
            onEdit={handleEditGroup}
            onDelete={handleDeleteGroup}
          />
        </div>
      </div>
    </div>
  );
};

export default Groups;
