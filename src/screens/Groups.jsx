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
        <div className="loading">Cargando grupos...</div>
      </div>
    );
  }

  return (
    <div className="groups-container">
      <div className="groups-header">
        <h2>Gestión de Grupos</h2>
        <button 
          className="btn btn-primary"
          onClick={handleNewGroup}
          disabled={showForm}
        >
          Nuevo Grupo
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

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
  );
};

export default Groups;
