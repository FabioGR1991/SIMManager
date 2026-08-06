import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Shield, ArrowRightLeft } from 'lucide-react';

const DEFAULT_TEAMS = ['Tokio', 'Roma', 'Madrid', 'Berlín', 'Buenos Aires'];

export default function TeamsView({ API_URL, token, onTeamsChange }) {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState(DEFAULT_TEAMS);
  const [selectedTeam, setSelectedTeam] = useState('Tokio');

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
        setTeams(res.data);
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
      <h2>Gestión de Equipos</h2>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>
        Organizá a los Team Leaders por ciudades. La información de SIMs y Dispositivos permanecerá vinculada al equipo.
      </p>

      {/* SELECTOR DE EQUIPO PREDOMINANTE */}
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
              <span>Equipo {team}</span>
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
        <h3 style={{ padding: '15px 0 5px 0', color: '#0f172a' }}>
          Integrantes del Equipo {selectedTeam}
        </h3>
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
                    Equipo {u.team || 'Tokio'}
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
    </div>
  );
}