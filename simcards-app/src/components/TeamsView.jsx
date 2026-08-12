import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Shield, ArrowRightLeft, Plus, X, Pencil } from 'lucide-react';

const DEFAULT_TEAMS = ['Tokio', 'Roma', 'Madrid', 'Berlín', 'Buenos Aires'];

export default function TeamsView({ API_URL, token, onTeamsChange }) {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState(DEFAULT_TEAMS);
  const [selectedTeam, setSelectedTeam] = useState('Tokio');

  // Estados para el Modal de Crear Equipo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para el Modal de Editar/Renombrar Equipo
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTeamName, setEditTeamName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  // Obtener la lista dinámica de equipos desde el backend
  const fetchTeams = async () => {
    try {
      const res = await axios.get(`${API_URL}/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.length > 0) {
        // Soporta respuesta array de strings o array de objetos { id, name }
        const teamList = res.data.map(t => typeof t === 'object' ? t.name : t);
        setTeams(teamList);
      }
    } catch (err) {
      console.error('Error al cargar la lista de equipos:', err);
    }
  };

  // Obtener usuarios
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  };

  // Crear un nuevo equipo en el Backend
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    const formattedName = newTeamName.trim();
    if (!formattedName) return;

    setIsSubmitting(true);
    try {
      await axios.post(
        `${API_URL}/teams`,
        { name: formattedName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Limpiar y cerrar modal
      setNewTeamName('');
      setIsModalOpen(false);

      // Refrescar lista de equipos y seleccionar el recién creado
      await fetchTeams();
      setSelectedTeam(formattedName);

      // Notificar cambio al componente padre (App.jsx / Sidebar)
      if (typeof onTeamsChange === 'function') {
        onTeamsChange();
      }
    } catch (err) {
      console.error('Error al crear el equipo:', err);
      alert(err.response?.data?.error || 'Error al crear el equipo. Inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renombrar equipo existente
  const handleRenameTeam = async (e) => {
    e.preventDefault();
    const formattedName = editTeamName.trim();

    if (!formattedName || formattedName === selectedTeam) {
      setIsEditModalOpen(false);
      return;
    }

    // Popup de advertencia/confirmación
    const confirmRename = window.confirm(
      `⚠️ ¿ESTÁS SEGURO DE RENOMBRAR EL EQUIPO?\n\n` +
      `Vas a cambiar el nombre de "${selectedTeam}" a "${formattedName}".\n\n` +
      `Esta acción actualizará automáticamente todas las referencias asociadas:\n` +
      `• Usuarios y Team Leaders\n` +
      `• Tarjetas SIM\n` +
      `• Dispositivos\n` +
      `• Operadores`
    );

    if (!confirmRename) return;

    setIsRenaming(true);
    try {
      await axios.put(
        `${API_URL}/teams/rename`,
        { oldName: selectedTeam, newName: formattedName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsEditModalOpen(false);
      setSelectedTeam(formattedName);

      await fetchTeams();
      await fetchUsers();

      if (typeof onTeamsChange === 'function') {
        onTeamsChange();
      }
    } catch (err) {
      console.error('Error al renombrar el equipo:', err);
      alert(err.response?.data?.error || 'Error al renombrar el equipo. Inténtalo nuevamente.');
    } finally {
      setIsRenaming(false);
    }
  };

  // Manejar el cambio de equipo de un usuario
  const handleTeamChange = async (userId, newTeam) => {
    try {
      await axios.put(
        `${API_URL}/users/${userId}`,
        { team: newTeam },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Actualizar localStorage si el usuario reasignado es el mismo que tiene la sesión activa
      try {
        const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (loggedUser && loggedUser.id === userId) {
          const updatedUser = { ...loggedUser, team: newTeam };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          window.location.reload(); // Recargar para forzar actualización del Sidebar
          return;
        }
      } catch (e) {
        console.error('Error al actualizar la sesión local:', e);
      }

      // Re-obtener datos locales
      await fetchUsers();
      await fetchTeams();

      // Notificar al componente superior (App.jsx) si se proporcionó la prop
      if (typeof onTeamsChange === 'function') {
        onTeamsChange();
      }
    } catch (err) {
      console.error('Error al reasignar usuario:', err);
      alert('Error al reasignar usuario de equipo');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* HEADER DE LA SECCIÓN */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px' }}>Gestión de Equipos</h2>
          <p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '14px' }}>
            Organizá a los Team Leaders por ciudades. La información de SIMs y Dispositivos permanecerá vinculada al equipo.
          </p>
        </div>

        {/* BOTÓN MÁS CREAR EQUIPO */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn"
          style={{
            width: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '9px 16px',
            borderRadius: '6px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <Plus size={18} /> Crear Equipo
        </button>
      </div>

      {/* SELECTOR DE EQUIPOS (BADGES/BOTONES) */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
        {teams.map((team) => {
          const count = users.filter(u => u.team === team).length;
          const isActive = selectedTeam === team;
          return (
            <button
              key={team}
              onClick={() => setSelectedTeam(team)}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: isActive ? '2px solid #0284c7' : '1px solid #cbd5e1',
                backgroundColor: isActive ? '#e0f2fe' : '#fff',
                color: isActive ? '#0369a1' : '#334155',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{team}</span>
              <span style={{
                backgroundColor: isActive ? '#0284c7' : '#94a3b8',
                color: '#fff',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '12px'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TABLA DE INTEGRANTES DEL EQUIPO SELECCIONADO */}
      <div className="table-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0 10px 0', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ color: '#0f172a', margin: 0 }}>
            Integrantes del Equipo: <strong>{selectedTeam}</strong>
          </h3>
          
          <button
            type="button"
            onClick={() => {
              setEditTeamName(selectedTeam);
              setIsEditModalOpen(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#334155',
              fontWeight: '600'
            }}
          >
            <Pencil size={14} /> Editar Nombre
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>NOMBRE</th>
              <th>EMAIL</th>
              <th>ROL</th>
              <th>EQUIPO ACTUAL</th>
              <th>REASIGNAR EQUIPO</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter(u => (u.team || 'Tokio') === selectedTeam)
              .map((u) => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td style={{ fontWeight: 'bold' }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="status-badge badge-activo">
                      {u.role}
                    </span>
                  </td>
                  <td style={{ fontWeight: '600', color: '#0369a1' }}>
                    {u.team || 'Tokio'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ArrowRightLeft size={16} color="#64748b" />
                      <select
                        value={u.team || 'Tokio'}
                        onChange={(e) => handleTeamChange(u.id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px'
                        }}
                      >
                        {teams.map(t => (
                          <option key={t} value={t}>Mover a {t}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            {users.filter(u => (u.team || 'Tokio') === selectedTeam).length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                  No hay usuarios asignados actualmente al Equipo {selectedTeam}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FLOTANTE PARA CREAR EQUIPO */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '24px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Crear Nuevo Equipo</h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTeam}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                  Nombre del Equipo / Ciudad
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Monte Olimpo, Rosario, Sede Central..."
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  autoFocus
                  required
                  style={{ width: '100%', padding: '9px 12px', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn" 
                  style={{ width: 'auto', padding: '8px 18px', fontSize: '14px' }}
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Equipo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FLOTANTE PARA EDITAR / RENOMBRAR EQUIPO */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '24px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Renombrar Equipo</h3>
              <button 
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRenameTeam}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                  Nuevo nombre para "{selectedTeam}"
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  autoFocus
                  required
                  style={{ width: '100%', padding: '9px 12px', fontSize: '14px' }}
                />
              </div>

              <p style={{ fontSize: '12px', color: '#dc2626', backgroundColor: '#fef2f2', padding: '8px 12px', borderRadius: '6px', marginBottom: '20px' }}>
                ⚠️ Al guardar se abrirá un mensaje de confirmación para actualizar en cascada todas las SIMs, dispositivos y usuarios asociados.
              </p>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isRenaming}
                  className="btn" 
                  style={{ width: 'auto', padding: '8px 18px', fontSize: '14px', backgroundColor: '#0284c7' }}
                >
                  {isRenaming ? 'Actualizando...' : 'Cambiar Nombre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}