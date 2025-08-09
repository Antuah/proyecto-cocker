// src/screens/Groups.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { groupService } from '../services/groupService';
import { useAuth } from '../hooks/useAuth';
import GroupForm from '../components/GroupForm';
import GroupList from '../components/GroupList';
import '../styles/Groups.css';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const { isAdmin, isAdminGroup, isMember } = useAuth();

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await groupService.getAllGroups();
      setGroups(data);
    } catch (err) {
      await Swal.fire({
        title: 'Error de conexión',
        text: 'No se pudieron cargar los grupos. Verifica tu conexión.',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#dc2626'
      });
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar grupos al montar el componente
  useEffect(() => {
    loadGroups();
  }, []);

  // Verificar si el usuario puede gestionar grupos (solo ADMIN)
  const canManageGroups = () => {
    return isAdmin();
  };

  // Si no es ADMIN, mostrar mensaje de acceso restringido
  if (!isAdmin()) {
    return (
      <div className="groups-container">
        <div className="access-denied">
          <div className="access-denied-content">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <h2>Acceso Restringido</h2>
            <p>Solo los usuarios con rol de Administrador tienen acceso a la gestión de grupos.</p>
            <p>Contacta a un administrador si necesitas permisos adicionales.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateGroup = async (groupData) => {
    try {
      await groupService.createGroup(groupData);
      await Swal.fire({
        title: '¡Éxito!',
        text: 'Grupo creado exitosamente',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#059669',
        timer: 3000,
        timerProgressBar: true
      });
      setShowForm(false);
      loadGroups();
    } catch (err) {
      await Swal.fire({
        title: 'Error',
        text: 'Error al crear el grupo',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#dc2626'
      });
      console.error('Error:', err);
    }
  };

  const handleUpdateGroup = async (groupData) => {
    try {
      await groupService.updateGroup(editingGroup.id, groupData);
      await Swal.fire({
        title: '¡Actualizado!',
        text: 'Grupo actualizado exitosamente',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#059669',
        timer: 3000,
        timerProgressBar: true
      });
      setEditingGroup(null);
      setShowForm(false);
      loadGroups();
    } catch (err) {
      await Swal.fire({
        title: 'Error',
        text: 'Error al actualizar el grupo',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#dc2626'
      });
      console.error('Error:', err);
    }
  };

  const handleDeleteGroup = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el grupo permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await groupService.deleteGroup(id);
        await Swal.fire({
          title: '¡Eliminado!',
          text: 'El grupo ha sido eliminado exitosamente',
          icon: 'success',
          confirmButtonText: 'Continuar',
          confirmButtonColor: '#059669',
          timer: 3000,
          timerProgressBar: true
        });
        loadGroups();
      } catch (err) {
        await Swal.fire({
          title: 'Error',
          text: 'Error al eliminar el grupo',
          icon: 'error',
          confirmButtonText: 'Reintentar',
          confirmButtonColor: '#dc2626'
        });
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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
